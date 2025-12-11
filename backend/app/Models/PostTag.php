<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PostTag extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'color',
        'usage_count',
    ];

    protected $casts = [
        'usage_count' => 'integer',
    ];

    // Relationships
    public function posts()
    {
        return $this->belongsToMany(Post::class, 'post_post_tag');
    }

    public function publishedPosts()
    {
        return $this->belongsToMany(Post::class, 'post_post_tag')
                    ->where('is_published', true)
                    ->where('published_at', '<=', now())
                    ->orderBy('published_at', 'desc');
    }

    // Helpers
    public function incrementUsage()
    {
        $this->increment('usage_count');
    }

    public function decrementUsage()
    {
        if ($this->usage_count > 0) {
            $this->decrement('usage_count');
        }
    }

    public function syncUsageCount()
    {
        $this->usage_count = $this->posts()->count();
        $this->save();
    }
}
