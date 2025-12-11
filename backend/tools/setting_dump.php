<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    $settings = \App\Models\Setting::getGroup('about');
    echo "About settings:\n";
    print_r($settings);
    echo "\nAbout content raw:\n";
    echo ($settings['about_content'] ?? '[missing]') . "\n";
} catch (\Exception $e) {
    echo 'ERROR: ' . $e->getMessage() . PHP_EOL;
}
