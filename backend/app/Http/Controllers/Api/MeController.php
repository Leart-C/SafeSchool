<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MeController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $user = $request->user()->load(['roles', 'school']);

        return response()->json([
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
        ]);
    }
}