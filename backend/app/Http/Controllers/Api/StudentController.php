<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\StoreStudentGuardianRequest;
use App\Http\Requests\StoreStudentRequest;
use App\Models\User;
use App\Services\Students\CreateAndLinkGuardianService;
use App\Services\Students\CreateStudentService;
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

    public function store(
        StoreStudentRequest $request,
        CreateStudentService $students
    ): JsonResponse {
        $user = $request->user();

        if (! $user->school_id) {
            return $this->error(
                'Authenticated user is not assigned to a school.',
                status: 403,
            );
        }

        return $this->created([
            'student' => $students->forSchool(
                $user->school_id,
                $request->validated(),
            ),
        ], 'Student registered.');
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

    public function storeGuardian(
        StoreStudentGuardianRequest $request,
        User $student,
        CreateAndLinkGuardianService $guardians
    ): JsonResponse {
        $user = $request->user();

        if (! $user->school_id) {
            return $this->error(
                'Authenticated user is not assigned to a school.',
                status: 403,
            );
        }

        $guardian = $guardians->forSchool(
            student: $student,
            schoolId: $user->school_id,
            data: $request->validated(),
        );

        if (! $guardian) {
            return $this->error(
                'Student was not found for this school.',
                status: 404,
            );
        }

        return $this->created([
            'guardian' => $guardian,
        ], 'Guardian linked.');
    }
}