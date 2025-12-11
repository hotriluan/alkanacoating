<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Menu;

class MenuArchiveController extends Controller
{
    // List archived menus
    public function index()
    {
        $archived = Menu::where('is_archived', true)->orderBy('order')->get();
        return response()->json($archived);
    }

    // Restore an archived menu (set is_archived = false)
    public function restore($id)
    {
        $menu = Menu::findOrFail($id);
        if (!$menu->is_archived) {
            return response()->json(['message' => 'Menu is not archived'], 400);
        }
        $menu->is_archived = false;
        $menu->save();
        return response()->json(['message' => 'Menu restored', 'menu' => $menu]);
    }

    // Permanently delete an archived menu
    public function forceDelete($id)
    {
        $menu = Menu::findOrFail($id);
        if (!$menu->is_archived) {
            return response()->json(['message' => 'Menu must be archived before permanent deletion'], 400);
        }
        $menu->delete();
        return response()->json(['message' => 'Menu permanently deleted']);
    }
}
