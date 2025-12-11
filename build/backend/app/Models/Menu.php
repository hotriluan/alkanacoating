<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Menu extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'url',
        'parent_id',
        'order',
        'type',
        'payload',
        'icon',
        'image',
        'promo_title',
        'promo_cta',
        'promo_image',
        'is_active',
        'is_archived',
        'has_mega_menu',
        'mega_menu_config',
        // New fields
        'menu_type',
        'style_preset',
        'layout_columns',
        'max_width',
        'show_icon',
        'show_image',
        'show_description',
        'description',
        'badge_text',
        'badge_color',
        'is_highlighted',
        'custom_class',
        'custom_styles',
        'show_categories',
        'show_featured_items',
        'featured_items_count',
        'animation_type',
        'animation_duration',
        'mobile_collapsible',
        'mobile_icon',
    ];

    protected $attributes = [
        'is_archived' => false,
    ];
    protected $casts = [
        'is_active' => 'boolean',
        'is_archived' => 'boolean',
        'has_mega_menu' => 'boolean',
        'payload' => 'array',
        'mega_menu_config' => 'array',
        // New casts
        'show_icon' => 'boolean',
        'show_image' => 'boolean',
        'show_description' => 'boolean',
        'is_highlighted' => 'boolean',
        'show_categories' => 'boolean',
        'show_featured_items' => 'boolean',
        'mobile_collapsible' => 'boolean',
        'custom_styles' => 'array',
        'layout_columns' => 'integer',
        'featured_items_count' => 'integer',
        'animation_duration' => 'integer',
    ];

    protected $appends = ['image_url', 'image_thumb_url', 'icon_url', 'promo_image_url', 'promo_image_thumb_url', 'promo_image_medium_url', 'promo_image_small_url'];


    public function getImageUrlAttribute()
    {
        if (!$this->image) return null;
        // Prefer storage disk 'public' where uploads are saved
        if (\Illuminate\Support\Facades\Storage::disk('public')->exists('menus/' . $this->image)) {
            return \Illuminate\Support\Facades\Storage::disk('public')->url('menus/' . $this->image);
        }
        return url('/uploads/menus/' . $this->image);
    }

    public function getImageThumbUrlAttribute()
    {
        if (!$this->image) return null;
        $thumb = 'thumb_' . $this->image;
        if (\Illuminate\Support\Facades\Storage::disk('public')->exists('menus/' . $thumb)) {
            return \Illuminate\Support\Facades\Storage::disk('public')->url('menus/' . $thumb);
        }
        return null;
    }

    public function getPromoImageUrlAttribute()
    {
        if (!$this->promo_image) return null;
        if (\Illuminate\Support\Facades\Storage::disk('public')->exists('menus/' . $this->promo_image)) {
            return \Illuminate\Support\Facades\Storage::disk('public')->url('menus/' . $this->promo_image);
        }
        return url('/uploads/menus/' . $this->promo_image);
    }

    public function getPromoImageThumbUrlAttribute()
    {
        if (!$this->promo_image) return null;
        $thumb = 'thumb_' . $this->promo_image;
        if (\Illuminate\Support\Facades\Storage::disk('public')->exists('menus/' . $thumb)) {
            return \Illuminate\Support\Facades\Storage::disk('public')->url('menus/' . $thumb);
        }
        return null;
    }

    public function getPromoImageMediumUrlAttribute()
    {
        if (!$this->promo_image) return null;
        $name = 'medium_' . $this->promo_image;
        if (\Illuminate\Support\Facades\Storage::disk('public')->exists('menus/' . $name)) {
            return \Illuminate\Support\Facades\Storage::disk('public')->url('menus/' . $name);
        }
        return null;
    }

    public function getPromoImageSmallUrlAttribute()
    {
        if (!$this->promo_image) return null;
        $name = 'small_' . $this->promo_image;
        if (\Illuminate\Support\Facades\Storage::disk('public')->exists('menus/' . $name)) {
            return \Illuminate\Support\Facades\Storage::disk('public')->url('menus/' . $name);
        }
        return null;
    }

    public function getIconUrlAttribute()
    {
        if (!$this->icon) return null;
        // If icon looks like a filename, check storage; otherwise return as-is (could be a class name)
        if (preg_match('/\.(png|jpe?g|svg|webp)$/i', $this->icon)) {
            if (\Illuminate\Support\Facades\Storage::disk('public')->exists('menus/' . $this->icon)) {
                return \Illuminate\Support\Facades\Storage::disk('public')->url('menus/' . $this->icon);
            }
            return url('/uploads/menus/' . $this->icon);
        }
        return $this->icon;
    }

    public function parent()
    {
        return $this->belongsTo(Menu::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(Menu::class, 'parent_id');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('order', 'asc');
    }

    public function scopeRootLevel($query)
    {
        return $query->whereNull('parent_id');
    }
}