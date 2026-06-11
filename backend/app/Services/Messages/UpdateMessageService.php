<?php

namespace App\Services\Messages;

use App\Enums\MessageAudience;
use App\Models\Message;
use App\Models\SchoolClass;
use App\Models\User;
use InvalidArgumentException;

class UpdateMessageService
{
    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    public function update(User $user, Message $message, array $data): array
    {
        if (! $user->school_id || $message->school_id !== $user->school_id) {
            throw new InvalidArgumentException('Message was not found for this school.');
        }

        if (($data['audience'] ?? null) === MessageAudience::ClassAudience->value) {
            $this->ensureClassBelongsToUserSchool(
                $user,
                (int) $data['school_class_id'],
            );
        }

        $message->update([
            'school_class_id' => ($data['audience'] ?? null) === MessageAudience::ClassAudience->value
                ? $data['school_class_id']
                : null,
            'audience' => $data['audience'],
            'title' => $data['title'],
            'body' => $data['body'],
            'published_at' => ($data['publish_now'] ?? true)
                ? ($message->published_at ?? now())
                : null,
            'edited_at' => now(),
        ]);

        $message->load([
            'sender:id,name,email',
            'schoolClass:id,name,grade_level,section',
        ]);

        return $this->resource($message);
    }

    private function ensureClassBelongsToUserSchool(User $user, int $schoolClassId): void
    {
        $belongsToSchool = SchoolClass::query()
            ->where('id', $schoolClassId)
            ->where('school_id', $user->school_id)
            ->exists();

        if (! $belongsToSchool) {
            throw new InvalidArgumentException('Class was not found for this school.');
        }
    }

    /**
     * @return array<string, mixed>
     */
    private function resource(Message $message): array
    {
        return [
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
        ];
    }
}
