<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    $db = $app->make('db');
    $name = $db->connection()->getDatabaseName();
    echo "DB: {$name}\n";
    $r = $db->select('SELECT 1 AS ok');
    echo "SELECT 1 => ";
    print_r($r);
    echo PHP_EOL;
} catch (\Exception $e) {
    echo 'ERROR: ' . $e->getMessage() . PHP_EOL;
}
