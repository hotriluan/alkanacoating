<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PostCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PostCategoryController extends Controller
{
    // Public API - List categories
    public function index()
    {
        $categories = PostCategory::with(['posts' => function ($query) {
                $query->published()->limit(1);
            }])
            ->active()
            ->ordered()
            ->get()
            ->map(function ($category) {
                $category->posts_count = $category->publishedPosts()->count();
                return $category;
            });

        return response()->json($categories);
    }

    // Admin API - List all categories
    public function adminIndex()
    {
        return PostCategory::withCount('posts')
            ->ordered()
            ->get();
    }

    // Admin API - Create category
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|unique:post_categories,slug',
            'description' => 'nullable|string',
            'icon' => 'nullable|string',
            'color' => 'nullable|string',
            'image' => 'nullable|string',
            'order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $category = PostCategory::create($validated);

        return response()->json($category, 201);
    }

    // Admin API - Update category
    public function update(Request $request, PostCategory $postCategory)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'slug' => 'nullable|string|unique:post_categories,slug,' . $postCategory->id,
            'description' => 'nullable|string',
            'icon' => 'nullable|string',
            'color' => 'nullable|string',
            'image' => 'nullable|string',
            'order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        if (isset($validated['name']) && empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $postCategory->update($validated);

        return response()->json($postCategory);
    }

    // Admin API - Delete category
    public function destroy(PostCategory $postCategory)
    {
        // Set posts' category_id to null
        $postCategory->posts()->update(['category_id' => null]);

        $postCategory->delete();

        return response()->json(['message' => 'Category deleted successfully']);
    }
}
