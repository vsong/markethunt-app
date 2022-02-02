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

function getItemName($item_id): string
{
    $result = Db::getConnection()
        ->query("SELECT name FROM item_meta WHERE item_id = $item_id")
        ->fetch();

    return ($result === false) ? "" : $result['name'];
}

function getAllItemNamesAndLatestPrice(): array
{
    $results = [];

    $statement = Db::getConnection()
        ->query("WITH
        latest_prices AS (
        SELECT
            item_id,
            DATE,
            price
        FROM `daily_price` p
        RIGHT JOIN (
            SELECT
                MAX(DATE) AS DATE,
                item_id
            FROM daily_price
            GROUP BY item_id
        ) p2 USING(item_id, DATE)
    )
    SELECT
        m.item_id,
        m.name,
        p.price
    FROM item_meta m
    LEFT JOIN latest_prices p USING(item_id)
    ORDER BY m.name ASC;");

    foreach ($statement as $row) {
        // array_push($results, array("item_id" => $row['item_id'], "name" => $row['name'], "latest_price" => $row['price']));
        $results[$row['item_id']] = array("item_id" => $row['item_id'], "name" => $row['name'], "latest_price" => $row['price'] ?? 0);
    }

    return $results;
}

function getItemChartData($item_id): array
{
    $results = [];
    $statement = Db::getConnection()
        ->query("SELECT
        dp.date,
        raw_volume_day,
        dp.price,
        sbp.price AS sb_price,
        cast(dp.price / sbp.price as double) AS sbi
    FROM
        `daily_volume` AS dv
    RIGHT JOIN daily_price AS dp USING(DATE, item_id)
    LEFT JOIN daily_price sbp ON
        dp.date = sbp.date AND sbp.item_id = 114
    WHERE
        dp.item_id = $item_id
    ORDER BY
        DATE ASC");

    foreach ($statement as $row) {
        array_push($results, array(
            "date" => $row['date'], 
            "volume" => $row['raw_volume_day'], 
            "price" => $row['price'],
            "sb_index" => $row['sbi']));
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

/**
 * Retrieves cumulative volume data for each item in a specific date range
 *
 * @param string $from_date From datestring in ISO format
 * @param string $to_date To datestring in ISO format
 * @return array
 */
function getCumulativeVolume(string $from_date, string $to_date): array
{
    $results = Db::getConnection()
        ->query("WITH dgv as 
        (
            SELECT
                p.item_id,
                p.date,
                p.price * v.raw_volume_day as goldvol,
                v.raw_volume_day as tradevol 
            FROM
                `daily_price` p 
                LEFT JOIN
                    `daily_volume` v USING (item_id, date) 
            WHERE
                date >= '2021-12-01' 
            ORDER BY
                `item_id` DESC
        )
        SELECT
            dgv.item_id,
            sum(dgv.goldvol) as cum_goldvol,
            sum(dgv.tradevol) as cum_tradevol,
            i.name 
        FROM
            dgv 
            LEFT JOIN
                item_meta i USING (item_id) 
        WHERE
            dgv.date >= '$from_date'
            AND dgv.date <= '$to_date'
        GROUP BY
            item_id
        ORDER BY
            cum_goldvol DESC")->fetchAll();

    return $results;
}

function getTopMovers(string $from, string $to, int $volume_limit, bool $get_winners = true): array {
    if ($get_winners) {
        $order = 'DESC';
        $cutoff = '>= 1';
    } else {
        $order = 'ASC';
        $cutoff = '<= -1';
    }

    $query = "WITH
            latest AS (
            SELECT
                p1.item_id,
                p1.price latest_price,
                p1.date latest_date
            FROM
                `daily_price` p1
            RIGHT JOIN (
                SELECT
                    item_id,
                    MAX(DATE) AS DATE
                FROM daily_price
                    WHERE DATE >= '$from' AND DATE <= '$to'
                GROUP BY item_id
            ) p2 USING(item_id, DATE)
        ),
        past AS (
            SELECT
                p1.item_id,
                p1.price past_price,
                p1.DATE past_date
            FROM daily_price p1
            RIGHT JOIN (
                SELECT
                    item_id,
                    MIN(DATE) AS DATE
                FROM daily_price
                    WHERE DATE >= '$from' AND DATE <= '$to'
                GROUP BY item_id
            ) p2 USING(item_id, DATE)
        ),
        latest_volumes AS (
            SELECT
                dv.item_id,
                dv.raw_volume_day AS trade_volume,
                latest_dv.date
            FROM daily_volume dv
            RIGHT JOIN (
                SELECT
                    MAX(DATE) AS DATE,
                    item_id
                FROM daily_volume
                    WHERE raw_volume_day > 0
                GROUP BY item_id
            ) latest_dv USING(item_id, DATE)
        )
        SELECT * FROM (
            SELECT
                item_meta.name,
                latest.item_id,
                latest.latest_price,
                latest.latest_date,
                past.past_price,
                past.past_date,
                CAST(
                    latest.latest_price / past.past_price * 100 - 100 AS INT
                ) AS change_pct,
                v.trade_volume * dp.price AS gold_volume,
                v.trade_volume
            FROM latest
            INNER JOIN past USING(item_id)
            LEFT JOIN item_meta USING(item_id)
            LEFT JOIN latest_volumes v USING(item_id)
            LEFT JOIN daily_price dp USING(item_id, date)
        ) AS tbl
        WHERE change_pct $cutoff AND gold_volume >= $volume_limit
        ORDER BY change_pct $order, name ASC;";

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