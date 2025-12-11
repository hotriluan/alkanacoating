<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use Illuminate\Http\Request;

class MenuController extends Controller
{
    // List all menus for admin (include inactive/archived)
    public function index()
    {
        $menus = Menu::with(['parent','children'])->orderBy('order','asc')->get();
        return response()->json($menus);
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
        return response()->json($menu->load(['parent','children']));
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
        ]);

        $data = $request->all();
        if (isset($data['payload']) && is_string($data['payload'])) {
            $decoded = json_decode($data['payload'], true);
            $data['payload'] = $decoded === null ? null : $decoded;
        }

        $menu->update($data);
        return response()->json($menu);
    }

    public function destroy(Menu $menu)
    {
        // Soft archive if column exists
        if (in_array('is_archived', array_keys($menu->getAttributes()))) {
            $menu->update(['is_archived' => true]);
            return response()->json(null, 204);
        }
        $menu->delete();
        return response()->json(null, 204);
    }
}
