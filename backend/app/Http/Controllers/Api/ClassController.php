<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\StoreClassRequest;
use App\Http\Requests\UpdateClassRequest;
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
                'section' => $schoolClass->section,
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

    public function store(StoreClassRequest $request): JsonResponse
    {
        $user = $request->user();

        if (! $user->school_id) {
            return $this->error(
                'Authenticated user is not assigned to a school.',
                status: 403,
            );
        }

        $schoolClass = SchoolClass::query()->create([
            'school_id' => $user->school_id,
            'name' => $request->string('name')->toString(),
            'grade_level' => $request->string('grade_level')->toString(),
            'section' => $request->filled('section')
                ? $request->string('section')->toString()
                : null,
            'academic_year' => $request->string('academic_year')->toString(),
            'is_active' => $request->boolean('is_active', true),
        ]);

        return $this->created([
            'class' => [
                'id' => $schoolClass->id,
                'name' => $schoolClass->name,
                'grade_level' => $schoolClass->grade_level,
                'section' => $schoolClass->section,
                'academic_year' => $schoolClass->academic_year,
                'is_active' => $schoolClass->is_active,
                'teachers_count' => 0,
                'students_count' => 0,
            ],
        ], 'Class created.');
    }

    public function update(UpdateClassRequest $request, SchoolClass $class): JsonResponse
    {
        $user = $request->user();

        if (! $user->school_id) {
            return $this->error(
                'Authenticated user is not assigned to a school.',
                status: 403,
            );
        }

        if ($class->school_id !== $user->school_id) {
            return $this->error(
                'Class was not found for this school.',
                status: 404,
            );
        }

        $class->update([
            'name' => $request->string('name')->toString(),
            'grade_level' => $request->string('grade_level')->toString(),
            'section' => $request->filled('section')
                ? $request->string('section')->toString()
                : null,
            'academic_year' => $request->string('academic_year')->toString(),
            'is_active' => $request->boolean('is_active'),
        ]);

        $class->loadCount([
            'teachers',
            'students',
        ]);

        return $this->success([
            'class' => [
                'id' => $class->id,
                'name' => $class->name,
                'grade_level' => $class->grade_level,
                'section' => $class->section,
                'academic_year' => $class->academic_year,
                'is_active' => $class->is_active,
                'teachers_count' => $class->teachers_count,
                'students_count' => $class->students_count,
            ],
        ], 'Class updated.');
    }
}