<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PostTag;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PostTagController extends Controller
{
    // Public API - List popular tags
    public function index()
    {
        return PostTag::where('usage_count', '>', 0)
            ->orderBy('usage_count', 'desc')
            ->limit(20)
            ->get();
    }

    // Admin API - List all tags
    public function adminIndex()
    {
        return PostTag::orderBy('usage_count', 'desc')
            ->orderBy('name')
            ->get();
    }

    // Admin API - Create tag
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|unique:post_tags,slug',
            'color' => 'nullable|string',
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $tag = PostTag::create($validated);

        return response()->json($tag, 201);
    }

    // Admin API - Update tag
    public function update(Request $request, PostTag $postTag)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'slug' => 'nullable|string|unique:post_tags,slug,' . $postTag->id,
            'color' => 'nullable|string',
        ]);

        if (isset($validated['name']) && empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $postTag->update($validated);

        return response()->json($postTag);
    }

    // Admin API - Delete tag
    public function destroy(PostTag $postTag)
    {
        $postTag->posts()->detach();
        $postTag->delete();

        return response()->json(['message' => 'Tag deleted successfully']);
    }
}
