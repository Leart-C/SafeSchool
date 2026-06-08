<?php

namespace App\Services\Users;

use App\Models\User;
use InvalidArgumentException;

class LinkGuardianToStudentService
{
    public function link(
        User $guardian,
        User $student,
        string $relationship = 'parent',
        bool $isPrimary = false,
        ?int $emergencyContactPriority = null
    ): void {
        if (! $guardian->school_id || ! $student->school_id) {
            throw new InvalidArgumentException('Guardian and student must both belong to a school.');
        }

        if ($guardian->school_id !== $student->school_id) {
            throw new InvalidArgumentException('Guardian and student must belong to the same school.');
        }

        if ($guardian->is($student)) {
            throw new InvalidArgumentException('A user cannot be linked as their own guardian.');
        }

        $guardian->students()->syncWithoutDetaching([
            $student->id => [
                'relationship' => $relationship,
                'is_primary' => $isPrimary,
                'emergency_contact_priority' => $emergencyContactPriority,
            ],
        ]);
    }
}
