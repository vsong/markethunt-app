<?php
require_once($_SERVER['APPDIR'] . "/config/setup.php");
require_once($_SERVER['APPDIR'] . "/model/ItemModel.php");

echo $twig->render('watchlist.html', [
    'title' => 'Watchlist',
    'data' => getAllItemNamesAndLatestPrice(),
    'item_metadata' => getAllItemMetadata()
]);
