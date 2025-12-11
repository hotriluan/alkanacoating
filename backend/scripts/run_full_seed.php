<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Manually require the seeder file so we don't rely on composer autoload regeneration
$seederFile = __DIR__ . '/../database/seeders/FullMockDataSeeder.php';
if (!file_exists($seederFile)) {
    echo "Seeder file not found: $seederFile\n";
    exit(1);
}
require_once $seederFile;

// Instantiate and run the seeder
$seeder = new \Database\Seeders\FullMockDataSeeder();
try {
    $seeder->run();
    echo "FullMockDataSeeder executed successfully.\n";
} catch (Exception $e) {
    echo "Seeder error: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString();
}

// Now print counts
require __DIR__ . '/db_counts.php';

return 0;
