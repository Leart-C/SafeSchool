<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudentController extends ApiController
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

        $students = User::query()
            ->where('school_id', $user->school_id)
            ->role('student')
            ->withCount([
                'guardians',
                'enrolledClasses',
            ])
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get()
            ->map(fn (User $student): array => [
                'id' => $student->id,
                'name' => $student->name,
                'first_name' => $student->first_name,
                'last_name' => $student->last_name,
                'email' => $student->email,
                'avatar_url' => $student->avatar_url,
                'guardians_count' => $student->guardians_count,
                'classes_count' => $student->enrolled_classes_count,
            ])
            ->values();

        return $this->success([
            'students' => $students,
        ], 'Students retrieved.');
    }
}