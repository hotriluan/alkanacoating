<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;
use App\Traits\DeletesImages;

class CategoryController extends Controller
{
    use DeletesImages;

    /**
     * Display a listing of the categories.
     */
    public function index(): JsonResponse
    {
        $categories = Category::with('parent', 'children')
            ->withCount('products')
            ->orderBy('order')
            ->orderBy('name')
            ->get();
        
        return response()->json([
            'categories' => $categories
        ]);
    }

    /**
     * Store a newly created category in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:categories,name',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:8192',
            'description' => 'nullable|string',
            'icon' => 'nullable|string|max:10',
            'color' => 'nullable|string|max:7',
            'parent_id' => 'nullable|exists:categories,id',
            'order' => 'nullable|integer',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string'
        ]);
        
        
        $data = [
            'name' => $request->name,
            'description' => $request->description,
            'icon' => $request->icon,
            'color' => $request->color,
            'parent_id' => $request->parent_id,
            'order' => $request->order ?? 0,
            'meta_title' => $request->meta_title,
            'meta_description' => $request->meta_description,
        ];

        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $imageName = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
            $image->move(public_path('uploads/categories'), $imageName);
            $data['image'] = 'uploads/categories/' . $imageName;
            // generate thumbnails (small, medium) if Intervention Image is available
            try {
                if (class_exists('\Intervention\Image\ImageManagerStatic')) {
                    $img = \Intervention\Image\ImageManagerStatic::make(public_path('uploads/categories/' . $imageName));
                    // create thumbs directory
                    $thumbDir = public_path('uploads/categories/thumbs');
                    if (!file_exists($thumbDir)) mkdir($thumbDir, 0755, true);
                    // small (40x40)
                    $img->fit(40, 40)->save($thumbDir . '/small_' . $imageName);
                    // medium (160x160)
                    $img->fit(160, 160)->save($thumbDir . '/medium_' . $imageName);
                }
            } catch (\Exception $e) {
                logger()->warning('Thumbnail generation failed: ' . $e->getMessage());
            }
        }

        $category = Category::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Danh mục đã được tạo thành công!',
            'category' => $category
        ], 201);
    }

    /**
     * Display the specified category.
     */
    public function show(Category $category): JsonResponse
    {
        return response()->json([
            'category' => $category
        ]);
    }

    /**
     * Update the specified category in storage.
     */
    public function update(Request $request, Category $category): JsonResponse
    {
        $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('categories', 'name')->ignore($category->id)
            ],
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:8192',
            'description' => 'nullable|string',
            'icon' => 'nullable|string|max:10',
            'color' => 'nullable|string|max:7',
            'parent_id' => 'nullable|exists:categories,id',
            'order' => 'nullable|integer',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string'
        ]);

        $data = [
            'name' => $request->name,
            'description' => $request->description,
            'icon' => $request->icon,
            'color' => $request->color,
            'parent_id' => $request->parent_id,
            'order' => $request->order ?? $category->order,
            'meta_title' => $request->meta_title,
            'meta_description' => $request->meta_description,
        ];

        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($category->image) {
                $this->deleteImageFile($category->image);
                // delete old thumbs if exist
                $oldFile = pathinfo($category->image, PATHINFO_BASENAME);
                $thumbDir = public_path('uploads/categories/thumbs');
                @unlink($thumbDir . '/small_' . $oldFile);
                @unlink($thumbDir . '/medium_' . $oldFile);
            }

            $image = $request->file('image');
            $imageName = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
            $image->move(public_path('uploads/categories'), $imageName);
            $data['image'] = 'uploads/categories/' . $imageName;
            try {
                if (class_exists('\Intervention\Image\ImageManagerStatic')) {
                    $img = \Intervention\Image\ImageManagerStatic::make(public_path('uploads/categories/' . $imageName));
                    $thumbDir = public_path('uploads/categories/thumbs');
                    if (!file_exists($thumbDir)) mkdir($thumbDir, 0755, true);
                    $img->fit(40, 40)->save($thumbDir . '/small_' . $imageName);
                    $img->fit(160, 160)->save($thumbDir . '/medium_' . $imageName);
                }
            } catch (\Exception $e) {
                logger()->warning('Thumbnail generation failed: ' . $e->getMessage());
            }
        }

        $category->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Danh mục đã được cập nhật thành công!',
            'category' => $category->fresh()
        ]);
    }

    /**
     * Remove the specified category from storage.
     */
    public function destroy(Category $category): JsonResponse
    {
        // Check if category has products
        if ($category->products()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể xóa danh mục này vì còn có sản phẩm thuộc danh mục!'
            ], 422);
        }

        try {
            // Delete category image and thumbnails
            if ($category->image) {
                $this->deleteImageFile($category->image);
                // delete thumbs
                $oldFile = pathinfo($category->image, PATHINFO_BASENAME);
                $thumbDir = public_path('uploads/categories/thumbs');
                @unlink($thumbDir . '/small_' . $oldFile);
                @unlink($thumbDir . '/medium_' . $oldFile);
            }
            
            $category->delete();

            return response()->json([
                'success' => true,
                'message' => 'Danh mục đã được xóa thành công!'
            ]);
        } catch (\Exception $e) {
            // Log the exception for debugging and return an informative message
            logger()->error('Error deleting category ID ' . $category->id . ': ' . $e->getMessage(), ['exception' => $e]);

            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra khi xóa danh mục: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all categories for dropdown/select options.
     */
    public function options(): JsonResponse
    {
        $categories = Category::orderBy('name')->get(['id', 'name']);
        
        return response()->json([
            'categories' => $categories
        ]);
    }
}