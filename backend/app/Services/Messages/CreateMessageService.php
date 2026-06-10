<?php

namespace App\Services\Messages;

use App\Models\Message;
use App\Models\SchoolClass;
use App\Models\User;
use InvalidArgumentException;

class CreateMessageService
{
    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    public function create(User $sender, array $data): array
    {
        if (! $sender->school_id) {
            throw new InvalidArgumentException('Sender must belong to a school.');
        }

        if (($data['audience'] ?? null) === 'class') {
            $this->ensureClassBelongsToSenderSchool(
                $sender,
                (int) $data['school_class_id'],
            );
        }

        $message = Message::query()->create([
            'school_id' => $sender->school_id,
            'sender_user_id' => $sender->id,
            'school_class_id' => $data['school_class_id'] ?? null,
            'audience' => $data['audience'],
            'title' => $data['title'],
            'body' => $data['body'],
            'published_at' => ($data['publish_now'] ?? true) ? now() : null,
        ]);

        $message->load([
            'sender:id,name,email',
            'schoolClass:id,name,grade_level,section',
        ]);

        return $this->resource($message);
    }

    private function ensureClassBelongsToSenderSchool(User $sender, int $schoolClassId): void
    {
        $belongsToSchool = SchoolClass::query()
            ->where('id', $schoolClassId)
            ->where('school_id', $sender->school_id)
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