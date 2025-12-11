<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;

class PostController extends Controller
{
    public function index()
    {
        return Post::latest()->paginate(12);
    }

    public function show(string $slug)
    {
        return Post::where('slug',$slug)->firstOrFail();
    }
}
