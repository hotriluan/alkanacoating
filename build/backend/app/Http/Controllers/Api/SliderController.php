<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Slider;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\ImageManagerStatic as Image;
use Illuminate\Support\Facades\Log;
use App\Traits\DeletesImages;

class SliderController extends Controller
{
    use DeletesImages;

    public function index()
    {
        $sliders = Slider::active()->ordered()->get();
        
        // Transform image paths to full URLs
        $sliders = $sliders->map(function ($slider) {
            if ($slider->image && !str_starts_with($slider->image, 'http') && !str_starts_with($slider->image, '/assets/')) {
                $slider->image = url('api/uploads/sliders/' . basename($slider->image));
            }
            return $slider;
        });
        
        return response()->json($sliders);
    }

    public function adminIndex()
    {
        $sliders = Slider::orderBy('order', 'asc')->get();
        
        // Transform image paths to full URLs for admin
        $sliders = $sliders->map(function ($slider) {
            if ($slider->image && !str_starts_with($slider->image, 'http') && !str_starts_with($slider->image, '/assets/')) {
                $slider->image = url('api/uploads/sliders/' . basename($slider->image));
            }
            return $slider;
        });
        
        return response()->json($sliders);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'nullable|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'button_text' => 'nullable|string|max:100',
            'button_style' => 'nullable|in:primary,secondary,outline',
            'text_position' => 'nullable|in:left,center,right',
            'overlay_opacity' => 'nullable|integer|min:0|max:100',
            'media_type' => 'nullable|in:image,video',
            'video_url' => 'nullable|string|max:500',
            // allow up to 16MB on upload; we'll auto-resize images >8MB
            'image' => 'required_if:media_type,image|nullable|image|mimes:jpeg,png,jpg,gif,webp|max:16384',
            'link' => 'nullable|string|max:255',
            'category_id' => 'nullable|exists:categories,id',
            'order' => 'integer|min:0',
            'is_active' => 'nullable|in:0,1,true,false'
        ]);

        $data = $request->all();

        // Handle image upload
        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $ext = strtolower($file->getClientOriginalExtension());
            $maxBytes = 8 * 1024 * 1024; // 8 MB

            // If file is larger than 8MB and not an animated GIF, resize/compress it
            if ($file->getSize() > $maxBytes && $ext !== 'gif') {
                try {
                    $img = Image::make($file->getPathname())->orientate();
                    // Resize to a reasonable max dimension to reduce file size while preserving aspect ratio
                    $img->resize(2000, 2000, function ($constraint) {
                        $constraint->aspectRatio();
                        $constraint->upsize();
                    });

                    // Choose encoding based on original extension (prefer jpg for most)
                    if ($ext === 'png') {
                        $encoded = $img->encode('png', config('image-thumbs.quality', 85));
                        $finalExt = 'png';
                    } else {
                        $encoded = $img->encode('jpg', config('image-thumbs.quality', 85));
                        $finalExt = 'jpg';
                    }

                    $filename = time() . '_' . Str::random(6) . '.' . $finalExt;
                    Storage::disk('public')->put('sliders/' . $filename, (string) $encoded);
                    $data['image'] = 'sliders/' . $filename;
                } catch (\Exception $e) {
                    // Fall back to storing the original file if processing fails
                    $imagePath = $file->store('sliders', 'public');
                    $data['image'] = $imagePath;
                }
            } else {
                $imagePath = $file->store('sliders', 'public');
                $data['image'] = $imagePath;
            }
        }

        // Convert is_active to boolean
        if (isset($data['is_active'])) {
            $data['is_active'] = in_array($data['is_active'], ['1', 'true', true], true);
        }

        $slider = Slider::create($data);

        // Attach stored size info for client
        $storedSize = null;
        try {
            if (isset($data['image']) && Storage::disk('public')->exists($data['image'])) {
                $storedSize = Storage::disk('public')->size($data['image']);
            }
        } catch (\Exception $e) {
            Log::warning('Could not determine stored file size for slider', ['path' => $data['image'] ?? null, 'error' => $e->getMessage()]);
        }

        $result = $slider->toArray();
        $result['stored_size_bytes'] = $storedSize;
        $result['stored_size_human'] = $storedSize ? sprintf('%.2f MB', $storedSize / 1024 / 1024) : null;

        Log::info('Slider created', ['id' => $slider->id, 'image' => $data['image'] ?? null, 'stored_size' => $storedSize]);

        return response()->json($result, 201);
    }

    public function show(Slider $slider)
    {
        return response()->json($slider);
    }

    public function update(Request $request, Slider $slider)
    {
        $request->validate([
            'title' => 'nullable|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'button_text' => 'nullable|string|max:100',
            'button_style' => 'nullable|in:primary,secondary,outline',
            'text_position' => 'nullable|in:left,center,right',
            'overlay_opacity' => 'nullable|integer|min:0|max:100',
            'media_type' => 'nullable|in:image,video',
            'video_url' => 'nullable|string|max:500',
            // allow up to 16MB on update; we'll auto-resize images >8MB
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:16384', // Made nullable for update
            'link' => 'nullable|string|max:255',
            'category_id' => 'nullable|exists:categories,id',
            'order' => 'integer|min:0',
            'is_active' => 'nullable|in:0,1,true,false'
        ]);

        $data = $request->all();

        // Handle image upload if new image provided
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($slider->image && !str_starts_with($slider->image, '/assets/')) {
                $this->deleteImageFile($slider->image);
            }

            $file = $request->file('image');
            $ext = strtolower($file->getClientOriginalExtension());
            $maxBytes = 8 * 1024 * 1024; // 8 MB

            if ($file->getSize() > $maxBytes && $ext !== 'gif') {
                try {
                    $img = Image::make($file->getPathname())->orientate();
                    $img->resize(2000, 2000, function ($constraint) {
                        $constraint->aspectRatio();
                        $constraint->upsize();
                    });

                    if ($ext === 'png') {
                        $encoded = $img->encode('png', config('image-thumbs.quality', 85));
                        $finalExt = 'png';
                    } else {
                        $encoded = $img->encode('jpg', config('image-thumbs.quality', 85));
                        $finalExt = 'jpg';
                    }

                    $filename = time() . '_' . Str::random(6) . '.' . $finalExt;
                    Storage::disk('public')->put('sliders/' . $filename, (string) $encoded);
                    $data['image'] = 'sliders/' . $filename;
                } catch (\Exception $e) {
                    $imagePath = $file->store('sliders', 'public');
                    $data['image'] = $imagePath;
                }
            } else {
                $imagePath = $file->store('sliders', 'public');
                $data['image'] = $imagePath;
            }
        } else {
            // Keep existing image if no new image uploaded
            unset($data['image']);
        }

        // Convert is_active to boolean
        if (isset($data['is_active'])) {
            $data['is_active'] = in_array($data['is_active'], ['1', 'true', true], true);
        }

        $slider->update($data);

        $storedSize = null;
        try {
            if (isset($data['image']) && Storage::disk('public')->exists($data['image'])) {
                $storedSize = Storage::disk('public')->size($data['image']);
            }
        } catch (\Exception $e) {
            Log::warning('Could not determine stored file size for slider (update)', ['path' => $data['image'] ?? null, 'error' => $e->getMessage()]);
        }

        $result = $slider->toArray();
        $result['stored_size_bytes'] = $storedSize;
        $result['stored_size_human'] = $storedSize ? sprintf('%.2f MB', $storedSize / 1024 / 1024) : null;

        Log::info('Slider updated', ['id' => $slider->id, 'image' => $data['image'] ?? null, 'stored_size' => $storedSize]);

        return response()->json($result);
    }

    public function destroy(Slider $slider)
    {
        // Delete image file before deleting record
        if ($slider->image && !str_starts_with($slider->image, '/assets/')) {
            $this->deleteImageFile($slider->image);
        }
        
        $slider->delete();
        return response()->json(null, 204);
    }
}