<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SettingsController extends Controller
{
    /**
     * Get all settings (public)
     */
    public function index()
    {
        return response()->json(Setting::getAll());
    }

    /**
     * Get settings by group (public)
     */
    public function getByGroup($group)
    {
        return response()->json(Setting::getGroup($group));
    }

    /**
     * Get all settings for admin
     */
    public function adminIndex()
    {
        $settings = Setting::orderBy('group')->orderBy('order')->get();
        
        // Group settings by group
        $grouped = [];
        foreach ($settings as $setting) {
            if (!isset($grouped[$setting->group])) {
                $grouped[$setting->group] = [];
            }
            $grouped[$setting->group][] = $setting;
        }
        
        return response()->json($grouped);
    }

    /**
     * Update or create a setting
     */
    public function update(Request $request)
    {
        $request->validate([
            'key' => 'required|string',
            'value' => 'nullable',
            'type' => 'nullable|string',
            'group' => 'nullable|string',
            'label' => 'nullable|string',
            'description' => 'nullable|string',
            'order' => 'nullable|integer',
        ]);

        $value = $request->input('value');
        $type = $request->input('type', 'text');

        // Auto-encode JSON
        if ($type === 'json' && is_array($value)) {
            $value = json_encode($value);
        }

        $setting = Setting::updateOrCreate(
            ['key' => $request->key],
            [
                'value' => $value,
                'type' => $type,
                'group' => $request->input('group', 'general'),
                'label' => $request->input('label'),
                'description' => $request->input('description'),
                'order' => $request->input('order', 0),
            ]
        );

        return response()->json($setting);
    }

    /**
     * Bulk update settings
     */
    public function bulkUpdate(Request $request)
    {
        $settings = $request->input('settings', []);
        
        foreach ($settings as $settingData) {
            if (!isset($settingData['key'])) {
                continue;
            }

            $value = $settingData['value'] ?? null;
            $type = $settingData['type'] ?? 'text';

            // Auto-encode JSON
            if ($type === 'json' && is_array($value)) {
                $value = json_encode($value);
            }

            Setting::updateOrCreate(
                ['key' => $settingData['key']],
                [
                    'value' => $value,
                    'type' => $type,
                    'group' => $settingData['group'] ?? 'general',
                    'label' => $settingData['label'] ?? null,
                    'description' => $settingData['description'] ?? null,
                    'order' => $settingData['order'] ?? 0,
                ]
            );
        }

        return response()->json(['message' => 'Settings updated successfully']);
    }

    /**
     * Delete a setting
     */
    public function destroy($key)
    {
        $setting = Setting::where('key', $key)->first();
        
        if ($setting) {
            $setting->delete();
            return response()->json(['message' => 'Setting deleted successfully']);
        }

        return response()->json(['message' => 'Setting not found'], 404);
    }

    /**
     * Upload image for settings
     */
    public function uploadImage(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:8192', // 8MB
            'folder' => 'nullable|string',
        ]);

        try {
            $folder = $request->input('folder', 'settings');
            $image = $request->file('image');
            
            // Generate unique filename
            $filename = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
            
            // Store in public/uploads/{folder}
            $path = $image->move(public_path("uploads/{$folder}"), $filename);
            
            // Return URL
            $url = "/uploads/{$folder}/{$filename}";
            
            return response()->json([
                'success' => true,
                'url' => $url,
                'message' => 'Image uploaded successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload image: ' . $e->getMessage()
            ], 500);
        }
    }
}

