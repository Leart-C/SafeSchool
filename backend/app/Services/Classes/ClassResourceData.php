<?php

namespace App\Services\Classes;

use App\Models\SchoolClass;

class ClassResourceData
{
    /**
     * @return array<string, mixed>
     */
    public function fromModel(SchoolClass $schoolClass): array
    {
        return [
            'id' => $schoolClass->id,
            'name' => $schoolClass->name,
            'grade_level' => $schoolClass->grade_level,
            'section' => $schoolClass->section,
            'academic_year' => $schoolClass->academic_year,
            'is_active' => $schoolClass->is_active,
            'teachers_count' => $schoolClass->teachers_count ?? 0,
            'students_count' => $schoolClass->students_count ?? 0,
        ];
    }
}