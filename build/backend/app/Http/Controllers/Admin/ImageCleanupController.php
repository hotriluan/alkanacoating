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
            $unusedImages = [];

            // Scan products
            $productImages = $this->scanProductImages();
            $unusedImages['products'] = $productImages;

            // Scan sliders
            $sliderImages = $this->scanSliderImages();
            $unusedImages['sliders'] = $sliderImages;

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
            return response()->json([
                'message' => 'Error scanning unused images',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    private function scanProductImages()
    {
        $dir = public_path('uploads/products');
        if (!File::exists($dir)) return [];

        $allFiles = File::files($dir);
        $usedImages = [];

        // Get all product images from database
        $products = DB::table('products')->get(['thumbnail', 'gallery']);
        foreach ($products as $product) {
            if ($product->thumbnail) {
                $usedImages[] = basename($product->thumbnail);
            }
            if ($product->gallery) {
                $gallery = json_decode($product->gallery, true);
                if (is_array($gallery)) {
                    foreach ($gallery as $img) {
                        $usedImages[] = basename($img);
                    }
                }
            }
        }

        return $this->getUnusedFiles($allFiles, $usedImages, 'products');
    }

    private function scanSliderImages()
    {
        $dir = storage_path('app/public/sliders');
        if (!File::exists($dir)) return [];

        $allFiles = File::files($dir);
        $usedImages = [];

        $sliders = DB::table('sliders')->get(['image_url']);
        foreach ($sliders as $slider) {
            if ($slider->image_url) {
                $usedImages[] = basename($slider->image_url);
            }
        }

        return $this->getUnusedFiles($allFiles, $usedImages, 'sliders');
    }

    private function scanProjectImages()
    {
        $dir = public_path('uploads/projects');
        if (!File::exists($dir)) return [];

        $allFiles = File::files($dir);
        $usedImages = [];

        $projects = DB::table('projects')->get(['thumbnail', 'images']);
        foreach ($projects as $project) {
            if ($project->thumbnail) {
                $usedImages[] = basename($project->thumbnail);
            }
            if ($project->images) {
                $images = json_decode($project->images, true);
                if (is_array($images)) {
                    foreach ($images as $img) {
                        $usedImages[] = basename($img);
                    }
                }
            }
        }

        return $this->getUnusedFiles($allFiles, $usedImages, 'projects');
    }

    private function scanPostImages()
    {
        $dir = public_path('uploads/posts');
        if (!File::exists($dir)) return [];

        $allFiles = File::files($dir);
        $usedImages = [];

        $posts = DB::table('posts')->get(['thumbnail']);
        foreach ($posts as $post) {
            if ($post->thumbnail) {
                $usedImages[] = basename($post->thumbnail);
            }
        }

        return $this->getUnusedFiles($allFiles, $usedImages, 'posts');
    }

    private function scanCategoryImages()
    {
        $dir = public_path('uploads/categories');
        if (!File::exists($dir)) return [];

        $allFiles = File::files($dir);
        $usedImages = [];

        $categories = DB::table('categories')->get(['thumbnail']);
        foreach ($categories as $category) {
            if ($category->thumbnail) {
                $usedImages[] = basename($category->thumbnail);
            }
        }

        return $this->getUnusedFiles($allFiles, $usedImages, 'categories');
    }

    private function scanMenuImages()
    {
        $dir = public_path('uploads/menus');
        if (!File::exists($dir)) return [];

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

