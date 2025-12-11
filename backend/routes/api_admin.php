<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\Api\JobController;
use App\Http\Controllers\Api\SettingController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\Api\AdminProductController;
use App\Http\Controllers\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Api\SliderController;
use App\Http\Controllers\Api\MenuController;
use App\Http\Controllers\Api\RecruitmentController;
use App\Http\Controllers\Api\ApplicationController;
use App\Http\Controllers\Api\SettingsController;
use App\Http\Controllers\Admin\GoogleAnalyticsController;

/*
|--------------------------------------------------------------------------
| Admin API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application's admin panel.
|
*/

// These routes are loaded by the RouteServiceProvider within a group which
// is assigned the "api" middleware group and prefixed with "/api/admin".

// Admin Authentication
Route::post('/login', [AdminController::class, 'login']);

// Authenticated Admin Routes
Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/logout', [AdminController::class, 'logout']);
    Route::get('/dashboard', [AdminController::class, 'dashboard']);
    Route::get('/check-auth', [AdminController::class, 'checkAuth']);
    Route::get('/test-simple', function (Request $request) {
        return response()->json([
            'ok' => true,
            'user' => $request->user(),
            'token' => $request->bearerToken()
        ]);
    });

    // Admin Product Management
    Route::get('/products', [AdminProductController::class, 'index']);
    Route::get('/products/{id}', [AdminProductController::class, 'show']);
    Route::post('/products', [AdminProductController::class, 'store']);
    Route::put('/products/{id}', [AdminProductController::class, 'update']);
    Route::post('/products/{id}', [AdminProductController::class, 'update']); // For _method override
    Route::patch('/products/{id}', [AdminProductController::class, 'update']);
    Route::delete('/products/{id}', [AdminProductController::class, 'destroy']);
    Route::post('/products/bulk-delete', [AdminProductController::class, 'bulkDelete']);
    Route::patch('/products/{id}/toggle-status', [AdminProductController::class, 'toggleStatus']);

    // Admin Category Management
    Route::get('/categories', [AdminCategoryController::class, 'index']);
    Route::post('/categories', [AdminCategoryController::class, 'store']);
    Route::get('/categories/{id}', [AdminCategoryController::class, 'show']);
    Route::put('/categories/{id}', [AdminCategoryController::class, 'update']);
    Route::post('/categories/{id}', [AdminCategoryController::class, 'update']); // For _method override
    Route::delete('/categories/{id}', [AdminCategoryController::class, 'destroy']);
    Route::get('/categories/options/list', [AdminCategoryController::class, 'options']);

    // Admin Slider Management
    Route::get('/sliders', [SliderController::class, 'adminIndex']);
    Route::post('/sliders', [SliderController::class, 'store']);
    Route::get('/sliders/{slider}', [SliderController::class, 'show']);
    Route::put('/sliders/{slider}', [SliderController::class, 'update']);
    Route::post('/sliders/{slider}', [SliderController::class, 'update']); // For _method override
    Route::delete('/sliders/{slider}', [SliderController::class, 'destroy']);

    // Admin Menu Management
    Route::apiResource('/menus', MenuController::class);
    Route::post('/menus/reorder', [MenuController::class, 'reorder']);
    Route::post('/menus/bulk-update', [MenuController::class, 'bulkUpdate']);
    Route::get('/menus/templates', [MenuController::class, 'templates']);
    Route::post('/menus/upload-asset', [MenuController::class, 'uploadAsset']);
    Route::post('/menus/{menu}/toggle-mega', [MenuController::class, 'toggleMegaMenu']);
    Route::post('/menus/{menu}/update-config', [MenuController::class, 'updateConfig']);
    Route::get('/menus/{menu}/preview', [MenuController::class, 'preview']);
    Route::post('/menus/{menu}/duplicate', [MenuController::class, 'duplicate']);
    Route::get('/menus/archived', [\App\Http\Controllers\Admin\MenuArchiveController::class, 'index']);
    Route::post('/menus/{id}/restore', [\App\Http\Controllers\Admin\MenuArchiveController::class, 'restore']);
    Route::delete('/menus/{id}/force-delete', [\App\Http\Controllers\Admin\MenuArchiveController::class, 'forceDelete']);

    // Admin Project Management
    Route::get('/projects', [ProjectController::class, 'adminIndex']);
    Route::get('/projects/{id}', [ProjectController::class, 'adminShow']);
    Route::post('/projects', [ProjectController::class, 'store']);
    Route::put('/projects/{id}', [ProjectController::class, 'update']);
    Route::post('/projects/{id}', [ProjectController::class, 'update']); // For _method override
    Route::delete('/projects/{id}', [ProjectController::class, 'destroy']);

    // Admin Post Management
    Route::get('/posts', [PostController::class, 'adminIndex']);
    Route::post('/posts', [PostController::class, 'store']);
    Route::get('/posts/{post}', [PostController::class, 'show']);
    Route::put('/posts/{post}', [PostController::class, 'update']);
    Route::post('/posts/{post}', [PostController::class, 'update']); // For _method override
    Route::delete('/posts/{post}', [PostController::class, 'destroy']);
    Route::post('/posts/{post}/duplicate', [PostController::class, 'duplicate']);

    // Admin Post Categories & Tags
    Route::get('/post-categories', [\App\Http\Controllers\Api\PostCategoryController::class, 'adminIndex']);
    Route::apiResource('/post-categories', \App\Http\Controllers\Api\PostCategoryController::class)->except(['index']);
    Route::get('/post-tags', [\App\Http\Controllers\Api\PostTagController::class, 'adminIndex']);
    Route::apiResource('/post-tags', \App\Http\Controllers\Api\PostTagController::class)->except(['index']);

    // Admin Recruitment & Application Management
    Route::apiResource('/recruitments', RecruitmentController::class);
    Route::get('/applications', [ApplicationController::class, 'index']);
    Route::get('/applications/statistics', [ApplicationController::class, 'statistics']);
    Route::get('/applications/{application}', [ApplicationController::class, 'show']);
    Route::put('/applications/{application}/status', [ApplicationController::class, 'updateStatus']);
    Route::delete('/applications/{application}', [ApplicationController::class, 'destroy']);
    Route::get('/applications/{application}/download-cv', [ApplicationController::class, 'downloadCV']);

    // Admin Settings Management
    Route::get('/settings', [SettingsController::class, 'adminIndex']);
    Route::post('/settings', [SettingsController::class, 'update']);
    Route::post('/settings/bulk', [SettingsController::class, 'bulkUpdate']);
    Route::delete('/settings/{key}', [SettingsController::class, 'destroy']);
    Route::post('/upload-image', [SettingsController::class, 'uploadImage']);
    Route::post('/settings/upload-analytics-json', [SettingsController::class, 'uploadAnalyticsJson']);
    Route::get('/settings/check-analytics-json', [SettingsController::class, 'checkAnalyticsJson']);

    // Admin Contact Management
    Route::get('/contacts', [ContactController::class, 'index']);
    Route::get('/contacts/stats', [ContactController::class, 'stats']);
    Route::get('/contacts/{id}', [ContactController::class, 'show']);
    Route::put('/contacts/{id}', [ContactController::class, 'update']);
    Route::delete('/contacts/{id}', [ContactController::class, 'destroy']);

    // Admin User Management
    Route::get('/users', [\App\Http\Controllers\Admin\UserController::class, 'index']);
    Route::post('/users', [\App\Http\Controllers\Admin\UserController::class, 'store']);
    Route::get('/users/stats', [\App\Http\Controllers\Admin\UserController::class, 'stats']);
    Route::get('/users/{id}', [\App\Http\Controllers\Admin\UserController::class, 'show']);
    Route::put('/users/{id}', [\App\Http\Controllers\Admin\UserController::class, 'update']);
    Route::delete('/users/{id}', [\App\Http\Controllers\Admin\UserController::class, 'destroy']);

    // Image Cleanup Management
    Route::get('/images/analytics', [\App\Http\Controllers\Admin\ImageCleanupController::class, 'analytics']);
    Route::get('/images/scan-unused', [\App\Http\Controllers\Admin\ImageCleanupController::class, 'scanUnused']);
    Route::post('/images/backup', [\App\Http\Controllers\Admin\ImageCleanupController::class, 'backup']);
    Route::post('/images/delete-unused', [\App\Http\Controllers\Admin\ImageCleanupController::class, 'deleteUnused']);

    // Backup & Restore
    Route::get('/backups', [\App\Http\Controllers\Admin\BackupController::class, 'index']);
    Route::post('/backups/data', [\App\Http\Controllers\Admin\BackupController::class, 'createData']);
    Route::post('/backups/full', [\App\Http\Controllers\Admin\BackupController::class, 'createFull']);
    Route::get('/backups/{filename}/download', [\App\Http\Controllers\Admin\BackupController::class, 'download']);
    Route::get('/backups/installer', [\App\Http\Controllers\Admin\BackupController::class, 'downloadInstaller']);
    Route::post('/backups/{filename}/restore', [\App\Http\Controllers\Admin\BackupController::class, 'restore']);
    Route::delete('/backups/{filename}', [\App\Http\Controllers\Admin\BackupController::class, 'delete']);

    // Google Analytics
    Route::get('/analytics', [GoogleAnalyticsController::class, 'fetchAnalytics']);
});
