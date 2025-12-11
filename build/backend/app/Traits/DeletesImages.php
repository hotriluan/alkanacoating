<?php

namespace App\Traits;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

trait DeletesImages
{
    /**
     * Delete a single image file from public path
     * 
     * @param string|null $path Path to image (e.g., 'uploads/products/image.jpg')
     * @return bool
     */
    protected function deleteImageFile(?string $path): bool
    {
        if (empty($path)) {
            return false;
        }

        try {
            // Handle public paths (uploads/products/...)
            if (str_starts_with($path, 'uploads/')) {
                $fullPath = public_path($path);
                if (File::exists($fullPath)) {
                    File::delete($fullPath);
                    Log::info('Deleted image from public path', ['path' => $path]);
                    return true;
                }
            }
            
            // Handle storage paths (sliders/...)
            if (Storage::disk('public')->exists($path)) {
                Storage::disk('public')->delete($path);
                Log::info('Deleted image from storage', ['path' => $path]);
                return true;
            }

            return false;
        } catch (\Exception $e) {
            Log::error('Failed to delete image', [
                'path' => $path,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Delete old image when uploading new one
     * 
     * @param string|null $oldPath
     * @param string|null $newPath
     * @return void
     */
    protected function replaceImage(?string $oldPath, ?string $newPath): void
    {
        // Only delete old image if it's different from new one
        if ($oldPath && $newPath && $oldPath !== $newPath) {
            $this->deleteImageFile($oldPath);
        }
    }

    /**
     * Delete multiple images from an array
     * 
     * @param array $paths
     * @return int Number of deleted images
     */
    protected function deleteMultipleImages(array $paths): int
    {
        $deletedCount = 0;
        foreach ($paths as $path) {
            if ($this->deleteImageFile($path)) {
                $deletedCount++;
            }
        }
        return $deletedCount;
    }
}
