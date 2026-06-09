<?php

namespace App\Http\Controllers\Api;

use App\Models\SchoolClass;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClassController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user->school_id) {
            return $this->error(
                'Authenticated user is not assigned to a school.',
                status: 403,
            );
        }

        $classes = SchoolClass::query()
            ->where('school_id', $user->school_id)
            ->withCount([
                'teachers',
                'students',
            ])
            ->orderBy('name')
            ->get()
            ->map(fn (SchoolClass $schoolClass): array => [
                'id' => $schoolClass->id,
                'name' => $schoolClass->name,
                'grade_level' => $schoolClass->grade_level,
                'academic_year' => $schoolClass->academic_year,
                'is_active' => $schoolClass->is_active,
                'teachers_count' => $schoolClass->teachers_count,
                'students_count' => $schoolClass->students_count,
            ])
            ->values();

        return $this->success([
            'classes' => $classes,
        ], 'Classes retrieved.');
    }
}