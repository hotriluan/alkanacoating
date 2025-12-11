<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\Api\JobController;
use App\Http\Controllers\Api\SettingController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\Api\SliderController;
use App\Http\Controllers\Api\MenuController;
use App\Http\Controllers\Api\RecruitmentController;
use App\Http\Controllers\Api\ApplicationController;
use App\Http\Controllers\Api\SettingsController;

/*
|--------------------------------------------------------------------------
| Public API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register public API routes for your application.
| These routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group.
|
*/

Route::get('/health', fn() => response()->json(['ok' => true]));

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

Route::get('/uploads/posts/{filename}', function ($filename) {
    $path = public_path('uploads/posts/' . $filename);
    if (!file_exists($path)) {
        abort(404);
    }
    return response()->file($path);
})->where('filename', '.*');

// Public API Routes
Route::get('/settings/public-settings', [SettingsController::class, 'getPublicSettings']);
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


