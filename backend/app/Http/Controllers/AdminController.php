<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AdminController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (Auth::attempt($credentials)) {
            $user = Auth::user();
            
            // Check if user has admin role and is active
            if (in_array($user->role, ['admin', 'editor']) && $user->status === 'active') {
                $token = $user->createToken('admin-token')->plainTextToken;
                
                return response()->json([
                    'success' => true,
                    'token' => $token,
                    'user' => $user
                ]);
            } else {
                Auth::logout();
                $message = $user->status !== 'active' 
                    ? 'Tài khoản của bạn đã bị vô hiệu hóa' 
                    : 'Bạn không có quyền truy cập admin';
                return response()->json([
                    'success' => false,
                    'message' => $message
                ], 403);
            }
        }

        return response()->json([
            'success' => false,
            'message' => 'Email hoặc mật khẩu không đúng'
        ], 401);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Đăng xuất thành công'
        ]);
    }

    public function dashboard()
    {
        // Basic counts
        $stats = [
            'products' => \App\Models\Product::count(),
            'projects' => \App\Models\Project::count(),
            'posts' => \App\Models\Post::count(),
            'jobs' => \App\Models\Job::count(),
            'categories' => \App\Models\Category::count(),
            'sliders' => \App\Models\Slider::count(),
            'menus' => \App\Models\Menu::count(),
            'contacts' => \App\Models\Contact::count(),
        ];

        // Recent items
        $recentProducts = \App\Models\Product::orderBy('created_at', 'desc')->take(5)->get(['id', 'name', 'created_at']);
        $recentProjects = \App\Models\Project::orderBy('created_at', 'desc')->take(5)->get(['id', 'title as name', 'created_at']);
        $recentPosts = \App\Models\Post::orderBy('created_at', 'desc')->take(5)->get(['id', 'title', 'created_at']);
        $recentContacts = \App\Models\Contact::orderBy('created_at', 'desc')->take(5)->get(['id', 'name', 'email', 'created_at']);

        // Monthly stats (last 6 months)
        $monthlyData = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $monthlyData[] = [
                'month' => $date->format('M'),
                'products' => \App\Models\Product::whereYear('created_at', $date->year)
                    ->whereMonth('created_at', $date->month)->count(),
                'projects' => \App\Models\Project::whereYear('created_at', $date->year)
                    ->whereMonth('created_at', $date->month)->count(),
                'posts' => \App\Models\Post::whereYear('created_at', $date->year)
                    ->whereMonth('created_at', $date->month)->count(),
            ];
        }

        // Published vs Draft (some models don't have is_published, so just show total)
        $contentStatus = [
            'published_products' => \App\Models\Product::count(),
            'draft_products' => 0,
            'published_posts' => \App\Models\Post::count(),
            'draft_posts' => 0,
        ];

        return response()->json([
            'success' => true,
            'stats' => $stats,
            'recentProducts' => $recentProducts,
            'recentProjects' => $recentProjects,
            'recentPosts' => $recentPosts,
            'recentContacts' => $recentContacts,
            'monthlyData' => $monthlyData,
            'contentStatus' => $contentStatus,
        ]);
    }

    public function checkAuth()
    {
        return response()->json([
            'success' => true,
            'user' => Auth::user()
        ]);
    }
}
