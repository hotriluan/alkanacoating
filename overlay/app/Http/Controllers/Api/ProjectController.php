<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;

class ProjectController extends Controller
{
    public function index()
    {
        return Project::latest()->paginate(12);
    }

    public function show(string $slug)
    {
        return Project::where('slug',$slug)->firstOrFail();
    }
}
