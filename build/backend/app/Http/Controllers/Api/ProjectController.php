<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Traits\DeletesImages;

class ProjectController extends Controller
{
    use DeletesImages;

    public function index()
    {
        // Only return published projects for public listing
        return Project::withCount(['images', 'testimonials'])
            ->where('is_published', true)
            ->orderByDesc('created_at')
            ->paginate(12);
    }

    public function featured()
    {
        $projects = Project::orderBy('created_at', 'desc')->limit(6)->get();
        return response()->json($projects);
    }

    public function show(string $slug)
    {
        // Include related images and testimonials for detail page
        return Project::with(['images', 'testimonials'])
            ->where('slug', $slug)
            ->firstOrFail();
    }

    // Admin: create project
    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:projects,slug',
            'short_description' => 'nullable|string',
            'description' => 'nullable|string',
            'image' => 'nullable|string', // path or URL (frontend uses this field)
            'client' => 'nullable|string|max:255',
            'location' => 'nullable|string|max:255',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'budget_range' => 'nullable|string|max:255',
            'project_type' => 'nullable|string|max:255',
            'progress_percentage' => 'nullable|integer|min:0|max:100',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
            'features' => 'nullable', // array or json
            'video_url' => 'nullable|string|max:500',
            'is_published' => 'nullable|boolean',
        ]);

        // Map frontend fields to DB columns
        $project = new Project();
        $project->title = $data['title'];
    $project->slug = $data['slug'] ?? Str::slug($data['title']);
        $project->thumbnail = $data['image'] ?? null; // map image -> thumbnail
        $project->excerpt = $data['short_description'] ?? null; // optional summary
        $project->content = $data['description'] ?? null; // rich text content
        $project->client = $data['client'] ?? null;
        $project->location = $data['location'] ?? null;
        $project->start_date = $data['start_date'] ?? null;
        $project->end_date = $data['end_date'] ?? null;
        $project->budget_range = $data['budget_range'] ?? null;
        $project->project_type = $data['project_type'] ?? null;
        $project->progress_percentage = $data['progress_percentage'] ?? 0;
        $project->meta_title = $data['meta_title'] ?? null;
        $project->meta_description = $data['meta_description'] ?? null;
        $project->short_description = $data['short_description'] ?? null;
        $project->features = is_string($data['features'] ?? null)
            ? json_decode($data['features'], true)
            : ($data['features'] ?? []);
        $project->video_url = $data['video_url'] ?? null;
        $project->is_published = $data['is_published'] ?? true;
        $project->view_count = 0;
        $project->save();

        return response()->json($project->fresh(), 201);
    }

    // Admin: update project
    public function update(Request $request, int $id)
    {
        $project = Project::findOrFail($id);
        $data = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:projects,slug,' . $project->id,
            'short_description' => 'nullable|string',
            'description' => 'nullable|string',
            'image' => 'nullable|string',
            'client' => 'nullable|string|max:255',
            'location' => 'nullable|string|max:255',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'budget_range' => 'nullable|string|max:255',
            'project_type' => 'nullable|string|max:255',
            'progress_percentage' => 'nullable|integer|min:0|max:100',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
            'features' => 'nullable',
            'video_url' => 'nullable|string|max:500',
            'is_published' => 'nullable|boolean',
        ]);

        if (array_key_exists('title', $data)) $project->title = $data['title'];
        if (array_key_exists('slug', $data)) $project->slug = $data['slug'];
        if (array_key_exists('image', $data)) {
            // Delete old thumbnail if different
            $this->replaceImage($project->thumbnail, $data['image']);
            $project->thumbnail = $data['image'];
        }
        if (array_key_exists('short_description', $data)) $project->excerpt = $data['short_description'];
        if (array_key_exists('description', $data)) $project->content = $data['description'];
        foreach (['client','location','start_date','end_date','budget_range','project_type','progress_percentage','meta_title','meta_description','video_url','is_published'] as $f) {
            if (array_key_exists($f, $data)) $project->{$f} = $data[$f];
        }
        if (array_key_exists('features', $data)) {
            $project->features = is_string($data['features']) ? json_decode($data['features'], true) : $data['features'];
        }
        $project->save();

        return response()->json($project->fresh());
    }

    // Admin: delete project
    public function destroy(int $id)
    {
        $project = Project::findOrFail($id);
        
        // Delete thumbnail
        if ($project->thumbnail) {
            $this->deleteImageFile($project->thumbnail);
        }
        
        // Delete images array (if stored as JSON paths)
        if (!empty($project->images) && is_array($project->images)) {
            $this->deleteMultipleImages($project->images);
        }
        
        $project->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
