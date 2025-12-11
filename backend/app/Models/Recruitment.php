<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Recruitment extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'slug',
        'description',
        'requirements',
        'location',
        'salary',
        'deadline',
        'status'
    ];

    protected $casts = [
        'deadline' => 'date'
    ];

    // Relationship with Applications
    public function applications()
    {
        return $this->hasMany(Application::class);
    }

    public function scopeOpen($query)
    {
        return $query->where('status', 'open');
    }

    public function scopeActive($query)
    {
        return $query->where('deadline', '>=', now()->toDateString())
                     ->where('status', 'open');
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($recruitment) {
            if (empty($recruitment->slug)) {
                $recruitment->slug = Str::slug($recruitment->title);
            }
        });
    }
}