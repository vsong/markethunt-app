<?php
require_once($_SERVER['APPDIR'] . "/config/setup.php");
require_once($_SERVER['APPDIR'] . "/model/ItemModel.php");

ob_start();

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

if (filter_input(INPUT_GET, 'item_id', FILTER_VALIDATE_INT)) {
    $current_item_id = (int)$_GET['item_id'];
    if (!isValidItemId($current_item_id)) {
        echo '{"success":false}';
        die();
    }
} else {
    echo '{"success":false}';
    die();
}

$stock_data = [
    "success" => true,
    "item_id" => $current_item_id,
    "data" => getItemChartData($current_item_id),
    "latest_sb_data" => getLatestItemPrice(114)[0],
];

echo json_encode($stock_data);
ob_end_flush();