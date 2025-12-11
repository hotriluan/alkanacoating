<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\Recruitment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ApplicationController extends Controller
{
    // Public endpoint - Submit application
    public function submit(Request $request)
    {
        $request->validate([
            'recruitment_id' => 'required|exists:recruitments,id',
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20',
            'cv_file' => 'required|file|mimes:pdf,doc,docx|max:5120', // 5MB max
            'cover_letter' => 'nullable|string|max:2000'
        ]);

        // Upload CV file
        $cvPath = null;
        if ($request->hasFile('cv_file')) {
            $file = $request->file('cv_file');
            $filename = time() . '_' . $file->getClientOriginalName();
            $cvPath = $file->storeAs('applications/cvs', $filename, 'public');
        }

        $application = Application::create([
            'recruitment_id' => $request->recruitment_id,
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'cv_file' => $cvPath,
            'cover_letter' => $request->cover_letter,
            'status' => 'new'
        ]);

        return response()->json([
            'message' => 'Ứng tuyển thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.',
            'application' => $application
        ], 201);
    }

    // Admin endpoints
    public function index(Request $request)
    {
        $query = Application::with('recruitment:id,title,slug');

        // Filter by recruitment
        if ($request->has('recruitment_id')) {
            $query->where('recruitment_id', $request->recruitment_id);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Search by name or email
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $applications = $query->latest()->get();

        return response()->json($applications);
    }

    public function show(Application $application)
    {
        $application->load('recruitment:id,title,slug,description,requirements,location,salary,deadline');
        return response()->json($application);
    }

    public function updateStatus(Request $request, Application $application)
    {
        $request->validate([
            'status' => 'required|in:new,reviewing,shortlisted,rejected,accepted',
            'admin_notes' => 'nullable|string'
        ]);

        $application->update([
            'status' => $request->status,
            'admin_notes' => $request->admin_notes
        ]);

        return response()->json([
            'message' => 'Cập nhật trạng thái thành công',
            'application' => $application
        ]);
    }

    public function destroy(Application $application)
    {
        // Delete CV file if exists
        if ($application->cv_file && Storage::disk('public')->exists($application->cv_file)) {
            Storage::disk('public')->delete($application->cv_file);
        }

        $application->delete();

        return response()->json([
            'message' => 'Xóa hồ sơ thành công'
        ], 204);
    }

    // Download CV
    public function downloadCV(Application $application)
    {
        if (!$application->cv_file) {
            return response()->json(['message' => 'Không tìm thấy file CV'], 404);
        }

        $filePath = storage_path('app/public/' . $application->cv_file);
        
        if (!file_exists($filePath)) {
            return response()->json(['message' => 'File không tồn tại'], 404);
        }

        return response()->download($filePath);
    }

    // Get statistics
    public function statistics()
    {
        $stats = [
            'total' => Application::count(),
            'new' => Application::where('status', 'new')->count(),
            'reviewing' => Application::where('status', 'reviewing')->count(),
            'shortlisted' => Application::where('status', 'shortlisted')->count(),
            'rejected' => Application::where('status', 'rejected')->count(),
            'accepted' => Application::where('status', 'accepted')->count(),
        ];

        return response()->json($stats);
    }
}
