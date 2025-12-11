<?php

use Illuminate\Support\Facades\Route;
use App\Models\Setting;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

// Image serving route
Route::get('/uploads/products/{filename}', function ($filename) {
    $path = public_path('uploads/products/' . $filename);
    
    if (!file_exists($path)) {
        abort(404);
    }
    
    return response()->file($path);
})->where('filename', '.*');

Route::get('/{any}', function () {
    $settings = Setting::getAll();
    $googleAnalyticsScript = '<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-CM6CT8DTEY"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag(\'js\', new Date());

  gtag(\'config\', \'G-CM6CT8DTEY\');
</script>';
    //$googleAnalyticsScript = $settings['google_analytics_script'] ?? '';

    $html = file_get_contents(base_path('../frontend/index.html'));
    $html = str_replace('{GOOGLE_ANALYTICS_SCRIPT}', $googleAnalyticsScript, $html);

    return response($html);
})->where('any', '.*');
