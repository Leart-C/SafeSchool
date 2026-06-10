<?php

namespace App\Models;

use App\Enums\MessageAudience;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Message extends Model
{
    protected $fillable = [
        'school_id',
        'sender_user_id',
        'school_class_id',
        'audience',
        'title',
        'body',
        'published_at',
        'edited_at',
        'archived_at',
    ];

    protected function casts(): array
    {
        return [
            'audience' => MessageAudience::class,
            'published_at' => 'datetime',
            'edited_at' => 'datetime',
            'archived_at' => 'datetime',
        ];
    }

    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_user_id');
    }

    public function schoolClass(): BelongsTo
    {
        return $this->belongsTo(SchoolClass::class);
    }
}