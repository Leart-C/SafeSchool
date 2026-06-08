<?php

namespace App\Services\Classes;

use App\Models\SchoolClass;
use App\Models\User;
use InvalidArgumentException;

class AssignUserToClassService
{
    /**
     * @var array<int, string>
     */
    private const ALLOWED_ROLES = [
        'teacher',
        'student',
        'assistant',
    ];

    public function assign(User $user, SchoolClass $class, string $role): void
    {
        if (! in_array($role, self::ALLOWED_ROLES, true)) {
            throw new InvalidArgumentException('Class role is not supported.');
        }

        if (! $user->school_id || ! $class->school_id) {
            throw new InvalidArgumentException('User and class must both belong to a school.');
        }

        if ($user->school_id !== $class->school_id) {
            throw new InvalidArgumentException('User and class must belong to the same school.');
        }

        $class->users()->syncWithoutDetaching([
            $user->id => [
                'role' => $role,
            ],
        ]);
    }
}
