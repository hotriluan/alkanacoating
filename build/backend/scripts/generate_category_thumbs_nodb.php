<?php
// Run from backend folder: php scripts/generate_category_thumbs_nodb.php
// Uses Intervention Image via Composer; does not require database.

require __DIR__ . '/../vendor/autoload.php';

use Intervention\Image\ImageManagerStatic as Image;

$uploadsDir = realpath(__DIR__ . '/../public/uploads/categories');
if (!$uploadsDir) {
    echo "Uploads dir not found: ../public/uploads/categories\n";
    exit(1);
}

$thumbDir = $uploadsDir . DIRECTORY_SEPARATOR . 'thumbs';
if (!is_dir($thumbDir)) mkdir($thumbDir, 0755, true);

$entries = scandir($uploadsDir);
$processed = 0;

foreach ($entries as $entry) {
    if ($entry === '.' || $entry === '..') continue;
    if ($entry === 'thumbs') continue;
    // Skip files that are already thumbs
    if (strpos($entry, 'small_') === 0 || strpos($entry, 'medium_') === 0) continue;

    $filePath = $uploadsDir . DIRECTORY_SEPARATOR . $entry;
    if (!is_file($filePath)) continue;

    $smallPath = $thumbDir . DIRECTORY_SEPARATOR . 'small_' . $entry;
    $mediumPath = $thumbDir . DIRECTORY_SEPARATOR . 'medium_' . $entry;

    try {
        if (!file_exists($smallPath)) {
            $img = Image::make($filePath)->fit(40, 40);
            $img->save($smallPath, 85);
        }
        if (!file_exists($mediumPath)) {
            $img = Image::make($filePath)->fit(160, 160);
            $img->save($mediumPath, 85);
        }
        echo "Generated thumbs for: {$entry}\n";
        $processed++;
    } catch (Exception $e) {
        echo "Error processing {$entry}: " . $e->getMessage() . "\n";
    }
}

echo "Done. Processed: {$processed}\n";
