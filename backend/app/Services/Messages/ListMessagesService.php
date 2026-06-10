<?php

namespace App\Services\Messages;

use App\Models\Message;
use Illuminate\Support\Collection;

class ListMessagesService
{
    /**
     * @return Collection<int, array<string, mixed>>
     */
    public function forSchool(int $schoolId): Collection
    {
        return Message::query()
            ->where('school_id', $schoolId)
            ->whereNull('archived_at')
            ->with([
                'sender:id,name,email',
                'schoolClass:id,name,grade_level,section',
            ])
            ->latest('published_at')
            ->latest('id')
            ->limit(50)
            ->get()
            ->map(fn (Message $message): array => [
                'id' => $message->id,
                'audience' => $message->audience->value,
                'title' => $message->title,
                'body' => $message->body,
                'published_at' => $message->published_at?->toISOString(),
                'edited_at' => $message->edited_at?->toISOString(),
                'archived_at' => $message->archived_at?->toISOString(),
                'sender' => [
                    'id' => $message->sender->id,
                    'name' => $message->sender->name,
                    'email' => $message->sender->email,
                ],
                'class' => $message->schoolClass ? [
                    'id' => $message->schoolClass->id,
                    'name' => $message->schoolClass->name,
                    'grade_level' => $message->schoolClass->grade_level,
                    'section' => $message->schoolClass->section,
                ] : null,
            ]);
    }
}