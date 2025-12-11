<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;
    protected $fillable = [
        'category_id', 'name', 'slug', 'thumbnail', 'excerpt', 'content', 'specs',
        'is_active', 'is_featured', 'meta_title', 'meta_description', 'features', 'applications', 'technical_specs'
    ];
    protected $casts = [
        'specs' => 'array',
        'is_active' => 'boolean',
        'is_featured' => 'boolean'
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function images()
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order');
    }

    public function primaryImage()
    {
        return $this->hasOne(ProductImage::class)->where('is_primary', true);
    }

    public function getThumbnailUrlAttribute()
    {
        if ($this->thumbnail) {
            return asset($this->thumbnail);
        }
        
        $primaryImage = $this->primaryImage;
        if ($primaryImage) {
            return $primaryImage->image_url;
        }
        
        return null;
    }
}
