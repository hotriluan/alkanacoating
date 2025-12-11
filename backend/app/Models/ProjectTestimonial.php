<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectTestimonial extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'project_id',
        'client_name',
        'client_position',
        'client_company',
        'testimonial',
        'rating',
        'is_featured',
        'is_published',
        'client_avatar',
        'project_completion_date'
    ];

    protected $casts = [
        'is_featured' => 'boolean',
        'is_published' => 'boolean',
        'project_completion_date' => 'date'
    ];
    
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }
    
    // Scopes
    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }
    
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }
    
    public function scopeHighRated($query, $minRating = 4)
    {
        return $query->where('rating', '>=', $minRating);
    }
    
    // Accessors
    public function getStarsAttribute()
    {
        return str_repeat('★', $this->rating) . str_repeat('☆', 5 - $this->rating);
    }
    
    public function getClientFullNameAttribute()
    {
        $name = $this->client_name;
        if ($this->client_position && $this->client_company) {
            $name .= ", {$this->client_position} tại {$this->client_company}";
        } elseif ($this->client_position) {
            $name .= ", {$this->client_position}";
        } elseif ($this->client_company) {
            $name .= " - {$this->client_company}";
        }
        return $name;
    }
}