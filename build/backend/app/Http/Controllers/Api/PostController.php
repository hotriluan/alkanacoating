<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\PostCategory;
use App\Models\PostTag;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Traits\DeletesImages;

class PostController extends Controller
{
    use DeletesImages;

    // Public API - Listing with filters
    public function index(Request $request)
    {
        $query = Post::query()
            ->with(['category', 'author', 'postTags'])
            ->published();

        // Filter by category
        if ($request->has('category')) {
            if (is_numeric($request->category)) {
                $query->where('category_id', $request->category);
            } else {
                $query->whereHas('category', function ($q) use ($request) {
                    $q->where('slug', $request->category);
                });
            }
        }

        // Filter by tag
        if ($request->has('tag')) {
            if (is_numeric($request->tag)) {
                $query->byTag($request->tag);
            } else {
                $query->whereHas('postTags', function ($q) use ($request) {
                    $q->where('slug', $request->tag);
                });
            }
        }

        // Search
        if ($request->has('search') && $request->search) {
            $query->search($request->search);
        }

        // Featured first
        $query->orderBy('is_featured', 'desc')
              ->orderBy('published_at', 'desc');

        return $query->paginate($request->get('per_page', 12));
    }

    // Public API - Featured posts
    public function featured()
    {
        $posts = Post::with(['category', 'author'])
            ->published()
            ->featured()
            ->orderBy('published_at', 'desc')
            ->limit(6)
            ->get();

        return response()->json($posts);
    }

    // Public API - Single post detail
    public function show(string $slug)
    {
        $post = Post::with(['category', 'author', 'postTags'])
            ->where('slug', $slug)
            ->firstOrFail();

        // Increment view count
        $post->incrementViewCount();

        // Get related posts
        $related = Post::with(['category'])
            ->published()
            ->where('id', '!=', $post->id)
            ->where(function ($query) use ($post) {
                $query->where('category_id', $post->category_id)
                      ->orWhereHas('postTags', function ($q) use ($post) {
                          $q->whereIn('post_tags.id', $post->postTags->pluck('id'));
                      });
            })
            ->limit(3)
            ->get();

        return response()->json([
            'post' => $post,
            'related' => $related
        ]);
    }

    // Admin API - List all posts
    public function adminIndex(Request $request)
    {
        $query = Post::with(['category', 'author', 'postTags']);

        // Filters
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }
        if ($request->has('search')) {
            $query->search($request->search);
        }

        $query->orderBy('created_at', 'desc');

        return $query->paginate($request->get('per_page', 20));
    }

    // Admin API - Create post
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|unique:posts,slug',
            'excerpt' => 'nullable|string',
            'content' => 'nullable|string',
            'image' => 'nullable|string',
            'thumbnail' => 'nullable|string',
            'featured_image' => 'nullable|string',
            'category_id' => 'nullable|exists:post_categories,id',
            'tags' => 'nullable|array',
            'status' => 'nullable|in:draft,published',
            'is_featured' => 'nullable|boolean',
            'is_published' => 'nullable|boolean',
            'published_at' => 'nullable|date',
            'meta_title' => 'nullable|string',
            'meta_description' => 'nullable|string',
            'meta_keywords' => 'nullable|string',
        ]);

        // Auto-generate slug if not provided
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title']);
        }

        // Set author
        $validated['author_id'] = auth()->id();

        // Set published_at if publishing
        if (!empty($validated['is_published']) && empty($validated['published_at'])) {
            $validated['published_at'] = now();
        }

        // Extract tag IDs if provided
        $tagIds = $validated['tags'] ?? [];
        unset($validated['tags']);

        $post = Post::create($validated);

        // Calculate reading time
        $post->calculateReadingTime();

        // Sync tags
        if (!empty($tagIds)) {
            $post->postTags()->sync($tagIds);
            // Update tag usage counts
            foreach ($tagIds as $tagId) {
                $tag = PostTag::find($tagId);
                if ($tag) {
                    $tag->incrementUsage();
                }
            }
        }

        return response()->json($post->load(['category', 'author', 'postTags']), 201);
    }

    // Admin API - Update post
    public function update(Request $request, Post $post)
    {
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'slug' => 'nullable|string|unique:posts,slug,' . $post->id,
            'excerpt' => 'nullable|string',
            'content' => 'nullable|string',
            'image' => 'nullable|string',
            'thumbnail' => 'nullable|string',
            'featured_image' => 'nullable|string',
            'category_id' => 'nullable|exists:post_categories,id',
            'tags' => 'nullable|array',
            'status' => 'nullable|in:draft,published',
            'is_featured' => 'nullable|boolean',
            'is_published' => 'nullable|boolean',
            'published_at' => 'nullable|date',
            'meta_title' => 'nullable|string',
            'meta_description' => 'nullable|string',
            'meta_keywords' => 'nullable|string',
        ]);

        // Update slug if title changed
        if (isset($validated['title']) && empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title']);
        }

        // Replace old thumbnail if new one provided
        if (isset($validated['thumbnail'])) {
            $this->replaceImage($post->thumbnail, $validated['thumbnail']);
        }

        // Extract tag IDs
        $tagIds = $validated['tags'] ?? null;
        unset($validated['tags']);

        $post->update($validated);

        // Recalculate reading time if content changed
        if (isset($validated['content'])) {
            $post->calculateReadingTime();
        }

        // Sync tags if provided
        if ($tagIds !== null) {
            $oldTagIds = $post->postTags->pluck('id')->toArray();
            $post->postTags()->sync($tagIds);

            // Update usage counts
            foreach (array_diff($oldTagIds, $tagIds) as $removedTagId) {
                $tag = PostTag::find($removedTagId);
                if ($tag) $tag->decrementUsage();
            }
            foreach (array_diff($tagIds, $oldTagIds) as $addedTagId) {
                $tag = PostTag::find($addedTagId);
                if ($tag) $tag->incrementUsage();
            }
        }

        return response()->json($post->load(['category', 'author', 'postTags']));
    }

    // Admin API - Delete post
    public function destroy(Post $post)
    {
        // Delete thumbnail image
        if ($post->thumbnail) {
            $this->deleteImageFile($post->thumbnail);
        }
        
        // Decrement tag usage counts
        foreach ($post->postTags as $tag) {
            $tag->decrementUsage();
        }

        $post->delete();

        return response()->json(['message' => 'Post deleted successfully']);
    }

    // Admin API - Duplicate post
    public function duplicate(Post $post)
    {
        $newPost = $post->replicate();
        $newPost->title = $post->title . ' (Copy)';
        $newPost->slug = Str::slug($newPost->title) . '-' . time();
        $newPost->is_published = false;
        $newPost->published_at = null;
        $newPost->view_count = 0;
        $newPost->save();

        // Copy tags
        $newPost->postTags()->sync($post->postTags->pluck('id'));

        return response()->json($newPost->load(['category', 'author', 'postTags']), 201);
    }
}

