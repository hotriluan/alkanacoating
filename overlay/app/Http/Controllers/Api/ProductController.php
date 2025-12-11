<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;

class ProductController extends Controller
{
    public function index()
    {
        return Product::with('category:id,name,slug')->latest()->paginate(12);
    }

    public function show(string $slug)
    {
        return Product::with('category')->where('slug',$slug)->firstOrFail();
    }
}
