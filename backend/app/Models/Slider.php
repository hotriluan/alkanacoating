<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Slider extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'subtitle', 
        'image',
        'description',
        'button_text',
        'button_style',
        'text_position',
        'overlay_opacity',
        'media_type',
        'video_url',
        'link',
        'category_id',
        'order',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'overlay_opacity' => 'integer',
        'category_id' => 'integer'
    ];

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('order', 'asc');
    }
}