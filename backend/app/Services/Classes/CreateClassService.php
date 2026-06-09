<?php

namespace App\Services\Classes;

use App\Models\SchoolClass;

class CreateClassService
{
    public function __construct(
        private readonly ClassResourceData $classResourceData
    ) {}

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    public function forSchool(int $schoolId, array $data): array
    {
        $schoolClass = SchoolClass::query()->create([
            'school_id' => $schoolId,
            'name' => $data['name'],
            'grade_level' => $data['grade_level'],
            'section' => $data['section'] ?? null,
            'academic_year' => $data['academic_year'],
            'is_active' => $data['is_active'] ?? true,
        ]);

        return $this->classResourceData->fromModel($schoolClass);
    }
}