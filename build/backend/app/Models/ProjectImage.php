<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectImage extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'project_id',
        'image_url',
        'caption',
        'image_type',
        'sort_order',
        'is_featured',
        'alt_text'
    ];

    protected $casts = [
        'is_featured' => 'boolean'
    ];
    
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }
    
    // Scopes
    public function scopeByType($query, $type)
    {
        return $query->where('image_type', $type);
    }
    
    public function scopeGallery($query)
    {
        return $query->where('image_type', 'gallery');
    }
    
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }
    
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order');
    }
}