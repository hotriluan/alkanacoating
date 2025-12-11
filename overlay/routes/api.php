<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\Api\JobController;
use App\Http\Controllers\Api\SettingController;
use App\Http\Controllers\Api\ContactController;

Route::get('/health', fn() => response()->json(['ok' => true]));

Route::get('/settings', [SettingController::class, 'index']);

Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{slug}', [CategoryController::class, 'show']);

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{slug}', [ProductController::class, 'show']);

Route::get('/projects', [ProjectController::class, 'index']);
Route::get('/projects/{slug}', [ProjectController::class, 'show']);

Route::get('/posts', [PostController::class, 'index']);
Route::get('/posts/{slug}', [PostController::class, 'show']);

Route::get('/jobs', [JobController::class, 'index']);
Route::get('/jobs/{slug}', [JobController::class, 'show']);

Route::post('/contact', [ContactController::class, 'store']);
<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\PublicController;

Route::get('/health', [PublicController::class, 'health']);
Route::get('/company', [PublicController::class, 'company']);
Route::get('/categories', [PublicController::class, 'categories']);
Route::get('/products', [PublicController::class, 'products']);
Route::get('/products/{slug}', [PublicController::class, 'product']);
Route::get('/projects', [PublicController::class, 'projects']);
Route::get('/projects/{slug}', [PublicController::class, 'project']);
Route::get('/posts', [PublicController::class, 'posts']);
Route::get('/posts/{slug}', [PublicController::class, 'post']);
Route::get('/jobs', [PublicController::class, 'jobs']);
Route::post('/contact', [PublicController::class, 'contact']);
