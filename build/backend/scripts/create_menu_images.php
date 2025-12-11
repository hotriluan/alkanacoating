<?php

// Creates small sample images in storage/app/public/menus and updates the /san-pham menu record

use Intervention\Image\ImageManagerStatic as Image;

require __DIR__ . '/../vendor/autoload.php';

$storagePath = __DIR__ . '/../storage/app/public/menus';
if (!is_dir($storagePath)) mkdir($storagePath, 0755, true);

// Tiny 1x1 PNG base64 placeholder
$png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=';
file_put_contents($storagePath . '/icon_sample.png', base64_decode($png));
file_put_contents($storagePath . '/hero_sample.png', base64_decode($png));

try {
    Image::make($storagePath . '/hero_sample.png')->fit(300,300)->save($storagePath . '/thumb_hero_sample.png', 80);
    Image::make($storagePath . '/icon_sample.png')->fit(32,32)->save($storagePath . '/thumb_icon_sample.png', 80);
} catch (Throwable $e) {
    echo "Image creation error: " . $e->getMessage() . PHP_EOL;
}

// bootstrap the app to access Eloquent
$app = require __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$menu = App\Models\Menu::where('url', '/san-pham')->first();
if (!$menu) {
    echo "Menu /san-pham not found\n";
    exit(1);
}
$menu->update(['icon' => 'icon_sample.png', 'image' => 'hero_sample.png']);
echo json_encode($menu->fresh()->toArray(), JSON_PRETTY_PRINT);
