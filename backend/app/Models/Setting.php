<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    use HasFactory;
    
    protected $fillable = ['key', 'value', 'type', 'group', 'label', 'description', 'order'];

    /**
     * Get setting value by key
     */
    public static function get($key, $default = null)
    {
        $setting = self::where('key', $key)->first();
        
        if (!$setting) {
            return $default;
        }

        // Auto-decode JSON
        if ($setting->type === 'json' && is_string($setting->value)) {
            return json_decode($setting->value, true) ?? $default;
        }

        return $setting->value ?? $default;
    }

    /**
     * Set setting value by key
     */
    public static function set($key, $value, $type = 'text', $group = 'general')
    {
        // Auto-encode JSON
        if ($type === 'json' && is_array($value)) {
            $value = json_encode($value);
        }

        return self::updateOrCreate(
            ['key' => $key],
            [
                'value' => $value,
                'type' => $type,
                'group' => $group
            ]
        );
    }

    /**
     * Get all settings by group
     */
    public static function getGroup($group)
    {
        $settings = self::where('group', $group)->orderBy('order')->get();
        
        $result = [];
        foreach ($settings as $setting) {
            $value = $setting->value;
            
            // Auto-decode JSON
            if ($setting->type === 'json' && is_string($value)) {
                $value = json_decode($value, true);
            }
            
            $result[$setting->key] = $value;
        }
        
        return $result;
    }

    /**
     * Get all settings as key-value pairs
     */
    public static function getAll()
    {
        $settings = self::all();
        
        $result = [];
        foreach ($settings as $setting) {
            $value = $setting->value;
            
            // Auto-decode JSON
            if ($setting->type === 'json' && is_string($value)) {
                $value = json_decode($value, true);
            }
            
            $result[$setting->key] = $value;
        }
        
        return $result;
    }
}

