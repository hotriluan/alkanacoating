<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Category;
use App\Models\Product;
use App\Models\Project;
use App\Models\Post;
use App\Models\Job;
use App\Models\Slider;
use App\Models\Menu;
use App\Models\Recruitment;
use App\Models\User;

echo "Database counts:\n";
echo "Categories: " . Category::count() . "\n";
echo "Products: " . Product::count() . "\n";
echo "Projects: " . Project::count() . "\n";
echo "Posts: " . Post::count() . "\n";
echo "Jobs: " . Job::count() . "\n";
echo "Sliders: " . Slider::count() . "\n";
echo "Menus: " . Menu::count() . "\n";
echo "Recruitments: " . Recruitment::count() . "\n";
echo "Users: " . User::count() . "\n";

// Optionally list some sample slugs
$sampleProducts = Product::limit(5)->pluck('slug')->toArray();
echo "Sample product slugs: " . implode(', ', $sampleProducts) . "\n";

return 0;
