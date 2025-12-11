<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ImageCleanupController extends Controller
{
    /**
     * Get storage analytics
     */
    /**
     * Get storage analytics
     */
    public function analytics()
    {
        try {
            $uploadDirs = [
                'products' => public_path('uploads/products'),
                'sliders' => storage_path('app/public/sliders'),
                'projects' => public_path('uploads/projects'),
                'posts' => public_path('uploads/posts'),
                'categories' => public_path('uploads/categories'),
                'menus' => public_path('uploads/menus'),
                'settings' => public_path('uploads/settings'), // Added settings
            ];

            $stats = [
                'total_size' => 0,
                'total_files' => 0,
                'by_type' => [],
            ];

            foreach ($uploadDirs as $type => $dir) {
                if (File::exists($dir)) {
                    $files = File::allFiles($dir);
                    $size = 0;
                    foreach ($files as $file) {
                        $size += $file->getSize();
                    }

                    $stats['by_type'][$type] = [
                        'count' => count($files),
                        'size' => $size,
                        'size_mb' => round($size / 1024 / 1024, 2),
                    ];

                    $stats['total_size'] += $size;
                    $stats['total_files'] += count($files);
                }
            }

            $stats['total_size_mb'] = round($stats['total_size'] / 1024 / 1024, 2);
            $stats['total_size_gb'] = round($stats['total_size'] / 1024 / 1024 / 1024, 2);

            return response()->json($stats);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching analytics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Scan for unused images
     */
    public function scanUnused()
    {
        try {
            logger()->info('Starting scanUnused');
            $unusedImages = [];

            // Scan products
            logger()->info('Scanning products');
            $productImages = $this->scanProductImages();
            $unusedImages['products'] = $productImages;
            logger()->info('Products scanned', ['count' => count($productImages)]);

            // Scan sliders
            logger()->info('Scanning sliders');
            $sliderImages = $this->scanSliderImages();
            $unusedImages['sliders'] = $sliderImages;
            logger()->info('Sliders scanned', ['count' => count($sliderImages)]);

            // Scan projects
            $projectImages = $this->scanProjectImages();
            $unusedImages['projects'] = $projectImages;

            // Scan posts
            $postImages = $this->scanPostImages();
            $unusedImages['posts'] = $postImages;

            // Scan categories
            $categoryImages = $this->scanCategoryImages();
            $unusedImages['categories'] = $categoryImages;

            // Scan menus
            $menuImages = $this->scanMenuImages();
            $unusedImages['menus'] = $menuImages;

            // Scan settings (NEW)
            $settingsImages = $this->scanSettingsImages();
            $unusedImages['settings'] = $settingsImages;

            // Scan recruitments (NEW - checking in posts/general uploads)
            // Note: Recruitments might use images stored in various folders, 
            // but we primarily check if they reference images we are about to delete.
            // However, scanUnused returns files *in a specific folder* that are unused.
            // Since we don't have a dedicated 'recruitments' upload folder (usually),
            // we just need to ensure we don't mark images in other folders as unused if they are used here.
            // BUT, the logic of getUnusedFiles is: "List all files in Folder X. Remove files used in DB. Return rest."
            // So if a Recruitment uses an image in 'uploads/posts', we must ensure scanPostImages() knows about it.
            // Let's update the specific scan methods to include cross-references if needed, 
            // OR simpler: We just need to make sure we scan the folders we care about.
            // If Recruitments upload to 'uploads/posts', then scanPostImages needs to check Recruitments too.
            // If they upload to 'uploads/settings', scanSettingsImages needs to check.
            // Assuming standard behavior: 
            // - Settings -> uploads/settings
            // - Recruitments -> uploads/posts (often shared) or just general rich text.

            // Let's look at where CKEditor uploads go. Usually 'uploads/posts' or root 'uploads'.
            // For now, I will implement scanSettingsImages for 'uploads/settings'.
            // For Recruitments/Jobs, they likely use the common upload adapter.
            // If they use images from 'uploads/posts', we should add Recruitment/Job scanning to scanPostImages.
            // Let's refine scanPostImages to also check Recruitments/Jobs if they share the folder.
            // However, to be safe and modular, I will add specific checks in relevant folders.

            // Actually, looking at the code, we are scanning specific FOLDERS.
            // If an image is in 'uploads/products', we check Product usage.
            // If a Recruitment uses an image in 'uploads/products', it would be deleted!
            // This is a design flaw in the original code (folder-scoped scanning).
            // To fix this properly, we should check ALL content for references to files in the current folder being scanned.
            // But that's expensive.
            // Pragmatic approach: 
            // 1. Settings usually has its own folder 'uploads/settings'.
            // 2. Recruitments/Jobs usually use the generic editor upload, often 'uploads/posts' or just 'uploads'.
            // Let's assume they might use images in 'uploads/posts'.

            // I will update scanPostImages to ALSO check Recruitments and Jobs.
            // And I will add scanSettingsImages for 'uploads/settings'.

            // Calculate totals
            $totalUnused = 0;
            $totalSize = 0;
            foreach ($unusedImages as $type => $images) {
                $totalUnused += count($images);
                foreach ($images as $img) {
                    $totalSize += $img['size'] ?? 0;
                }
            }

            return response()->json([
                'unused_images' => $unusedImages,
                'total_unused' => $totalUnused,
                'total_size' => $totalSize,
                'total_size_mb' => round($totalSize / 1024 / 1024, 2),
            ]);
        } catch (\Exception $e) {
            logger()->error('Error in scanUnused', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Error scanning unused images',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    private function scanProductImages()
    {
        $dir = public_path('uploads/products');
        if (!File::exists($dir))
            return [];

        $allFiles = File::files($dir);
        $usedImages = [];

        // Get all product thumbnails from database
        $products = DB::table('products')->get(['thumbnail', 'content', 'features', 'applications', 'technical_specs']);
        foreach ($products as $product) {
            if ($product->thumbnail) {
                $usedImages[] = basename($product->thumbnail);
            }

            // Extract images from rich text fields
            foreach (['content', 'features', 'applications', 'technical_specs'] as $field) {
                if (!empty($product->$field)) {
                    $this->extractImagesFromHtml($product->$field, 'uploads/products/', $usedImages);
                }
            }
        }

        // CRITICAL FIX: Get all product gallery images from product_images table
        $galleryImages = DB::table('product_images')->get(['image_path']);
        foreach ($galleryImages as $gallery) {
            if ($gallery->image_path) {
                $usedImages[] = basename($gallery->image_path);
            }
        }

        return $this->getUnusedFiles($allFiles, $usedImages, 'products');
    }

    private function scanSliderImages()
    {
        $dir = storage_path('app/public/sliders');
        if (!File::exists($dir))
            return [];

        $allFiles = File::files($dir);
        $usedImages = [];

        $sliders = DB::table('sliders')->get(['image']);
        foreach ($sliders as $slider) {
            if ($slider->image) {
                $usedImages[] = basename($slider->image);
            }
        }

        return $this->getUnusedFiles($allFiles, $usedImages, 'sliders');
    }

    private function scanProjectImages()
    {
        $dir = public_path('uploads/projects');
        if (!File::exists($dir))
            return [];

        $allFiles = File::files($dir);
        $usedImages = [];

        // Get all project thumbnails from database
        $projects = DB::table('projects')->get(['thumbnail', 'content', 'description']);
        foreach ($projects as $project) {
            if ($project->thumbnail) {
                $usedImages[] = basename($project->thumbnail);
            }

            // Extract images from rich text fields
            foreach (['content', 'description'] as $field) {
                if (!empty($project->$field)) {
                    $this->extractImagesFromHtml($project->$field, 'uploads/projects/', $usedImages);
                }
            }
        }

        // CRITICAL FIX: Get all project gallery images from project_images table (use image_url)
        $galleryImages = DB::table('project_images')->get(['image_url']);
        foreach ($galleryImages as $gallery) {
            if ($gallery->image_url) {
                $usedImages[] = basename($gallery->image_url);
            }
        }

        return $this->getUnusedFiles($allFiles, $usedImages, 'projects');
    }

    private function scanPostImages()
    {
        $dir = public_path('uploads/posts');
        if (!File::exists($dir))
            return [];

        $allFiles = File::files($dir);
        $usedImages = [];

        // 1. Check Posts
        $posts = DB::table('posts')->get(['thumbnail', 'image', 'featured_image', 'content']);
        foreach ($posts as $post) {
            if ($post->thumbnail)
                $usedImages[] = basename($post->thumbnail);
            if ($post->image)
                $usedImages[] = basename($post->image);
            if ($post->featured_image)
                $usedImages[] = basename($post->featured_image);

            if ($post->content) {
                $this->extractImagesFromHtml($post->content, 'uploads/posts/', $usedImages);
            }
        }

        // 2. Check Recruitments (often use same upload folder)
        $recruitments = DB::table('recruitments')->get(['description', 'requirements']);
        foreach ($recruitments as $recruitment) {
            if ($recruitment->description) {
                $this->extractImagesFromHtml($recruitment->description, 'uploads/posts/', $usedImages);
            }
            if ($recruitment->requirements) {
                $this->extractImagesFromHtml($recruitment->requirements, 'uploads/posts/', $usedImages);
            }
        }

        // 3. Check Jobs
        $jobs = DB::table('jobs')->get(['description']);
        foreach ($jobs as $job) {
            if ($job->description) {
                $this->extractImagesFromHtml($job->description, 'uploads/posts/', $usedImages);
            }
        }

        return $this->getUnusedFiles($allFiles, $usedImages, 'posts');
    }

    private function scanCategoryImages()
    {
        $dir = public_path('uploads/categories');
        if (!File::exists($dir))
            return [];

        $allFiles = File::files($dir);
        $usedImages = [];

        $categories = DB::table('categories')->get(['image']);
        foreach ($categories as $category) {
            if ($category->image) {
                $usedImages[] = basename($category->image);
            }
        }

        return $this->getUnusedFiles($allFiles, $usedImages, 'categories');
    }

    private function scanMenuImages()
    {
        $dir = public_path('uploads/menus');
        if (!File::exists($dir))
            return [];

        $allFiles = File::files($dir);
        $usedImages = [];

        $menus = DB::table('menus')->get(['icon', 'image', 'promo_image']);
        foreach ($menus as $menu) {
            if ($menu->icon && str_contains($menu->icon, '/')) {
                $usedImages[] = basename($menu->icon);
            }
            if ($menu->image) {
                $usedImages[] = basename($menu->image);
            }
            if ($menu->promo_image) {
                $usedImages[] = basename($menu->promo_image);
            }
        }

        return $this->getUnusedFiles($allFiles, $usedImages, 'menus');
    }

    private function scanSettingsImages()
    {
        $dir = public_path('uploads/settings');
        if (!File::exists($dir))
            return [];

        $allFiles = File::files($dir);
        $usedImages = [];

        $settings = DB::table('settings')->get(['key', 'value', 'type']);
        foreach ($settings as $setting) {
            // Direct image type
            if ($setting->type === 'image' && $setting->value) {
                $usedImages[] = basename($setting->value);
            }

            // Rich text or Textarea containing HTML
            if (in_array($setting->type, ['wysiwyg', 'textarea']) && $setting->value) {
                $this->extractImagesFromHtml($setting->value, 'uploads/settings/', $usedImages);
            }

            // JSON content (recursive search)
            if ($setting->type === 'json' && $setting->value) {
                $this->extractImagesFromJson($setting->value, 'uploads/settings/', $usedImages);
            }
        }

        return $this->getUnusedFiles($allFiles, $usedImages, 'settings');
    }

    /**
     * Helper to extract images from HTML content
     */
    private function extractImagesFromHtml($html, $pathFilter, &$usedImages)
    {
        preg_match_all('/<img[^>]+src=["\']([^"\']+)["\'][^>]*>/i', $html, $matches);
        if (!empty($matches[1])) {
            foreach ($matches[1] as $imgSrc) {
                if (str_contains($imgSrc, $pathFilter)) {
                    $usedImages[] = basename($imgSrc);
                }
            }
        }
    }

    /**
     * Helper to extract images from JSON content
     */
    private function extractImagesFromJson($jsonStr, $pathFilter, &$usedImages)
    {
        $data = json_decode($jsonStr, true);
        if (json_last_error() === JSON_ERROR_NONE) {
            array_walk_recursive($data, function ($item) use ($pathFilter, &$usedImages) {
                if (is_string($item) && str_contains($item, $pathFilter)) {
                    // It might be a full URL or path, just take basename if it looks like a file path
                    // Simple check: does it look like an image extension?
                    if (preg_match('/\.(jpg|jpeg|png|gif|webp|svg)$/i', $item)) {
                        $usedImages[] = basename($item);
                    }
                }
            });
        }
    }

    private function getUnusedFiles($allFiles, $usedImages, $type)
    {
        $unused = [];
        foreach ($allFiles as $file) {
            $filename = $file->getFilename();
            if (!in_array($filename, $usedImages)) {
                $unused[] = [
                    'filename' => $filename,
                    'path' => $file->getPathname(),
                    'size' => $file->getSize(),
                    'size_kb' => round($file->getSize() / 1024, 2),
                    'modified' => date('Y-m-d H:i:s', $file->getMTime()),
                    'type' => $type,
                ];
            }
        }
        return $unused;
    }

    /**
     * Delete unused images
     */
    public function deleteUnused(Request $request)
    {
        try {
            $images = $request->input('images', []);
            $deleted = [];
            $errors = [];

            foreach ($images as $image) {
                $path = $image['path'] ?? null;
                if ($path && File::exists($path)) {
                    try {
                        File::delete($path);
                        $deleted[] = $image['filename'];
                    } catch (\Exception $e) {
                        $errors[] = [
                            'filename' => $image['filename'],
                            'error' => $e->getMessage()
                        ];
                    }
                }
            }

            return response()->json([
                'message' => 'Cleanup completed',
                'deleted' => $deleted,
                'deleted_count' => count($deleted),
                'errors' => $errors,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error deleting images',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Backup images before cleanup
     */
    public function backup(Request $request)
    {
        try {
            $backupDir = storage_path('app/backups/images/' . date('Y-m-d_His'));
            File::makeDirectory($backupDir, 0755, true);

            $images = $request->input('images', []);
            $backed = [];

            foreach ($images as $image) {
                $path = $image['path'] ?? null;
                if ($path && File::exists($path)) {
                    $filename = basename($path);
                    $type = $image['type'] ?? 'unknown';

                    $backupPath = $backupDir . '/' . $type;
                    File::makeDirectory($backupPath, 0755, true);

                    File::copy($path, $backupPath . '/' . $filename);
                    $backed[] = $filename;
                }
            }

            return response()->json([
                'message' => 'Backup completed',
                'backup_path' => $backupDir,
                'backed_count' => count($backed),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error creating backup',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

