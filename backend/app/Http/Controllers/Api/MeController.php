<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MeController extends ApiController
{
    public function __invoke(Request $request): JsonResponse
    {
        $user = $request->user()->load(['roles', 'school']);

        return $this->success([
            'id' => $user->id,
            'clerk_user_id' => $user->clerk_user_id,
            'name' => $user->name,
            'email' => $user->email,
            'roles' => $user->roles->pluck('name')->values(),
            'school' => $user->school ? [
                'id' => $user->school->id,
                'name' => $user->school->name,
                'slug' => $user->school->slug,
            ] : null,
        ], 'Authenticated user retrieved.');
    }
}
