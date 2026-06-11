<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\UpdateUserRolesRequest;
use App\Models\User;
use App\Services\Users\ListUsersService;
use App\Services\Users\UpdateUserRolesService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends ApiController
{
    public function index(Request $request, ListUsersService $users): JsonResponse
    {
        $user = $request->user();

        if (! $user->school_id) {
            return $this->error(
                'Authenticated user is not assigned to a school.',
                status: 403,
            );
        }

        if (! $user->can('users.view')) {
            return $this->error(
                'You are not allowed to view users.',
                status: 403,
            );
        }

        return $this->success([
            'users' => $users->forSchool($user->school_id),
        ], 'Users retrieved.');
    }

    public function updateRoles(
        UpdateUserRolesRequest $request,
        User $user,
        UpdateUserRolesService $users
    ): JsonResponse {
        $authUser = $request->user();

        if (! $authUser->school_id) {
            return $this->error(
                'Authenticated user is not assigned to a school.',
                status: 403,
            );
        }

        $updatedUser = $users->forSchool(
            targetUser: $user,
            schoolId: $authUser->school_id,
            roles: $request->validated('roles'),
        );

        if (! $updatedUser) {
            return $this->error(
                'User was not found for this school.',
                status: 404,
            );
        }

        return $this->success([
            'user' => $updatedUser,
        ], 'User roles updated.');
    }
}
