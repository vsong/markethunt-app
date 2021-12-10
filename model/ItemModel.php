<?php

require_once('Db.php');

abstract class measurementPeriod
{
    const DAY = "day";
    const WEEK = "week";
    const MONTH = "month";
    const QTR = "qtr";
    const YEAR = "year";
}

function getAllItemMetadata(): array
{
    $results = Db::getConnection()
        ->query("SELECT item_id, name FROM item_meta ORDER BY name ASC")
        ->fetchAll();

    return ($results === false) ? [] : $results;
}

function getItemName($item_id): string
{
    $result = Db::getConnection()
        ->query("SELECT name FROM item_meta WHERE item_id = $item_id")
        ->fetch();

    return ($result === false) ? "" : $result['name'];
}

function getItemChartData($item_id): array
{
    $results = [];
    $statement = Db::getConnection()
        ->query("SELECT
        date,
        raw_volume_day,
        price
      FROM
        `daily_volume` as dv RIGHT JOIN daily_price as dp USING (date, item_id)
      WHERE
        item_id = $item_id
      ORDER BY
        date ASC");

    foreach ($statement as $row) {
        array_push($results, array("date" => $row['date'], "volume" => $row['raw_volume_day'], "price" => $row['price']));
    }

    return $results;
}

function getAllItemVolumes($period = measurementPeriod::DAY): array
{
    $results = Db::getConnection()
        ->query("SELECT
        v.item_id,
        v.raw_volume_$period as volume,
        v.raw_volume_$period * p.price as gold_volume,
        i.name
    FROM
        (
        SELECT
            item_id,
            DATE,
            raw_volume_$period,
            RANK() OVER(
            PARTITION BY item_id
        ORDER BY
            DATE
        DESC
        ) daterank
    FROM
        daily_volume) AS v
        LEFT JOIN item_meta i USING(item_id)
        LEFT JOIN daily_price p USING(item_id, date)
        WHERE
            daterank = 1
        ORDER BY
            gold_volume
        DESC")->fetchAll();

    return $results;
}

function getTopMovers(string $from, string $to, int $volume_limit, bool $get_winners = true, int $limit = 50): array {
    if ($get_winners) {
        $order = 'DESC';
        $cutoff = '>= 10';
    } else {
        $order = 'ASC';
        $cutoff = '<= -10';
    }

    $query = "SELECT * FROM (
        SELECT     
                item_meta.name,
                latest.item_id,
                latest.latest_price,
                latest.latest_date,
                past.past_price,
                past.past_date,
                cast( latest.latest_price / past.past_price * 100 - 100 AS int ) AS change_pct,
                v.gold_volume,
                v.trade_volume
        FROM       
                (SELECT   item_id,
                        price latest_price,
                        date latest_date,
                        rank() over( partition BY item_id ORDER BY date DESC ) daterank
                FROM     `daily_price`
                WHERE    date <= '$to') AS latest
        INNER JOIN
                (SELECT   item_id,
                        price past_price,
                        date past_date,
                        rank() over( partition BY item_id ORDER BY date ASC ) daterank
                FROM     `daily_price`
                WHERE    date >= '$from') AS past
        USING      (item_id, daterank)
        LEFT JOIN  item_meta
        USING      (item_id)
        LEFT JOIN
                (SELECT   daily_volume.item_id,
                        raw_volume_day as trade_volume,
                        raw_volume_day * price as gold_volume,
                        rank() over( partition BY item_id ORDER BY date DESC ) daterank
                FROM     `daily_volume` LEFT JOIN daily_price USING (item_id, date)
                WHERE raw_volume_day > 0) AS v
        ON         latest.item_id = v.item_id
        WHERE      latest.daterank = 1
        AND        v.daterank = 1
        AND        v.gold_volume >= $volume_limit
        ORDER BY   change_pct $order, v.gold_volume DESC, latest.item_id ASC
        LIMIT      $limit) AS tbl
    WHERE change_pct $cutoff";

    $results = Db::getConnection()->query($query)->fetchAll();
    return ($results === false) ? [] : $results;
}

function isValidItemId($item_id)
{
    $result = Db::getConnection()
        ->query("SELECT item_id FROM item_meta WHERE item_id = $item_id")
        ->fetch();

    return ($result === false) ? false : true;
}