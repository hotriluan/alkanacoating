<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use App\Traits\DeletesImages;

// Optional Intervention Image
use Intervention\Image\Facades\Image;

class MenuController extends Controller
{
    use DeletesImages;

    public function index()
    {
        // If this is an admin route, return all menus for management (include parent/children)
        $isAdmin = request()->is('api/admin/*') || request()->route() && str_contains(request()->route()->getName() ?? '', 'admin');
        if ($isAdmin) {
            // Return flat list of all non-archived menus; frontend will build the tree
            $query = Menu::ordered();
            // By default, exclude archived items from admin listing unless explicitly requested
            if (!request()->boolean('include_archived')) {
                $query->where('is_archived', false);
            }
            $menus = $query->get();
            return response()->json($menus);
        }

        // Public API: Return active root-level menus with eager-loaded children (one level deep)
        $menus = Menu::where('is_active', true)
            ->where('is_archived', false)
            ->whereNull('parent_id')
            ->orderBy('order')
            ->with(['children' => function($q){
                $q->where('is_active', true)
                  ->where('is_archived', false)
                  ->orderBy('order')
                  ->with(['children' => function($q2){
                      $q2->where('is_active', true)
                         ->where('is_archived', false)
                         ->orderBy('order');
                  }]);
            }])->get();

        // Deduplicate by URL while preserving order
        $seen = [];
        $unique = $menus->filter(function ($m) use (&$seen) {
            if (isset($seen[$m->url])) return false;
            $seen[$m->url] = true;
            return true;
        })->values();

        // Ensure payload is present (model casts payload to array)
        $unique->transform(function ($m) {
            $m->payload = $m->payload ?? null;
            return $m;
        });

        return response()->json($unique)->header('Cache-Control', 'no-cache, no-store, must-revalidate');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'url' => 'required|string|max:255',
            'parent_id' => 'nullable|exists:menus,id',
            'order' => 'integer|min:0',
            'is_active' => 'boolean',
            'type' => 'nullable|string|in:default,mega',
            'payload' => 'nullable',
            'icon' => 'nullable|string|max:255',
            'image' => 'nullable|string|max:255',
            'promo_title' => 'nullable|string|max:255',
            'promo_cta' => 'nullable|string|max:255',
            'promo_image' => 'nullable|string|max:255',
            'has_mega_menu' => 'boolean',
            'mega_menu_config' => 'nullable|array',
            'mega_menu_config.show_categories' => 'boolean',
            'mega_menu_config.show_featured_products' => 'boolean',
            'mega_menu_config.columns' => 'nullable|integer|min:1|max:4',
        ]);

        $data = $request->all();
        if (isset($data['payload']) && is_string($data['payload'])) {
            $decoded = json_decode($data['payload'], true);
            $data['payload'] = $decoded === null ? null : $decoded;
        }

        $menu = Menu::create($data);
        return response()->json($menu, 201);
    }

    public function show(Menu $menu)
    {
        return response()->json($menu->load('children'));
    }

    public function update(Request $request, Menu $menu)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'url' => 'required|string|max:255',
            'parent_id' => 'nullable|exists:menus,id',
            'order' => 'integer|min:0',
            'is_active' => 'boolean',
            'type' => 'nullable|string|in:default,mega',
            'payload' => 'nullable',
            'icon' => 'nullable|string|max:255',
            'image' => 'nullable|string|max:255',
            'promo_title' => 'nullable|string|max:255',
            'promo_cta' => 'nullable|string|max:255',
            'promo_image' => 'nullable|string|max:255',
            'has_mega_menu' => 'boolean',
            'mega_menu_config' => 'nullable|array',
            'mega_menu_config.show_categories' => 'boolean',
            'mega_menu_config.show_featured_products' => 'boolean',
            'mega_menu_config.columns' => 'nullable|integer|min:1|max:4',
            // New fields validation
            'menu_type' => 'nullable|in:simple,dropdown,mega',
            'style_preset' => 'nullable|string',
            'layout_columns' => 'nullable|integer|min:1|max:6',
            'max_width' => 'nullable|string',
            'show_icon' => 'boolean',
            'show_image' => 'boolean',
            'show_description' => 'boolean',
            'description' => 'nullable|string',
            'badge_text' => 'nullable|string|max:50',
            'badge_color' => 'nullable|string',
            'is_highlighted' => 'boolean',
            'custom_class' => 'nullable|string',
            'custom_styles' => 'nullable|array',
            'show_categories' => 'boolean',
            'show_featured_items' => 'boolean',
            'featured_items_count' => 'nullable|integer|min:1|max:20',
            'animation_type' => 'nullable|string',
            'animation_duration' => 'nullable|integer|min:0|max:2000',
            'mobile_collapsible' => 'boolean',
            'mobile_icon' => 'nullable|string',
        ]);

        $data = $request->all();
        
        // Replace old images if new ones provided
        if (isset($data['image'])) {
            $this->replaceImage($menu->image, $data['image']);
        }
        if (isset($data['promo_image'])) {
            $this->replaceImage($menu->promo_image, $data['promo_image']);
        }
        
        if (isset($data['payload']) && is_string($data['payload'])) {
            $decoded = json_decode($data['payload'], true);
            $data['payload'] = $decoded === null ? null : $decoded;
        }

        $menu->update($data);
        return response()->json($menu);
    }

    public function destroy(Menu $menu)
    {
        // Delete menu images
        if ($menu->image) {
            $this->deleteImageFile($menu->image);
        }
        if ($menu->promo_image) {
            $this->deleteImageFile($menu->promo_image);
        }
        
        // Soft archive recursively if the model supports archiving; otherwise hard-delete
        if (in_array('is_archived', array_keys($menu->getAttributes()))) {
            // Eager-load children to avoid N+1 during recursive archiving
            $menu->load('children');
            $this->archiveRecursive($menu);
            return response()->json(null, 204);
        }

        $menu->delete();
        return response()->json(null, 204);
    }

    /**
     * Recursively archive a menu and all its descendants
     */
    private function archiveRecursive(Menu $menu)
    {
        // Update current menu
        $menu->update(['is_archived' => true]);

        // Ensure children relationship is loaded
        $children = $menu->relationLoaded('children') ? $menu->children : $menu->children()->get();
        foreach ($children as $child) {
            $child->load('children');
            $this->archiveRecursive($child);
        }
    }

    /**
     * List archived menus (admin)
     */
    public function archivedIndex()
    {
        $archived = Menu::where('is_archived', true)->ordered()->get();
        return response()->json($archived);
    }

    /**
     * Restore an archived menu
     */
    public function restore($id)
    {
        $menu = Menu::findOrFail($id);
        $menu->update(['is_archived' => false]);
        return response()->json($menu);
    }

    /**
     * Permanently delete an archived menu
     */
    public function forceDelete($id)
    {
        $menu = Menu::findOrFail($id);
        
        // Delete menu images before permanent deletion
        if ($menu->image) {
            $this->deleteImageFile($menu->image);
        }
        if ($menu->promo_image) {
            $this->deleteImageFile($menu->promo_image);
        }
        
        $menu->delete();
        return response()->json(null, 204);
    }

    /**
     * Upload a menu asset (icon/image). Returns { filename, url }
     */
    public function uploadAsset(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:jpg,jpeg,png,gif,svg,webp|max:8192'
        ]);

        $file = $request->file('file');

        $filename = time() . '_' . preg_replace('/[^a-zA-Z0-9\.\-_]/', '_', $file->getClientOriginalName());

        // Store to storage/app/public/menus so it's served by the public/storage symlink
        $storedPath = Storage::disk('public')->putFileAs('menus', $file, $filename);

        $url = Storage::disk('public')->url($storedPath);
        $thumbUrl = null;

        // Try to create resized variants (medium, thumb, small) if Intervention is available
        $smallUrl = null;
        $mediumUrl = null;
        try {
            if (class_exists('\Intervention\Image\ImageManagerStatic')) {
                $tmp = storage_path('app/public/menus/' . $filename);
                $img = Image::make($tmp);
                // orient and create a web-optimized main image (max 1200x1200)
                $img->orientate()->resize(1200, 1200, function ($c) { $c->aspectRatio(); $c->upsize(); });
                $img->save($tmp, 85);

                // medium (fit into 600x400) - useful for in-page previews
                $mediumName = 'medium_' . $filename;
                $mediumPath = storage_path('app/public/menus/' . $mediumName);
                // create a copy from the optimized main image to avoid repeated orientation issues
                $imgMedium = Image::make($tmp)->fit(600, 400);
                $imgMedium->save($mediumPath, 85);
                $mediumUrl = Storage::disk('public')->url('menus/' . $mediumName);

                // thumb 300x300
                $thumbName = 'thumb_' . $filename;
                $thumbPath = storage_path('app/public/menus/' . $thumbName);
                $imgThumb = Image::make($tmp)->fit(300, 300);
                $imgThumb->save($thumbPath, 80);
                $thumbUrl = Storage::disk('public')->url('menus/' . $thumbName);

                // small icon 64x64
                $smallName = 'small_' . $filename;
                $smallPath = storage_path('app/public/menus/' . $smallName);
                $imgSmall = Image::make($tmp)->fit(64, 64);
                $imgSmall->save($smallPath, 80);
                $smallUrl = Storage::disk('public')->url('menus/' . $smallName);
            }
        } catch (\Throwable $e) {
            Log::warning('Menu asset processing failed: ' . $e->getMessage());
        }

        return response()->json([
            'filename' => $filename,
            'url' => $url,
            'medium_url' => $mediumUrl,
            'thumb_url' => $thumbUrl,
            'small_url' => $smallUrl,
        ], 201);
    }

    /**
     * Bulk reorder menus
     */
    public function reorder(Request $request)
    {
        $request->validate([
            'updates' => 'required|array',
            'updates.*.id' => 'required|exists:menus,id',
            'updates.*.order' => 'required|integer|min:0',
        ]);

        foreach ($request->updates as $update) {
            Menu::where('id', $update['id'])->update(['order' => $update['order']]);
        }

        return response()->json(['message' => 'Menu order updated successfully']);
    }

    /**
     * Bulk update menu configurations
     */
    public function bulkUpdate(Request $request)
    {
        $request->validate([
            'menus' => 'required|array',
            'menus.*.id' => 'required|exists:menus,id',
        ]);

        foreach ($request->menus as $menuData) {
            $menu = Menu::find($menuData['id']);
            if ($menu) {
                $menu->update($menuData);
            }
        }

        return response()->json(['message' => 'Menus updated successfully']);
    }

    /**
     * Toggle mega menu for a specific menu item
     */
    public function toggleMegaMenu(Menu $menu)
    {
        $menu->update([
            'has_mega_menu' => !$menu->has_mega_menu,
            'menu_type' => !$menu->has_mega_menu ? 'mega' : 'simple',
        ]);

        return response()->json($menu);
    }

    /**
     * Update menu configuration (advanced settings)
     */
    public function updateConfig(Request $request, Menu $menu)
    {
        $request->validate([
            'menu_type' => 'nullable|in:simple,dropdown,mega',
            'style_preset' => 'nullable|string',
            'layout_columns' => 'nullable|integer|min:1|max:6',
            'max_width' => 'nullable|string',
            'animation_type' => 'nullable|string',
            'animation_duration' => 'nullable|integer|min:0|max:2000',
            'custom_styles' => 'nullable|array',
        ]);

        $menu->update($request->all());
        return response()->json($menu);
    }

    /**
     * Get menu preview data (for admin preview)
     */
    public function preview(Menu $menu)
    {
        $menu->load(['children' => function($q) {
            $q->active()->ordered()->with('children');
        }]);

        return response()->json([
            'menu' => $menu,
            'preview_html' => $this->generatePreviewHtml($menu),
        ]);
    }

    /**
     * Generate HTML preview for menu
     */
    private function generatePreviewHtml($menu)
    {
        // This is a simplified version - you can expand this
        $html = '<div class="menu-preview">';
        $html .= '<div class="menu-item">';
        
        if ($menu->show_icon && $menu->icon) {
            $html .= '<span class="icon">' . $menu->icon . '</span>';
        }
        
        $html .= '<span class="name">' . htmlspecialchars($menu->name) . '</span>';
        
        if ($menu->badge_text) {
            $html .= '<span class="badge badge-' . $menu->badge_color . '">' . htmlspecialchars($menu->badge_text) . '</span>';
        }
        
        $html .= '</div></div>';
        
        return $html;
    }

    /**
     * Duplicate a menu item
     */
    public function duplicate(Menu $menu)
    {
        $newMenu = $menu->replicate();
        $newMenu->name = $menu->name . ' (Copy)';
        $newMenu->order = Menu::max('order') + 1;
        $newMenu->save();

        return response()->json($newMenu, 201);
    }

    /**
     * Get menu templates/presets
     */
    public function templates()
    {
        $templates = [
            [
                'id' => 'ecommerce',
                'name' => 'E-Commerce Menu',
                'description' => 'Perfect for online stores with product categories',
                'config' => [
                    'menu_type' => 'mega',
                    'style_preset' => 'modern',
                    'layout_columns' => 3,
                    'show_categories' => true,
                    'show_featured_items' => true,
                ],
            ],
            [
                'id' => 'corporate',
                'name' => 'Corporate Menu',
                'description' => 'Clean and professional for business websites',
                'config' => [
                    'menu_type' => 'dropdown',
                    'style_preset' => 'classic',
                    'layout_columns' => 2,
                    'show_icon' => true,
                ],
            ],
            [
                'id' => 'minimal',
                'name' => 'Minimal Menu',
                'description' => 'Simple and clean design',
                'config' => [
                    'menu_type' => 'simple',
                    'style_preset' => 'minimal',
                    'show_icon' => false,
                ],
            ],
        ];

        return response()->json($templates);
    }
}