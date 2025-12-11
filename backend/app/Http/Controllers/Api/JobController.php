<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Job;

class JobController extends Controller
{
    public function index()
    {
        return Job::latest()->paginate(12);
    }

    public function show(string $slug)
    {
        return Job::where('slug',$slug)->firstOrFail();
    }
}
