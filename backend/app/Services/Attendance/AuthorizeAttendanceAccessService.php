<?php

namespace App\Services\Attendance;

use App\Models\SchoolClass;
use App\Models\User;

class AuthorizeAttendanceAccessService
{
    public function canViewSchoolAttendance(User $user): bool
    {
        return $user->school_id !== null
            && $user->can('attendance.view');
    }

    public function canManageClassAttendance(User $user, SchoolClass $schoolClass): bool
    {
        if (! $user->school_id || ! $schoolClass->school_id) {
            return false;
        }

        if ($user->school_id !== $schoolClass->school_id) {
            return false;
        }

        if (! $user->can('attendance.manage')) {
            return false;
        }

        if ($user->hasRole('admin')) {
            return true;
        }

        if ($user->hasRole('teacher')) {
            return $this->isAssignedTeacher($user, $schoolClass);
        }

        return false;
    }

    public function canViewClassAttendanceRoster(User $user, SchoolClass $schoolClass): bool
    {
        return $this->canManageClassAttendance($user, $schoolClass);
    }

    private function isAssignedTeacher(User $user, SchoolClass $schoolClass): bool
    {
        return $schoolClass->teachers()
            ->where('users.id', $user->id)
            ->exists();
    }
}