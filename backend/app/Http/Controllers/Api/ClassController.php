<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\StoreClassRequest;
use App\Http\Requests\UpdateClassRequest;
use App\Models\SchoolClass;
use App\Services\Classes\CreateClassService;
use App\Services\Classes\ListClassesService;
use App\Services\Classes\UpdateClassService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClassController extends ApiController
{
    public function index(Request $request, ListClassesService $classes): JsonResponse
    {
        $user = $request->user();

        if (! $user->school_id) {
            return $this->error(
                'Authenticated user is not assigned to a school.',
                status: 403,
            );
        }

        return $this->success([
            'classes' => $classes->forSchool($user->school_id),
        ], 'Classes retrieved.');
    }

    public function store(
        StoreClassRequest $request,
        CreateClassService $classes
    ): JsonResponse {
        $user = $request->user();

        if (! $user->school_id) {
            return $this->error(
                'Authenticated user is not assigned to a school.',
                status: 403,
            );
        }

        return $this->created([
            'class' => $classes->forSchool(
                $user->school_id,
                $request->validated(),
            ),
        ], 'Class created.');
    }

    public function update(
        UpdateClassRequest $request,
        SchoolClass $class,
        UpdateClassService $classes
    ): JsonResponse {
        $user = $request->user();

        if (! $user->school_id) {
            return $this->error(
                'Authenticated user is not assigned to a school.',
                status: 403,
            );
        }

        $classData = $classes->forSchool(
            $class,
            $user->school_id,
            $request->validated(),
        );

        if (! $classData) {
            return $this->error(
                'Class was not found for this school.',
                status: 404,
            );
        }

        return $this->success([
            'class' => $classData,
        ], 'Class updated.');
    }
}