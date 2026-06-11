<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\StoreClassMemberRequest;
use App\Http\Requests\StoreClassRequest;
use App\Http\Requests\UpdateClassRequest;
use App\Models\SchoolClass;
use App\Models\User;
use App\Services\Classes\CreateClassService;
use App\Services\Classes\DestroyClassMemberService;
use App\Services\Classes\ListClassesService;
use App\Services\Classes\ShowClassService;
use App\Services\Classes\StoreClassMemberService;
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

    public function show(
        Request $request,
        SchoolClass $class,
        ShowClassService $classes
    ): JsonResponse {
        $user = $request->user();

        if (! $user->school_id) {
            return $this->error(
                'Authenticated user is not assigned to a school.',
                status: 403,
            );
        }

        $classData = $classes->forSchool($class, $user->school_id);

        if (! $classData) {
            return $this->error(
                'Class was not found for this school.',
                status: 404,
            );
        }

        return $this->success([
            'class' => $classData,
        ], 'Class retrieved.');
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

    public function storeMember(
        StoreClassMemberRequest $request,
        SchoolClass $class,
        StoreClassMemberService $classes
    ): JsonResponse {
        $user = $request->user();

        if (! $user->school_id) {
            return $this->error(
                'Authenticated user is not assigned to a school.',
                status: 403,
            );
        }

        $classData = $classes->forSchool(
            schoolClass: $class,
            member: User::query()->findOrFail($request->integer('user_id')),
            schoolId: $user->school_id,
            role: $request->validated('role'),
        );

        if (! $classData) {
            return $this->error(
                'Class member was not found for this school.',
                status: 404,
            );
        }

        return $this->success([
            'class' => $classData,
        ], 'Class member saved.');
    }

    public function destroyMember(
        Request $request,
        SchoolClass $class,
        User $member,
        DestroyClassMemberService $classes
    ): JsonResponse {
        $user = $request->user();

        if (! $user->school_id) {
            return $this->error(
                'Authenticated user is not assigned to a school.',
                status: 403,
            );
        }

        if (! $user->can('class_memberships.manage')) {
            return $this->error(
                'You are not allowed to manage class memberships.',
                status: 403,
            );
        }

        $classData = $classes->forSchool(
            schoolClass: $class,
            member: $member,
            schoolId: $user->school_id,
        );

        if (! $classData) {
            return $this->error(
                'Class member was not found for this school.',
                status: 404,
            );
        }

        return $this->success([
            'class' => $classData,
        ], 'Class member removed.');
    }
}