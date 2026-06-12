<?php

namespace App\Services\Students;

use App\Models\User;

class DestroyStudentGuardianService
{
    public function forSchool(User $student, User $guardian, int $schoolId): bool
    {
        if ($student->school_id !== $schoolId || $guardian->school_id !== $schoolId) {
            return false;
        }

        if (! $student->guardians()->whereKey($guardian->id)->exists()) {
            return false;
        }

        $student->guardians()->detach($guardian->id);

        return true;
    }
}