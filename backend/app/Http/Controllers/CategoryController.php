<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index()
    {
        try {
            $categories = Category::select('id', 'name', 'slug', 'image')
                ->withCount('products')
                ->orderBy('name', 'asc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $categories
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi tải danh mục: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show($slug)
    {
        try {
            $category = Category::where('slug', $slug)
                ->with([
                    'products' => function($query) {
                        $query->where('is_active', true)
                              ->select('id', 'name', 'slug', 'excerpt', 'category_id', 'thumbnail', 'images')
                              ->orderBy('name', 'asc');
                    },
                    'children' => function($query) {
                        $query->select('id', 'name', 'slug', 'icon', 'color', 'parent_id')
                              ->withCount('products')
                              ->orderBy('order', 'asc')
                              ->orderBy('name', 'asc');
                    },
                    'parent' => function($query) {
                        $query->select('id', 'name', 'slug');
                    }
                ])
                ->first();

            if (!$category) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy danh mục'
                ], 404);
            }

            return response()->json($category);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi tải danh mục: ' . $e->getMessage()
            ], 500);
        }
    }
}