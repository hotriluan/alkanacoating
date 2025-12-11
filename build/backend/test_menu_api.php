<?php
require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$menus = \App\Models\Menu::where('is_active', true)
    ->where('is_archived', false)
    ->whereNull('parent_id')
    ->orderBy('order')
    ->with(['children' => function($q){
        $q->where('is_active', true)
          ->where('is_archived', false)
          ->orderBy('order');
    }])->get();

$gioiThieu = $menus->firstWhere('name', 'Giới thiệu');

echo "Giới thiệu menu:\n";
echo "  ID: {$gioiThieu->id}\n";
echo "  Children count: {$gioiThieu->children->count()}\n\n";

if ($gioiThieu->children->count() > 0) {
    echo "Children:\n";
    foreach ($gioiThieu->children as $child) {
        echo "  - {$child->name} (id={$child->id}, active=" . ($child->is_active ? 'true' : 'false') . ", archived=" . ($child->is_archived ? 'true' : 'false') . ")\n";
    }
}
