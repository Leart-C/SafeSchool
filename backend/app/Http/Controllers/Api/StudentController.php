<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use App\Services\Students\ListStudentsService;
use App\Services\Students\ShowStudentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudentController extends ApiController
{
    public function index(Request $request, ListStudentsService $students): JsonResponse
    {
        $user = $request->user();

        if (! $user->school_id) {
            return $this->error(
                'Authenticated user is not assigned to a school.',
                status: 403,
            );
        }

        return $this->success([
            'students' => $students->forSchool($user->school_id),
        ], 'Students retrieved.');
    }

    public function show(
        Request $request,
        User $student,
        ShowStudentService $students
    ): JsonResponse {
        $user = $request->user();

        if (! $user->school_id) {
            return $this->error(
                'Authenticated user is not assigned to a school.',
                status: 403,
            );
        }

        $studentData = $students->forSchool($student, $user->school_id);

        if (! $studentData) {
            return $this->error(
                'Student was not found for this school.',
                status: 404,
            );
        }

        return $this->success([
            'student' => $studentData,
        ], 'Student retrieved.');
    }
}
