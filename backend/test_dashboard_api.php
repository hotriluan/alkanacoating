<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "Testing Dashboard API...\n\n";

try {
    echo "Products count: " . \App\Models\Product::count() . "\n";
    echo "Projects count: " . \App\Models\Project::count() . "\n";
    echo "Posts count: " . \App\Models\Post::count() . "\n";
    echo "Jobs count: " . \App\Models\Job::count() . "\n";
    
    echo "\nRecent Products:\n";
    $products = \App\Models\Product::orderBy('created_at', 'desc')->take(5)->get(['id', 'name', 'created_at']);
    foreach ($products as $p) {
        echo "  - {$p->name}\n";
    }
    
    echo "\nRecent Projects:\n";
    $projects = \App\Models\Project::orderBy('created_at', 'desc')->take(5)->get(['id', 'title as name', 'created_at']);
    foreach ($projects as $p) {
        echo "  - {$p->name}\n";
    }
    
    echo "\nPublished Products: " . \App\Models\Product::where('is_published', true)->count() . "\n";
    echo "Draft Products: " . \App\Models\Product::where('is_published', false)->count() . "\n";
    
    echo "\n✅ Dashboard API data is working!\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
}
