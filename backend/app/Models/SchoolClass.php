<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class SchoolClass extends Model
{
    protected $fillable = [
        'school_id',
        'name',
        'grade_level',
        'section',
        'academic_year',
        'is_active',
    ];

    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'class_user')
            ->withPivot(['role'])
            ->withTimestamps();
    }

    public function teachers(): BelongsToMany
    {
        return $this->users()->wherePivot('role', 'teacher');
    }

    public function students(): BelongsToMany
    {
        return $this->users()->wherePivot('role', 'student');
    }

    public function assistants(): BelongsToMany
    {
        return $this->users()->wherePivot('role', 'assistant');
    }
}
