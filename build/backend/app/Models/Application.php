<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Application extends Model
{
    use HasFactory;

    protected $fillable = [
        'recruitment_id',
        'name',
        'email',
        'phone',
        'cv_file',
        'cover_letter',
        'status',
        'admin_notes'
    ];

    protected $casts = [
        'created_at' => 'datetime'
    ];

    // Relationship with Recruitment
    public function recruitment()
    {
        return $this->belongsTo(Recruitment::class);
    }

    // Scopes
    public function scopeNew($query)
    {
        return $query->where('status', 'new');
    }

    public function scopeReviewing($query)
    {
        return $query->where('status', 'reviewing');
    }

    public function scopeShortlisted($query)
    {
        return $query->where('status', 'shortlisted');
    }

    // Accessor for status badge
    public function getStatusBadgeAttribute()
    {
        $badges = [
            'new' => ['text' => 'Mới', 'color' => 'blue'],
            'reviewing' => ['text' => 'Đang xem xét', 'color' => 'yellow'],
            'shortlisted' => ['text' => 'Đạt vòng sơ tuyển', 'color' => 'green'],
            'rejected' => ['text' => 'Từ chối', 'color' => 'red'],
            'accepted' => ['text' => 'Chấp nhận', 'color' => 'purple']
        ];

        return $badges[$this->status] ?? ['text' => $this->status, 'color' => 'gray'];
    }
}
