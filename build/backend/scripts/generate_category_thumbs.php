<?php
// Run this from backend folder: php scripts/generate_category_thumbs.php
// Requires composer autoload + Intervention Image

require __DIR__ . '/../vendor/autoload.php';

// Boot Laravel framework
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Category;
use Intervention\Image\ImageManagerStatic as Image;

$categories = Category::whereNotNull('image')->get();

foreach ($categories as $cat) {
    try {
        $imgPath = public_path($cat->image);
        if (!file_exists($imgPath)) {
            echo "File not found: {$imgPath}\n";
            continue;
        }
        $file = basename($cat->image);
        $thumbDir = public_path('uploads/categories/thumbs');
        if (!is_dir($thumbDir)) mkdir($thumbDir, 0755, true);

        // small (40x40)
        $img = Image::make($imgPath)->fit(40, 40);
        $img->save($thumbDir . '/small_' . $file);

        // medium (160x160)
        $img = Image::make($imgPath)->fit(160, 160);
        $img->save($thumbDir . '/medium_' . $file);

        echo "Generated thumbs for: {$file}\n";
    } catch (Exception $e) {
        echo "Error for {$cat->id}: " . $e->getMessage() . "\n";
    }
}

echo "Done.\n";
