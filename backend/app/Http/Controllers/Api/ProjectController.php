<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Traits\DeletesImages;
use App\Models\ProjectImage;

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

    // Admin list: include all projects with minimal fields
    public function adminIndex()
    {
        return Project::orderByDesc('created_at')
            ->select(['id','title','slug','thumbnail','image','short_description','description','client','location','project_type','progress_percentage','status','is_published','is_featured','view_count','order','created_at'])
            ->paginate(50);
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

    // Admin show by ID with relations
    public function adminShow(int $id)
    {
        return Project::with(['images', 'testimonials'])->findOrFail($id);
    }

    // Admin: create project
    public function store(Request $request)
    {
        // Flexible validation: accept both file upload and string path
        $rules = [
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:projects,slug',
            'short_description' => 'nullable|string',
            'description' => 'nullable|string',
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
            'is_featured' => 'nullable|boolean',
            'order' => 'nullable|integer|min:0',
            'status' => 'nullable|string|in:published,draft',
        ];
        
        // Add image validation only if file is being uploaded
        if ($request->hasFile('image') || $request->hasFile('thumbnail')) {
            $rules['image'] = 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:8192';
            $rules['thumbnail'] = 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:8192';
        } else {
            $rules['image'] = 'nullable|string';
            $rules['thumbnail'] = 'nullable|string';
        }
        
        $data = $request->validate($rules);

        logger()->info('Project store request', [
            'all_data' => $request->all(),
            'files' => $request->allFiles(),
        ]);

        // Map frontend fields to DB columns
        $project = new Project();
        $project->title = $data['title'];
        $project->slug = $data['slug'] ?? Str::slug($data['title']);
        
        // Handle image upload
        if ($request->hasFile('image') || $request->hasFile('thumbnail')) {
            $imageFile = $request->file('image') ?: $request->file('thumbnail');
            $imageName = time() . '_' . Str::random(10) . '.' . $imageFile->getClientOriginalExtension();
            $imageFile->move(public_path('uploads/projects'), $imageName);
            $project->thumbnail = 'backend/public/uploads/projects/' . $imageName;
        } elseif (!empty($data['image']) && is_string($data['image'])) {
            // Accept string path (URL or relative path)
            $project->thumbnail = $data['image'];
        }
        
        $project->excerpt = $data['short_description'] ?? null; // optional summary
        $project->content = $data['description'] ?? null; // rich text content
        $project->short_description = $data['short_description'] ?? null;
        $project->description = $data['description'] ?? null;
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
        $project->status = $data['status'] ?? ($project->is_published ? 'published' : 'draft');
        $project->is_featured = $data['is_featured'] ?? false;
        $project->order = $data['order'] ?? 0;
        $project->view_count = 0;
        $project->save();

        // Sync gallery images if provided
        $this->syncProjectImages($request, $project);

        logger()->info('Project stored', [
            'id' => $project->id,
            'thumbnail' => $project->thumbnail,
            'status' => $project->status,
            'is_published' => $project->is_published,
            'is_featured' => $project->is_featured,
        ]);

        return response()->json($project->fresh()->load('images'), 201);
    }

    // Admin: update project
    public function update(Request $request, int $id)
    {
        logger()->info('Project update request', [
            'id' => $id,
            'all_data' => $request->all(),
            'files' => $request->allFiles(),
        ]);
        
        $project = Project::findOrFail($id);
        
        // Flexible validation: accept both file upload and string path
        $rules = [
            'title' => 'sometimes|required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:projects,slug,' . $project->id,
            'short_description' => 'nullable|string',
            'description' => 'nullable|string',
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
            'is_video_visible' => 'nullable|boolean',
            'is_published' => 'nullable|boolean',
            'is_featured' => 'nullable|boolean',
            'order' => 'nullable|integer|min:0',
            'status' => 'nullable|string|in:published,draft',
        ];
        
        // Add image validation only if file is being uploaded
        if ($request->hasFile('image') || $request->hasFile('thumbnail')) {
            $rules['image'] = 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:8192';
            $rules['thumbnail'] = 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:8192';
        } else {
            $rules['image'] = 'nullable|string';
            $rules['thumbnail'] = 'nullable|string';
        }
        
        $data = $request->validate($rules);

        if (array_key_exists('title', $data)) $project->title = $data['title'];
        if (array_key_exists('slug', $data)) $project->slug = $data['slug'];
        
        // Handle image upload (accept both 'image' and 'thumbnail')
        if ($request->hasFile('image') || $request->hasFile('thumbnail')) {
            // Delete old thumbnail
            if ($project->thumbnail) {
                $this->deleteImageFile($project->thumbnail);
            }
            
            $imageFile = $request->file('image') ?: $request->file('thumbnail');
            $imageName = time() . '_' . Str::random(10) . '.' . $imageFile->getClientOriginalExtension();
            $imageFile->move(public_path('uploads/projects'), $imageName);
            $project->thumbnail = 'backend/public/uploads/projects/' . $imageName;
        } elseif (array_key_exists('image', $data) && is_string($data['image']) && !empty($data['image'])) {
            // Update thumbnail path if provided as string (e.g., when keeping existing image)
            $project->thumbnail = $data['image'];
        }
        if (array_key_exists('short_description', $data)) $project->excerpt = $data['short_description'];
        if (array_key_exists('description', $data)) $project->content = $data['description'];
        if (array_key_exists('short_description', $data)) $project->short_description = $data['short_description'];
        if (array_key_exists('description', $data)) $project->description = $data['description'];
        foreach (['client','location','start_date','end_date','budget_range','project_type','progress_percentage','meta_title','meta_description','video_url','is_video_visible','is_published'] as $f) {
            if (array_key_exists($f, $data)) $project->{$f} = $data[$f];
        }
        if (array_key_exists('status', $data)) {
            $project->status = $data['status'];
        }
        if (array_key_exists('features', $data)) {
            $project->features = is_string($data['features']) ? json_decode($data['features'], true) : $data['features'];
        }
        if (array_key_exists('is_featured', $data)) {
            $project->is_featured = $data['is_featured'];
        }
        if (array_key_exists('order', $data)) {
            $project->order = $data['order'];
        }
        
        $project->save();
        
        // Sync gallery images (add new, update existing, delete removed)
        $this->syncProjectImages($request, $project);

        logger()->info('Project updated', [
            'id' => $project->id,
            'thumbnail' => $project->thumbnail,
            'status' => $project->status,
            'is_published' => $project->is_published,
            'is_featured' => $project->is_featured,
        ]);

        return response()->json($project->fresh()->load('images'));
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

    /**
     * Sync project gallery images from request.
     * Handles adding new images, updating metadata of existing ones, and determining which to delete.
     */
    private function syncProjectImages(Request $request, Project $project): void
    {
        $requestedImagesData = $request->input('project_images', []);
        $existingImageIds = $project->images->pluck('id')->toArray();
        $newImageIds = []; // To keep track of images that should remain

        // Process images from the request
        foreach ($requestedImagesData as $index => $imageData) {
            // Check if it's a new file upload
            $file = $request->file("project_images.$index.file");

            if ($file) { // New image file is provided
                try {
                    $imageName = time() . '_' . $index . '_' . Str::random(10) . '.' . $file->getClientOriginalExtension();
                    $file->move(public_path('uploads/projects'), $imageName);
                    $imageUrl = 'backend/public/uploads/projects/' . $imageName;

                    $newImage = ProjectImage::create([
                        'project_id' => $project->id,
                        'image_url' => $imageUrl,
                        'caption' => $imageData['caption'] ?? null,
                        'alt_text' => $imageData['alt_text'] ?? null,
                        'image_type' => $imageData['image_type'] ?? 'gallery',
                        'sort_order' => (int) ($imageData['sort_order'] ?? ($index + 1)),
                        'is_featured' => false,
                    ]);
                    $newImageIds[] = $newImage->id;
                } catch (\Throwable $e) {
                    logger()->error('Failed adding new project gallery image', [
                        'project_id' => $project->id,
                        'index' => $index,
                        'error' => $e->getMessage(),
                    ]);
                }
            } elseif (isset($imageData['id'])) { // Existing image, update its metadata
                $projectImage = ProjectImage::find($imageData['id']);
                if ($projectImage && $projectImage->project_id === $project->id) {
                    try {
                        $projectImage->update([
                            'caption' => $imageData['caption'] ?? null,
                            'alt_text' => $imageData['alt_text'] ?? null,
                            'image_type' => $imageData['image_type'] ?? 'gallery',
                            'sort_order' => (int) ($imageData['sort_order'] ?? ($index + 1)),
                        ]);
                        $newImageIds[] = $projectImage->id;
                    } catch (\Throwable $e) {
                        logger()->error('Failed updating existing project gallery image', [
                            'project_id' => $project->id,
                            'image_id' => $projectImage->id,
                            'error' => $e->getMessage(),
                        ]);
                    }
                }
            }
        }

        // Delete images that were not in the request (i.e., removed by frontend)
        $imagesToDelete = array_diff($existingImageIds, $newImageIds);
        foreach ($imagesToDelete as $imageId) {
            $image = ProjectImage::find($imageId);
            if ($image) {
                $this->deleteImageFile($image->image_url); // Delete physical file
                $image->delete(); // Delete from database
            }
        }
    }
}
