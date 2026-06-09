<?php

namespace App\Services\Classes;

use App\Models\SchoolClass;

class UpdateClassService
{
    public function __construct(
        private readonly ClassResourceData $classResourceData
    ) {}

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>|null
     */
    public function forSchool(SchoolClass $schoolClass, int $schoolId, array $data): ?array
    {
        if ($schoolClass->school_id !== $schoolId) {
            return null;
        }

        $schoolClass->update([
            'name' => $data['name'],
            'grade_level' => $data['grade_level'],
            'section' => $data['section'] ?? null,
            'academic_year' => $data['academic_year'],
            'is_active' => $data['is_active'],
        ]);

        $schoolClass->loadCount([
            'teachers',
            'students',
        ]);

        return $this->classResourceData->fromModel($schoolClass);
    }
}