<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\Api\JobController;
use App\Http\Controllers\Api\SettingController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\Api\AdminProductController;
use App\Http\Controllers\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\Api\SliderController;
use App\Http\Controllers\Api\MenuController;
use App\Http\Controllers\Api\RecruitmentController;
use App\Http\Controllers\Api\ApplicationController;
use App\Http\Controllers\Api\SettingsController;

Route::get('/health', fn() => response()->json(['ok' => true]));
Route::get('/test', fn() => response()->json(['message' => 'Test endpoint working']));
Route::get('/test-admin-products', [\App\Http\Controllers\Api\AdminProductController::class, 'index']);

// Image serving routes
Route::get('/uploads/products/{filename}', function ($filename) {
    $path = public_path('uploads/products/' . $filename);
    
    if (!file_exists($path)) {
        abort(404);
    }
    
    return response()->file($path);
})->where('filename', '.*');

Route::get('/uploads/sliders/{filename}', function ($filename) {
    $path = storage_path('app/public/sliders/' . $filename);
    
    if (!file_exists($path)) {
        abort(404);
    }
    
    return response()->file($path);
})->where('filename', '.*');

// Admin Authentication Routes
Route::post('/admin/login', [AdminController::class, 'login']);
Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/admin/logout', [AdminController::class, 'logout']);
    Route::get('/admin/dashboard', [AdminController::class, 'dashboard']);
    Route::get('/admin/check-auth', [AdminController::class, 'checkAuth']);
    
    // Admin CRUD Routes - individual routes instead of apiResource
    Route::get('/admin/products', [AdminProductController::class, 'index']);
    Route::get('/admin/products/{id}', [AdminProductController::class, 'show']);
    Route::post('/admin/products', [AdminProductController::class, 'store']);
    Route::put('/admin/products/{id}', [AdminProductController::class, 'update']);
    Route::patch('/admin/products/{id}', [AdminProductController::class, 'update']);
    Route::delete('/admin/products/{id}', [AdminProductController::class, 'destroy']);
    Route::post('/admin/products/bulk-delete', [AdminProductController::class, 'bulkDelete']);
    Route::patch('/admin/products/{id}/toggle-status', [AdminProductController::class, 'toggleStatus']);
    
    // Admin Category Management
    Route::get('/admin/categories', [AdminCategoryController::class, 'index']);
    Route::post('/admin/categories', [AdminCategoryController::class, 'store']);
    Route::get('/admin/categories/{category:id}', [AdminCategoryController::class, 'show']);
    Route::put('/admin/categories/{category:id}', [AdminCategoryController::class, 'update']);
    Route::delete('/admin/categories/{category:id}', [AdminCategoryController::class, 'destroy']);
    Route::get('/admin/categories/options/list', [AdminCategoryController::class, 'options']);
    
    // Admin Slider Management
    Route::get('/admin/sliders', [SliderController::class, 'adminIndex']);
    Route::post('/admin/sliders', [SliderController::class, 'store']);
    Route::get('/admin/sliders/{slider}', [SliderController::class, 'show']);
    Route::put('/admin/sliders/{slider}', [SliderController::class, 'update']);
    Route::post('/admin/sliders/{slider}', [SliderController::class, 'update']); // For _method override
    Route::delete('/admin/sliders/{slider}', [SliderController::class, 'destroy']);
    
    // Admin Menu Management
    Route::apiResource('/admin/menus', MenuController::class);
    Route::post('/admin/menus/reorder', [MenuController::class, 'reorder']);
    Route::post('/admin/menus/bulk-update', [MenuController::class, 'bulkUpdate']);
    Route::get('/admin/menus/templates', [MenuController::class, 'templates']);
    // Admin Menu asset upload (images/icons)
    Route::post('/admin/menus/upload-asset', [MenuController::class, 'uploadAsset']);
    // Single menu operations
    Route::post('/admin/menus/{menu}/toggle-mega', [MenuController::class, 'toggleMegaMenu']);
    Route::post('/admin/menus/{menu}/update-config', [MenuController::class, 'updateConfig']);
    Route::get('/admin/menus/{menu}/preview', [MenuController::class, 'preview']);
    Route::post('/admin/menus/{menu}/duplicate', [MenuController::class, 'duplicate']);
    // Archived menus management
    Route::get('/admin/menus/archived', [MenuController::class, 'archivedIndex']);
    Route::post('/admin/menus/{id}/restore', [MenuController::class, 'restore']);
    Route::delete('/admin/menus/{id}/force-delete', [MenuController::class, 'forceDelete']);
    // Archived menus management
    Route::get('/admin/menus/archived', [\App\Http\Controllers\Admin\MenuArchiveController::class, 'index']);
    Route::post('/admin/menus/{id}/restore', [\App\Http\Controllers\Admin\MenuArchiveController::class, 'restore']);
    Route::delete('/admin/menus/{id}/force-delete', [\App\Http\Controllers\Admin\MenuArchiveController::class, 'forceDelete']);
    
    // Admin Project Management
    Route::apiResource('/admin/projects', ProjectController::class);
    
    // Admin Post Management
    Route::get('/admin/posts', [PostController::class, 'adminIndex']);
    Route::post('/admin/posts', [PostController::class, 'store']);
    Route::get('/admin/posts/{post}', [PostController::class, 'show']);
    Route::put('/admin/posts/{post}', [PostController::class, 'update']);
    Route::post('/admin/posts/{post}', [PostController::class, 'update']); // For _method override
    Route::delete('/admin/posts/{post}', [PostController::class, 'destroy']);
    Route::post('/admin/posts/{post}/duplicate', [PostController::class, 'duplicate']);
    
    // Admin Post Categories
    Route::get('/admin/post-categories', [\App\Http\Controllers\Api\PostCategoryController::class, 'adminIndex']);
    Route::apiResource('/admin/post-categories', \App\Http\Controllers\Api\PostCategoryController::class)->except(['index']);
    
    // Admin Post Tags
    Route::get('/admin/post-tags', [\App\Http\Controllers\Api\PostTagController::class, 'adminIndex']);
    Route::apiResource('/admin/post-tags', \App\Http\Controllers\Api\PostTagController::class)->except(['index']);
    
    // Admin Recruitment Management
    Route::apiResource('/admin/recruitments', RecruitmentController::class);
    
    // Admin Application Management
    Route::get('/admin/applications', [ApplicationController::class, 'index']);
    Route::get('/admin/applications/statistics', [ApplicationController::class, 'statistics']);
    Route::get('/admin/applications/{application}', [ApplicationController::class, 'show']);
    Route::put('/admin/applications/{application}/status', [ApplicationController::class, 'updateStatus']);
    Route::delete('/admin/applications/{application}', [ApplicationController::class, 'destroy']);
    Route::get('/admin/applications/{application}/download-cv', [ApplicationController::class, 'downloadCV']);
    
    // Admin Settings Management
    Route::get('/admin/settings', [SettingsController::class, 'adminIndex']);
    Route::post('/admin/settings', [SettingsController::class, 'update']);
    Route::post('/admin/settings/bulk', [SettingsController::class, 'bulkUpdate']);
    Route::delete('/admin/settings/{key}', [SettingsController::class, 'destroy']);
    Route::post('/admin/upload-image', [SettingsController::class, 'uploadImage']);
    
    // Admin Contact Management
    Route::get('/admin/contacts', [ContactController::class, 'index']);
    Route::get('/admin/contacts/stats', [ContactController::class, 'stats']);
    Route::get('/admin/contacts/{id}', [ContactController::class, 'show']);
    Route::put('/admin/contacts/{id}', [ContactController::class, 'update']);
    Route::delete('/admin/contacts/{id}', [ContactController::class, 'destroy']);
    
    // Admin User Management
    Route::get('/admin/users', [\App\Http\Controllers\Admin\UserController::class, 'index']);
    Route::post('/admin/users', [\App\Http\Controllers\Admin\UserController::class, 'store']);
    Route::get('/admin/users/stats', [\App\Http\Controllers\Admin\UserController::class, 'stats']);
    Route::get('/admin/users/{id}', [\App\Http\Controllers\Admin\UserController::class, 'show']);
    Route::put('/admin/users/{id}', [\App\Http\Controllers\Admin\UserController::class, 'update']);
    Route::delete('/admin/users/{id}', [\App\Http\Controllers\Admin\UserController::class, 'destroy']);
    
    // Image Cleanup Management
    Route::get('/admin/images/analytics', [\App\Http\Controllers\Admin\ImageCleanupController::class, 'analytics']);
    Route::get('/admin/images/scan-unused', [\App\Http\Controllers\Admin\ImageCleanupController::class, 'scanUnused']);
    Route::post('/admin/images/backup', [\App\Http\Controllers\Admin\ImageCleanupController::class, 'backup']);
    Route::post('/admin/images/delete-unused', [\App\Http\Controllers\Admin\ImageCleanupController::class, 'deleteUnused']);
});

Route::get('/settings', [SettingController::class, 'index']);

// Public API Routes
Route::get('/settings/public', [SettingsController::class, 'index']);
Route::get('/settings/group/{group}', [SettingsController::class, 'getByGroup']);

Route::get('/sliders', [SliderController::class, 'index']);
Route::get('/menus', [MenuController::class, 'index']);

Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{slug}', [CategoryController::class, 'show']);

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/featured', [ProductController::class, 'featured']);
Route::get('/products/{slug}', [ProductController::class, 'show']);

Route::get('/projects', [ProjectController::class, 'index']);
Route::get('/projects/featured', [ProjectController::class, 'featured']);
Route::get('/projects/{slug}', [ProjectController::class, 'show']);

Route::get('/posts', [PostController::class, 'index']);
Route::get('/posts/featured', [PostController::class, 'featured']);
Route::get('/posts/{slug}', [PostController::class, 'show']);

Route::get('/post-categories', [\App\Http\Controllers\Api\PostCategoryController::class, 'index']);
Route::get('/post-tags', [\App\Http\Controllers\Api\PostTagController::class, 'index']);

Route::get('/recruitments', [RecruitmentController::class, 'index']);
Route::get('/recruitments/{slug}', [RecruitmentController::class, 'show']);

// Public Application Submission
Route::post('/applications', [ApplicationController::class, 'submit']);

Route::get('/jobs', [JobController::class, 'index']);
Route::get('/jobs/{slug}', [JobController::class, 'show']);

Route::post('/contact', [ContactController::class, 'store']);
