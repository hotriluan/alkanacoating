<?php

use Intervention\Image\ImageManagerStatic as Image;

require __DIR__ . '/../vendor/autoload.php';

$storagePath = __DIR__ . '/../storage/app/public/menus';
if (!is_dir($storagePath)) mkdir($storagePath, 0755, true);

try {
    // Create a 600x400 hero placeholder
    $hero = Image::canvas(600, 400, '#f3f4f6');
    $hero->text('Hero', 300, 200, function($font) {
        $font->file(1);
        $font->size(36);
        $font->color('#111827');
        $font->align('center');
        $font->valign('middle');
    });
    $hero->save($storagePath . '/hero_generated.png', 85);

    // Create a small icon 64x64
    $icon = Image::canvas(64, 64, '#c7d2fe');
    $icon->text('I', 32, 32, function($font) {
        $font->file(1);
        $font->size(28);
        $font->color('#1e293b');
        $font->align('center');
        $font->valign('middle');
    });
    $icon->save($storagePath . '/icon_generated.png', 85);

    // Thumbnails
    $hero->fit(300,300)->save($storagePath . '/thumb_hero_generated.png', 80);
    $icon->fit(32,32)->save($storagePath . '/thumb_icon_generated.png', 80);

    echo "Generated images OK\n";
} catch (Throwable $e) {
    echo "Generation error: " . $e->getMessage() . PHP_EOL;
}

// bootstrap laravel
$app = require __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$menu = App\Models\Menu::where('url','/san-pham')->first();
if (!$menu) {
    echo "Menu not found\n";
    exit(1);
}
$menu->update(['icon' => 'icon_generated.png', 'image' => 'hero_generated.png']);
print_r($menu->fresh()->toArray());
