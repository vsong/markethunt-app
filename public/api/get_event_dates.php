<?php
require_once($_SERVER['APPDIR'] . "/config/setup.php");
require_once($_SERVER['APPDIR'] . "/model/ItemModel.php");

ob_start();

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

$event_data = file_get_contents($_SERVER['APPDIR'] . "/templates/chart/event_dates.json");

echo $event_data;

ob_end_flush();