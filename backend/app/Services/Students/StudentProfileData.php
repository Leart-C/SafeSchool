<?php

namespace App\Services\Students;

use App\Models\StudentProfile;

class StudentProfileData
{
    /**
     * @return array<string, mixed>|null
     */
    public function fromProfile(?StudentProfile $profile): ?array
    {
        if (! $profile) {
            return null;
        }

        return [
            'id' => $profile->id,
            'student_code' => $profile->student_code,
            'date_of_birth' => $profile->date_of_birth?->toDateString(),
            'grade_level' => $profile->grade_level,
            'enrollment_status' => $profile->enrollment_status,
            'notes' => $profile->notes,
        ];
    }
}