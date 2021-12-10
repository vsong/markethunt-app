<?php
if ($_SERVER['APPENV'] === 'dev') {
    ini_set('display_errors', '1');
    ini_set('display_startup_errors', '1');
    error_reporting(E_ALL);
}

require_once($_SERVER['APPDIR'] . '/vendor/autoload.php');

use Twig\Loader\FilesystemLoader;
use Twig\Environment;

$loader = new FilesystemLoader($_SERVER['APPDIR'] . '/templates');
$twig = new Environment($loader, ['cache' => false]);