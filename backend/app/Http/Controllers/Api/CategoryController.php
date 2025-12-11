<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;

class CategoryController extends Controller
{
    public function index()
    {
        return Category::withCount('products')->orderBy('name')->get();
    }

    public function show(string $slug)
    {
        $category = Category::where('slug', $slug)->firstOrFail();
        $category->load('products');
        return $category;
    }
}
