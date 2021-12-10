<?php
require_once($_SERVER['APPDIR'] . "/config/setup.php");
require_once($_SERVER['APPDIR'] . "/model/ItemModel.php");

function create_date_range(string $modify): array {
    return ['from'=>date_create()->modify('-1 day')->modify($modify)->format('Y-m-d'),
        'to'=>date_create()->modify('-1 day')->format('Y-m-d')];
}

$volume_limit = filter_input(INPUT_GET, 'volume_limit', 
    FILTER_VALIDATE_INT, 
    array("options" => array("min_range"=>0, "max_range"=>1000000000)));

if ($volume_limit === false || $volume_limit === null) {
    $volume_limit = 1000000;
}

// period offsets have 1 additional day because price/volume data is delayed 1 day.
$period = $_GET['period'] ?? 'custom';
if ($period === 'day') {
    $date_range = create_date_range('-1 day');
} else if ($period === 'week') {
    $date_range = create_date_range('-7 day');
} else if ($period === 'month') {
    $date_range = create_date_range('-1 month');
} else if ($period === 'qtr') {
    $date_range = create_date_range('-90 day');
} else if ($period === 'year') {
    $date_range = create_date_range('-1 year');
} else if ($period === 'custom') {
    try {
        // get date params
        foreach (['from', 'to'] as $get_param) {
            if (!isset($_GET[$get_param])) {
                throw new Exception("Missing parameter $get_param");
            }

            $parsed_date = date_parse_from_format('Y-m-d', $_GET[$get_param]);
            if ($parsed_date['error_count'] > 0 || !checkdate((int)$parsed_date['month'], (int)$parsed_date['day'], (int)$parsed_date['year'])) {
                throw new Exception("Bad '$get_param' parameter " . htmlspecialchars($_GET[$get_param]));
            }

            $date_range[$get_param] = date_create_from_format('Y-m-d', $_GET[$get_param]);
        }

        // verify date params
        if ($date_range['to'] > date_create()->modify('-1 day')) {
            $date_range['to'] = date_create()->modify('-1 day');
        }
        if ($date_range['from'] >= $date_range['to']) {
            throw new Exception("The 'from' date is larger than or equal to 'to' date");
        }
        if ($date_range['from'] < date_create('2000-01-01')) {
            throw new Exception("Date is out of range");
        }

        foreach ($date_range as $k=>$v) {
            $date_range[$k] = $v->format('Y-m-d');
        }
    } catch (Exception $e) {
        $date_range = create_date_range('-7 day');
    }
} else {
    $date_range = create_date_range('-7 day');
}

echo $twig->render('topmovers.html', [
    'title' => 'Top movers',
    'date_range' => $date_range,
    'volume_limit' => $volume_limit,
    'datasets' => [
        getTopMovers($date_range['from'], $date_range['to'], $volume_limit, true, 999),
        getTopMovers($date_range['from'], $date_range['to'], $volume_limit, false, 999)
    ],
]);
?>
