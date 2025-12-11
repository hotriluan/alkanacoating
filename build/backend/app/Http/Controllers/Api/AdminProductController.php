<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Traits\DeletesImages;

class AdminProductController extends Controller
{
    use DeletesImages;

    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    public function index()
    {
        try {
            $products = Product::with(['category', 'images'])
                ->orderBy('created_at', 'desc')
                ->paginate(20);

            return response()->json([
                'success' => true,
                'data' => $products
            ]);
        } catch (\Exception $e) {
            // Use logger for optional debug instead of writing to files directly
            logger()->error('AdminProductController@index error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra khi tải danh sách sản phẩm'
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'content' => 'nullable|string',
            'category_id' => 'nullable|exists:categories,id',
            'is_active' => 'nullable|in:0,1,true,false',
            'is_featured' => 'nullable|in:0,1,true,false',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
            'features' => 'nullable|string',
            'applications' => 'nullable|string',
            'technical_specs' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:8192'
        ]);

        try {
            $productData = [
                'name' => $request->name,
                'slug' => Str::slug($request->name),
                'excerpt' => $request->description, // Map description to excerpt
                'content' => $request->content,
                'category_id' => $request->category_id,
                'is_active' => in_array($request->get('is_active'), ['1', 'true', true], true),
                'is_featured' => in_array($request->get('is_featured'), ['1', 'true', true], true),
                'meta_title' => $request->meta_title,
                'meta_description' => $request->meta_description,
                'features' => $request->features,
                'applications' => $request->applications,
                'technical_specs' => $request->technical_specs,
            ];

            // Handle image upload
            if ($request->hasFile('image')) {
                $image = $request->file('image');
                $imageName = time() . '_' . Str::random(10) . '.' . $image->getClientOriginalExtension();
                $image->move(public_path('uploads/products'), $imageName);
                $productData['thumbnail'] = 'uploads/products/' . $imageName;
            }

            $product = Product::create($productData);

            return response()->json([
                'success' => true,
                'message' => 'Sản phẩm đã được tạo thành công',
                'data' => $product
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra khi tạo sản phẩm'
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $product = Product::with(['category', 'images'])->findOrFail($id);
            
            return response()->json([
                'success' => true,
                'data' => $product
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy sản phẩm'
            ], 404);
        }
    }

    public function update(Request $request, $id)
    {
        // Optional debug helper (use logger()->debug if needed)
        // logger()->debug('AdminProductController::update', ['id' => $id, 'method' => $request->method(), 'content_type' => $request->header('Content-Type'), 'has_images' => $request->has('images'), 'request' => $request->all()]);

        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'content' => 'nullable|string',
                'category_id' => 'nullable|exists:categories,id',
                'is_active' => 'nullable|in:0,1,true,false',
                'is_featured' => 'nullable|in:0,1,true,false',
                'meta_title' => 'nullable|string|max:255',
                'meta_description' => 'nullable|string',
                'features' => 'nullable|string',
                'applications' => 'nullable|string',
                'technical_specs' => 'nullable|string',
                'images' => 'nullable|array',
                'images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:8192',
                'primary_image_index' => 'nullable|integer'
            ]);

            $product = Product::findOrFail($id);
            
            $updateData = [
                'name' => $request->name,
                'slug' => Str::slug($request->name),
                'excerpt' => $request->description, // Map description to excerpt
                'content' => $request->content,
                'category_id' => $request->category_id,
                'is_active' => in_array($request->get('is_active'), ['1', 'true', true], true),
                'is_featured' => in_array($request->get('is_featured'), ['1', 'true', true], true),
                'meta_title' => $request->meta_title,
                'meta_description' => $request->meta_description,
                'features' => $request->features,
                'applications' => $request->applications,
                'technical_specs' => $request->technical_specs,
            ];

            // Handle thumbnail replacement
            if ($request->hasFile('image')) {
                // Delete old thumbnail
                if ($product->thumbnail) {
                    $this->deleteImageFile($product->thumbnail);
                }
                
                $image = $request->file('image');
                $imageName = time() . '_' . Str::random(10) . '.' . $image->getClientOriginalExtension();
                $image->move(public_path('uploads/products'), $imageName);
                $updateData['thumbnail'] = 'uploads/products/' . $imageName;
            }

            // Handle multiple image uploads (gallery)
            if ($request->hasFile('images')) {
                // Delete old gallery images first
                foreach ($product->images as $oldImage) {
                    $this->deleteImageFile($oldImage->image_path);
                }
                $product->images()->delete();
                
                $images = $request->file('images');
                $primaryIndex = $request->get('primary_image_index', 0);
                
                foreach ($images as $index => $image) {
                    $imageName = time() . '_' . $index . '_' . Str::random(10) . '.' . $image->getClientOriginalExtension();
                    $image->move(public_path('uploads/products'), $imageName);
                    
                    ProductImage::create([
                        'product_id' => $product->id,
                        'image_path' => 'uploads/products/' . $imageName,
                        'alt_text' => $product->name,
                        'sort_order' => $index,
                        'is_primary' => $index == $primaryIndex
                    ]);
                }
            }

            $product->update($updateData);

            return response()->json([
                'success' => true,
                'message' => 'Sản phẩm đã được cập nhật thành công',
                'data' => $product
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            logger()->warning('AdminProductController@update validation error', ['errors' => $e->errors()]);
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            logger()->error('AdminProductController@update general error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra khi cập nhật sản phẩm: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $product = Product::findOrFail($id);
            
            // Delete thumbnail
            if ($product->thumbnail) {
                $this->deleteImageFile($product->thumbnail);
            }
            
            // Delete gallery images
            foreach ($product->images as $image) {
                $this->deleteImageFile($image->image_path);
            }
            $product->images()->delete();
            
            $product->delete();

            return response()->json([
                'success' => true,
                'message' => 'Sản phẩm đã được xóa thành công'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra khi xóa sản phẩm'
            ], 500);
        }
    }

    public function bulkDelete(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:products,id'
        ]);

        try {
            $products = Product::with('images')->whereIn('id', $request->ids)->get();
            
            foreach ($products as $product) {
                // Delete thumbnail
                if ($product->thumbnail) {
                    $this->deleteImageFile($product->thumbnail);
                }
                
                // Delete gallery images
                foreach ($product->images as $image) {
                    $this->deleteImageFile($image->image_path);
                }
                $product->images()->delete();
                $product->delete();
            }

            return response()->json([
                'success' => true,
                'message' => 'Các sản phẩm đã được xóa thành công'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra khi xóa sản phẩm'
            ], 500);
        }
    }

    public function toggleStatus($id)
    {
        try {
            $product = Product::findOrFail($id);
            $product->update(['is_active' => !$product->is_active]);

            return response()->json([
                'success' => true,
                'message' => 'Trạng thái sản phẩm đã được cập nhật',
                'data' => $product
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra khi cập nhật trạng thái'
            ], 500);
        }
    }
}