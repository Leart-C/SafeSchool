<?php

namespace App\Services\Students;

use App\Models\User;

class ShowStudentService
{
    /**
     * @return array<string, mixed>|null
     */
    public function forSchool(User $student, int $schoolId): ?array
    {
        if ($student->school_id !== $schoolId || ! $student->hasRole('student')) {
            return null;
        }

        $student->load([
            'guardians:id,name,email,first_name,last_name,avatar_url',
            'enrolledClasses:id,name,grade_level,section,academic_year,is_active',
        ]);

        return [
            'id' => $student->id,
            'name' => $student->name,
            'first_name' => $student->first_name,
            'last_name' => $student->last_name,
            'email' => $student->email,
            'avatar_url' => $student->avatar_url,
            'guardians' => $student->guardians->map(fn (User $guardian): array => [
                'id' => $guardian->id,
                'name' => $guardian->name,
                'email' => $guardian->email,
                'first_name' => $guardian->first_name,
                'last_name' => $guardian->last_name,
                'avatar_url' => $guardian->avatar_url,
                'relationship' => $guardian->pivot->relationship,
                'is_primary' => $guardian->pivot->is_primary,
                'emergency_contact_priority' => $guardian->pivot->emergency_contact_priority,
            ])->values(),
            'classes' => $student->enrolledClasses->map(fn ($class): array => [
                'id' => $class->id,
                'name' => $class->name,
                'grade_level' => $class->grade_level,
                'section' => $class->section,
                'academic_year' => $class->academic_year,
                'is_active' => $class->is_active,
            ])->values(),
        ];
    }
}
