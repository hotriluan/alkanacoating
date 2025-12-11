<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;

class ProductController extends Controller
{
    public function featured()
    {
        // Return only active products that are marked as featured
        return Product::where('is_active', true)
            ->where('is_featured', true)
            ->with(['category:id,name,slug', 'images'])
            ->select('id', 'name', 'slug', 'excerpt', 'content', 'category_id', 'is_active', 'is_featured', 'thumbnail', 'created_at', 'updated_at')
            ->latest()
            ->take(6)
            ->get();
    }

    public function index()
    {
        // Only list active products to public
        $query = Product::where('is_active', true)
            ->with(['category:id,name,slug', 'images'])
            ->select(
                'id', 'name', 'slug', 'excerpt', 'content', 'features', 'applications', 'technical_specs',
                'category_id', 'is_active', 'thumbnail', 'created_at', 'updated_at'
            );

        if (request()->has('category') && request('category')) {
            $categoryParam = request('category');
            // Check if it's a numeric ID or slug
            if (is_numeric($categoryParam)) {
                $query->where('category_id', $categoryParam);
            } else {
                // Filter by category slug
                $query->whereHas('category', function($q) use ($categoryParam) {
                    $q->where('slug', $categoryParam);
                });
            }
        }

        // Optional: filter by search term
        if (request()->has('search') && request('search')) {
            $search = request('search');
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                  ->orWhere('excerpt', 'like', "%$search%")
                  ->orWhere('content', 'like', "%$search%")
                ;
            });
        }

        return $query->latest()->paginate(12);
    }

    public function show(string $slug)
    {
        // Only show product details for active products
        return Product::with(['category', 'images'])->where('slug', $slug)->where('is_active', true)->firstOrFail();
    }
}
