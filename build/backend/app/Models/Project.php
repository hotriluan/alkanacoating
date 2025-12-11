<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Project extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'title',
        'slug', 
        'description',
        'short_description',
        'image',
        'status',
        'order',
        'is_featured',
        'client',
        'location',
        'start_date',
        'end_date',
        'budget_range',
        'project_type',
        'progress_percentage',
        'meta_title',
        'meta_description',
        'features',
        'video_url',
        'is_published',
        'view_count'
    ];

    protected $casts = [
        'features' => 'array',
        'start_date' => 'date',
        'end_date' => 'date',
        'is_featured' => 'boolean',
        'is_published' => 'boolean'
    ];
    
    // Relationships
    public function images(): HasMany
    {
        return $this->hasMany(ProjectImage::class)->orderBy('sort_order');
    }
    
    public function galleryImages(): HasMany
    {
        return $this->hasMany(ProjectImage::class)->where('image_type', 'gallery')->orderBy('sort_order');
    }
    
    public function mainImage()
    {
        return $this->hasOne(ProjectImage::class)->where('image_type', 'main');
    }
    
    public function beforeAfterImages(): HasMany
    {
        return $this->hasMany(ProjectImage::class)->whereIn('image_type', ['before', 'after'])->orderBy('sort_order');
    }
    
    public function testimonials(): HasMany
    {
        return $this->hasMany(ProjectTestimonial::class)->where('is_published', true)->orderBy('created_at', 'desc');
    }
    
    public function featuredTestimonials(): HasMany
    {
        return $this->hasMany(ProjectTestimonial::class)->where(['is_published' => true, 'is_featured' => true]);
    }
    
    // Scopes
    public function scopePublished($query)
    {
        return $query->where(['status' => 'published', 'is_published' => true]);
    }
    
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }
    
    public function scopeByType($query, $type)
    {
        return $query->where('project_type', $type);
    }
    
    // Mutators & Accessors
    public function getFormattedBudgetAttribute()
    {
        return $this->budget_range ? "Ngân sách: {$this->budget_range}" : null;
    }
    
    public function getDurationAttribute()
    {
        if ($this->start_date && $this->end_date) {
            $diff = $this->start_date->diffInDays($this->end_date);
            return $diff > 0 ? "{$diff} ngày" : "Đang thực hiện";
        }
        return null;
    }
    
    public function getProgressStatusAttribute()
    {
        $progress = $this->progress_percentage;
        if ($progress == 100) return 'Hoàn thành';
        if ($progress >= 75) return 'Sắp hoàn thành';
        if ($progress >= 50) return 'Đang thực hiện';
        if ($progress >= 25) return 'Bắt đầu';
        return 'Lên kế hoạch';
    }
    
    // Helper methods
    public function incrementViewCount()
    {
        $this->increment('view_count');
    }
    
    public function getRouteKeyName()
    {
        return 'slug';
    }
}
