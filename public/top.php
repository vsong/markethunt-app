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
        $from = validateISODate($_GET['from'] ?? '', 
            '2000-01-01', 
            '2000-01-01', 
            null);
        $to = validateISODate($_GET['to'] ?? '', 
            date_create()->modify('-1 day')->format('Y-m-d'), 
            null, 
            date_create()->modify('-1 day')->format('Y-m-d'));

        if (!isValidISODateRange($from, $to)) {
            throw new Exception("The 'from' date is larger than or equal to 'to' date");
        }

        $date_range = compact('from', 'to');
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
