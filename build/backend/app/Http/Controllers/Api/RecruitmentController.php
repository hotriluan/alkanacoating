<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Recruitment;
use Illuminate\Http\Request;

class RecruitmentController extends Controller
{
    public function index()
    {
        $recruitments = Recruitment::withCount('applications')
            ->active()
            ->latest()
            ->get();
        return response()->json($recruitments);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|unique:recruitments,slug',
            'description' => 'nullable|string',
            'requirements' => 'nullable|string',
            'location' => 'nullable|string|max:255',
            'salary' => 'nullable|string|max:255',
            'deadline' => 'nullable|date|after:today',
            'status' => 'string|in:open,closed'
        ]);

        $recruitment = Recruitment::create($request->all());
        return response()->json($recruitment, 201);
    }

    public function show($slug)
    {
        $recruitment = Recruitment::where('slug', $slug)->active()->firstOrFail();
        return response()->json($recruitment);
    }

    public function update(Request $request, Recruitment $recruitment)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|unique:recruitments,slug,' . $recruitment->id,
            'description' => 'nullable|string',
            'requirements' => 'nullable|string',
            'location' => 'nullable|string|max:255',
            'salary' => 'nullable|string|max:255',
            'deadline' => 'nullable|date|after:today',
            'status' => 'string|in:open,closed'
        ]);

        $recruitment->update($request->all());
        return response()->json($recruitment);
    }

    public function destroy(Recruitment $recruitment)
    {
        $recruitment->delete();
        return response()->json(null, 204);
    }
}