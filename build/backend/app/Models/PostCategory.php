<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PostCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'icon',
        'color',
        'image',
        'order',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'order' => 'integer',
    ];

    // Relationships
    public function posts()
    {
        return $this->hasMany(Post::class, 'category_id');
    }

    public function publishedPosts()
    {
        return $this->hasMany(Post::class, 'category_id')
                    ->where('is_published', true)
                    ->where('published_at', '<=', now())
                    ->orderBy('published_at', 'desc');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('order')->orderBy('name');
    }

    // Helpers
    public function getPostsCount()
    {
        return $this->publishedPosts()->count();
    }
}
