<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'author_id',
        'title',
        'slug',
        'excerpt',
        'content',
        'description', // Keep for backward compatibility
        'image',
        'thumbnail',
        'featured_image',
        'category_id',
        'tags',
        'reading_time',
        'view_count',
        'published_at',
        'status',
        'is_published',
        'is_featured',
        'order',
        'meta_title',
        'meta_description',
        'meta_keywords',
    ];

    protected $casts = [
        'tags' => 'array',
        'is_published' => 'boolean',
        'is_featured' => 'boolean',
        'published_at' => 'datetime',
        'reading_time' => 'integer',
        'view_count' => 'integer',
        'order' => 'integer',
    ];

    protected $appends = [
        'thumbnail_url', 'image_url', 'featured_image_url'
    ];

    // Relationships
    public function author()
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function category()
    {
        return $this->belongsTo(PostCategory::class, 'category_id');
    }

    public function postTags()
    {
        return $this->belongsToMany(PostTag::class, 'post_post_tag');
    }

    // Scopes
    public function scopePublished($query)
    {
                return $query->where('is_published', true)
                                            ->where(function ($q) {
                                                    $q->whereNull('published_at')
                                                        ->orWhere('published_at', '<=', now());
                                            });
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function scopeByCategory($query, $categoryId)
    {
        return $query->where('category_id', $categoryId);
    }

    public function scopeByTag($query, $tagId)
    {
        return $query->whereHas('postTags', function ($q) use ($tagId) {
            $q->where('post_tags.id', $tagId);
        });
    }

    public function scopeSearch($query, $keyword)
    {
        return $query->where(function ($q) use ($keyword) {
            $q->where('title', 'like', "%{$keyword}%")
              ->orWhere('excerpt', 'like', "%{$keyword}%")
              ->orWhere('content', 'like', "%{$keyword}%");
        });
    }

    // Helpers
    public function incrementViewCount()
    {
        $this->increment('view_count');
    }

    public function calculateReadingTime()
    {
        $content = $this->content ?: $this->description;
        $words = str_word_count(strip_tags($content));
        $minutes = ceil($words / 200); // Average: 200 words/minute
        $this->reading_time = $minutes;
        $this->save();
        return $minutes;
    }

    public function getFormattedPublishedDate()
    {
        return $this->published_at ? $this->published_at->format('d/m/Y') : null;
    }

    public function getReadingTimeText()
    {
        if ($this->reading_time < 1) {
            return '< 1 phút';
        }
        return $this->reading_time . ' phút đọc';
    }

    // Accessors
    public function getThumbnailUrlAttribute(): ?string
    {
        if ($this->thumbnail) {
            return asset($this->thumbnail);
        } elseif ($this->image) {
            return asset($this->image);
        }
        // Assuming 'public/assets/default-post.jpg' is the correct path for a default image
        // Make sure this file exists in your public directory
        return asset('assets/default-post.jpg');
    }

    public function getImageUrlAttribute(): ?string
    {
        if ($this->image) {
            return asset($this->image);
        } elseif ($this->thumbnail) {
            return asset($this->thumbnail);
        }
        // Assuming 'public/assets/default-post.jpg' is the correct path for a default image
        return asset('assets/default-post.jpg');
    }

    public function getFeaturedImageUrlAttribute(): ?string
    {
        if ($this->featured_image) {
            return asset($this->featured_image);
        } elseif ($this->thumbnail) {
            return asset($this->thumbnail);
        } elseif ($this->image) {
            return asset($this->image);
        }
        // Assuming 'public/assets/default-post.jpg' is the correct path for a default image
        return asset('assets/default-post.jpg');
    }
}

