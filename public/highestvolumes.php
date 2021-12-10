<?php
require_once($_SERVER['APPDIR'] . "/config/setup.php");
require_once($_SERVER['APPDIR'] . "/model/ItemModel.php");

echo $twig->render('highestvolumes.html', [
    'title' => 'Highest volume items',
    'items' => getAllItemVolumes()
]);
