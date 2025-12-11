<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    /**
     * Display a listing of products
     */
    public function index()
    {
        try {
            $products = DB::table('products')
                ->leftJoin('categories', 'products.category_id', '=', 'categories.id')
                ->select(
                    'products.*',
                    'categories.name as category_name'
                )
                ->orderBy('products.order', 'asc')
                ->orderBy('products.created_at', 'desc')
                ->get();

            // Transform data to match frontend expectations
            $products = $products->map(function($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'slug' => $product->slug,
                    'category_id' => $product->category_id,
                    'description' => $product->excerpt,
                    'content' => $product->content,
                    'features' => $product->features,
                    'applications' => $product->applications,
                    'technical_specs' => $product->technical_specs,
                    'thumbnail' => $product->thumbnail,
                    'is_active' => (bool) $product->is_active,
                    'is_featured' => (bool) $product->is_featured,
                    'order' => $product->order,
                    'meta_title' => $product->meta_title,
                    'meta_description' => $product->meta_description,
                    'created_at' => $product->created_at,
                    'updated_at' => $product->updated_at,
                    'category' => $product->category_name ? [
                        'name' => $product->category_name
                    ] : null,
                    'images' => [] // TODO: Load product images if you have a separate images table
                ];
            });

            return response()->json($products);
        } catch (\Exception $e) {
            logger()->error('Error fetching products', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Error fetching products',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a new product
     */
    public function store(Request $request)
    {
        try {
            logger()->info('Product store request received', [
                'hasFile' => $request->hasFile('thumbnail'),
                'allFiles' => array_keys($request->allFiles()),
                'allInputs' => array_keys($request->all()),
                'name' => $request->input('name'),
                'description' => $request->input('description'),
                'content' => $request->input('content'),
                'features' => $request->input('features'),
                'applications' => $request->input('applications'),
                'technical_specs' => $request->input('technical_specs')
            ]);

            $data = [
                'name' => $request->input('name'),
                'slug' => $request->input('slug') ?: Str::slug($request->input('name')),
                'category_id' => $request->input('category_id') ?: null,
                'excerpt' => $request->input('description') !== '' ? $request->input('description') : null,
                'content' => $request->input('content') !== '' ? $request->input('content') : null,
                'features' => $request->input('features') !== '' ? $request->input('features') : null,
                'applications' => $request->input('applications') !== '' ? $request->input('applications') : null,
                'technical_specs' => $request->input('technical_specs') !== '' ? $request->input('technical_specs') : null,
                'meta_title' => $request->input('meta_title') !== '' ? $request->input('meta_title') : null,
                'meta_description' => $request->input('meta_description') !== '' ? $request->input('meta_description') : null,
                'is_active' => $request->input('is_active', true) === '1' || $request->input('is_active') === true,
                'is_featured' => $request->input('is_featured', false) === '1' || $request->input('is_featured') === true,
                'order' => $request->input('order', 0),
                'created_at' => now(),
                'updated_at' => now()
            ];

            logger()->info('Data to be inserted', $data);

            // Handle thumbnail upload
            if ($request->hasFile('thumbnail')) {
                $file = $request->file('thumbnail');
                $filename = time() . '_' . Str::random(10) . '.' . $file->getClientOriginalExtension();
                $path = 'uploads/products';
                
                if (!File::exists(public_path($path))) {
                    File::makeDirectory(public_path($path), 0755, true);
                }
                
                $file->move(public_path($path), $filename);
                $data['thumbnail'] = 'backend/public/' . $path . '/' . $filename;
                
                logger()->info('Thumbnail uploaded', ['path' => $data['thumbnail']]);
            }

            $productId = DB::table('products')->insertGetId($data);

            logger()->info('Product created successfully', ['id' => $productId]);

            return response()->json([
                'message' => 'Product created successfully',
                'product_id' => $productId
            ], 201);

        } catch (\Exception $e) {
            logger()->error('Error creating product', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Error creating product',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified product
     */
    public function show($id)
    {
        try {
            $product = DB::table('products')
                ->leftJoin('categories', 'products.category_id', '=', 'categories.id')
                ->select(
                    'products.*',
                    'categories.name as category_name'
                )
                ->where('products.id', $id)
                ->first();

            if (!$product) {
                return response()->json(['message' => 'Product not found'], 404);
            }

            return response()->json([
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'category_id' => $product->category_id,
                'description' => $product->excerpt,
                'content' => $product->content,
                'features' => $product->features,
                'applications' => $product->applications,
                'technical_specs' => $product->technical_specs,
                'thumbnail' => $product->thumbnail,
                'is_active' => (bool) $product->is_active,
                'is_featured' => (bool) $product->is_featured,
                'order' => $product->order,
                'meta_title' => $product->meta_title,
                'meta_description' => $product->meta_description,
                'category' => $product->category_name ? [
                    'name' => $product->category_name
                ] : null
            ]);
        } catch (\Exception $e) {
            logger()->error('Error fetching product', [
                'id' => $id,
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'message' => 'Error fetching product',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified product
     */
    public function update(Request $request, $id)
    {
        try {
            logger()->info('Product update request received', [
                'productId' => $id,
                'hasFile' => $request->hasFile('thumbnail'),
                'allFiles' => array_keys($request->allFiles()),
                'allInputs' => array_keys($request->all()),
                'name' => $request->input('name'),
                'description' => $request->input('description'),
                'content' => $request->input('content'),
                'features' => $request->input('features'),
                'applications' => $request->input('applications'),
                'technical_specs' => $request->input('technical_specs')
            ]);

            $product = DB::table('products')->where('id', $id)->first();
            if (!$product) {
                return response()->json(['message' => 'Product not found'], 404);
            }

            $data = [
                'name' => $request->input('name'),
                'slug' => $request->input('slug') ?: Str::slug($request->input('name')),
                'category_id' => $request->input('category_id') ?: null,
                'excerpt' => $request->input('description') !== '' ? $request->input('description') : null,
                'content' => $request->input('content') !== '' ? $request->input('content') : null,
                'features' => $request->input('features') !== '' ? $request->input('features') : null,
                'applications' => $request->input('applications') !== '' ? $request->input('applications') : null,
                'technical_specs' => $request->input('technical_specs') !== '' ? $request->input('technical_specs') : null,
                'meta_title' => $request->input('meta_title') !== '' ? $request->input('meta_title') : null,
                'meta_description' => $request->input('meta_description') !== '' ? $request->input('meta_description') : null,
                'is_active' => $request->input('is_active') === '1' || $request->input('is_active') === true,
                'is_featured' => $request->input('is_featured') === '1' || $request->input('is_featured') === true,
                'order' => $request->input('order', 0),
                'updated_at' => now()
            ];

            logger()->info('Data to be updated', $data);

            // Handle thumbnail upload
            if ($request->hasFile('thumbnail')) {
                // Delete old thumbnail
                if ($product->thumbnail && File::exists(public_path($product->thumbnail))) {
                    File::delete(public_path($product->thumbnail));
                }

                $file = $request->file('thumbnail');
                $filename = time() . '_' . Str::random(10) . '.' . $file->getClientOriginalExtension();
                $path = 'uploads/products';
                
                if (!File::exists(public_path($path))) {
                    File::makeDirectory(public_path($path), 0755, true);
                }
                
                $file->move(public_path($path), $filename);
                $data['thumbnail'] = 'backend/public/' . $path . '/' . $filename;
                
                logger()->info('Thumbnail updated', ['path' => $data['thumbnail']]);
            }

            DB::table('products')->where('id', $id)->update($data);

            logger()->info('Product updated successfully', ['id' => $id]);

            return response()->json([
                'message' => 'Product updated successfully'
            ]);

        } catch (\Exception $e) {
            logger()->error('Error updating product', [
                'id' => $id,
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
            return response()->json([
                'message' => 'Error updating product',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified product
     */
    public function destroy($id)
    {
        try {
            $product = DB::table('products')->where('id', $id)->first();
            if (!$product) {
                return response()->json(['message' => 'Product not found'], 404);
            }

            // Delete thumbnail file
            if ($product->thumbnail && File::exists(public_path($product->thumbnail))) {
                File::delete(public_path($product->thumbnail));
            }

            DB::table('products')->where('id', $id)->delete();

            logger()->info('Product deleted successfully', ['id' => $id]);

            return response()->json(['message' => 'Product deleted successfully']);

        } catch (\Exception $e) {
            logger()->error('Error deleting product', [
                'id' => $id,
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'message' => 'Error deleting product',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Toggle product status
     */
    public function toggleStatus($id)
    {
        try {
            $product = DB::table('products')->where('id', $id)->first();
            if (!$product) {
                return response()->json(['message' => 'Product not found'], 404);
            }

            DB::table('products')->where('id', $id)->update([
                'is_active' => !$product->is_active,
                'updated_at' => now()
            ]);

            return response()->json([
                'message' => 'Product status updated',
                'is_active' => !$product->is_active
            ]);

        } catch (\Exception $e) {
            logger()->error('Error toggling product status', [
                'id' => $id,
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'message' => 'Error toggling product status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Bulk delete products
     */
    public function bulkDelete(Request $request)
    {
        try {
            $ids = $request->input('ids', []);
            if (empty($ids)) {
                return response()->json(['message' => 'No products selected'], 400);
            }

            $products = DB::table('products')->whereIn('id', $ids)->get();
            
            // Delete thumbnail files
            foreach ($products as $product) {
                if ($product->thumbnail && File::exists(public_path($product->thumbnail))) {
                    File::delete(public_path($product->thumbnail));
                }
            }

            $deleted = DB::table('products')->whereIn('id', $ids)->delete();

            logger()->info('Products bulk deleted', ['count' => $deleted]);

            return response()->json([
                'message' => 'Products deleted successfully',
                'count' => $deleted
            ]);

        } catch (\Exception $e) {
            logger()->error('Error bulk deleting products', [
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'message' => 'Error deleting products',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
