<?php
    require_once($_SERVER['APPDIR'] . "/config/setup.php");
    require_once($_SERVER['APPDIR'] . "/model/ItemModel.php");

    $default_item_id = 114; //SUPER|brie+

    if (filter_input(INPUT_GET, 'item_id', FILTER_VALIDATE_INT)) {
        $current_item_id = (int)$_GET['item_id'];
        if (!isValidItemId($current_item_id)) {
            $current_item_id = $default_item_id;
        }
    } else {
        $current_item_id = $default_item_id;
    }

    $current_item_name = getItemName($current_item_id);
    $jsdata = json_encode(getItemChartData($current_item_id));
    $jsdata = str_replace("},{", "},\n{", $jsdata); // make the html more readable

    echo $twig->render('mvp.html', [
        'current_item_id' => $current_item_id,
        'current_item_name' => $current_item_name,
        'item_metadata' => getAllItemMetadata(),
        'jsdata' => $jsdata
    ]);

?>
