<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Category;
use Intervention\Image\ImageManagerStatic as Image;

class GenerateCategoryThumbs extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'categories:generate-thumbs {--webp : Also generate WebP versions}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate small/medium thumbnails for categories (and optionally WebP)';

    public function handle()
    {
        $sizes = config('image-thumbs.sizes', ['small' => [40, 40], 'medium' => [160, 160]]);
        $quality = config('image-thumbs.quality', 85);
        $generateWebp = $this->option('webp') || config('image-thumbs.generate_webp', false);

        $this->info('Starting thumbnail generation...');

        $categories = Category::whereNotNull('image')->get();
        $thumbDir = public_path('uploads/categories/thumbs');
        if (!is_dir($thumbDir)) mkdir($thumbDir, 0755, true);

        $count = 0;
        foreach ($categories as $cat) {
            $file = basename($cat->image);
            $src = public_path($cat->image);
            if (!file_exists($src)) {
                $this->warn("File not found: {$src}");
                continue;
            }

            foreach ($sizes as $key => [$w, $h]) {
                $dest = $thumbDir . DIRECTORY_SEPARATOR . "{$key}_{$file}";
                try {
                    Image::make($src)->fit($w, $h)->save($dest, $quality);
                    if ($generateWebp) {
                        $webp = preg_replace('/\.jpe?g$/i', '.webp', $dest);
                        $webp = preg_replace('/\.JPG$/', '.webp', $webp);
                        Image::make($src)->fit($w, $h)->encode('webp', $quality)->save($webp);
                    }
                } catch (\Exception $e) {
                    $this->error("Error processing {$file}: " . $e->getMessage());
                }
            }
            $this->info("Generated thumbs for: {$file}");
            $count++;
        }

        $this->info("Done. Processed: {$count}");

        return 0;
    }
}
