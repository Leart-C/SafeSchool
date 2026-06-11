<?php

namespace App\Services\Messages;

use App\Models\Message;
use App\Models\User;
use InvalidArgumentException;

class ArchiveMessageService
{
    public function archive(User $user, Message $message): void
    {
        if (! $user->school_id || $message->school_id !== $user->school_id) {
            throw new InvalidArgumentException('Message was not found for this school.');
        }

        if ($message->archived_at) {
            return;
        }

        $message->update([
            'archived_at' => now(),
        ]);
    }
}
