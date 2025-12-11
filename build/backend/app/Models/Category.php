<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Category extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'name',
        'slug',
        'image',
        'description',
        'icon',
        'color',
        'parent_id',
        'order',
        'meta_title',
        'meta_description'
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    protected $appends = ['image_url', 'small_image_url', 'medium_image_url'];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($category) {
            if (empty($category->slug)) {
                $category->slug = Str::slug($category->name);
            }
        });

        static::updating(function ($category) {
            if ($category->isDirty('name')) {
                $category->slug = Str::slug($category->name);
            }
        });
    }

    // Relationship with products
    public function products()
    {
        return $this->hasMany(Product::class);
    }

    // Parent-child relationship for category hierarchy
    public function parent()
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(Category::class, 'parent_id')->orderBy('order');
    }

    // Scope for active categories
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function getImageUrlAttribute()
    {
        if ($this->image) {
            return asset($this->image);
        }

        return null;
    }

    public function getSmallImageUrlAttribute()
    {
        if ($this->image) {
            $dir = pathinfo($this->image, PATHINFO_DIRNAME);
            $file = pathinfo($this->image, PATHINFO_BASENAME);
            return asset($dir . '/thumbs/small_' . $file);
        }
        return null;
    }

    public function getMediumImageUrlAttribute()
    {
        if ($this->image) {
            $dir = pathinfo($this->image, PATHINFO_DIRNAME);
            $file = pathinfo($this->image, PATHINFO_BASENAME);
            return asset($dir . '/thumbs/medium_' . $file);
        }
        return null;
    }

    /**
     * Get the route key for the model.
     */
    public function getRouteKeyName()
    {
        return 'slug';
    }
}
