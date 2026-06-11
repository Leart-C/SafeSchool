<?php

namespace App\Services\Users;

use App\Models\User;

class UpdateUserRolesService
{
    /**
     * @param  array<int, string>  $roles
     * @return array<string, mixed>|null
     */
    public function forSchool(
        User $targetUser,
        int $schoolId,
        array $roles
    ): ?array {
        if ($targetUser->school_id !== $schoolId) {
            return null;
        }

        $targetUser->syncRoles($roles);

        $targetUser->load('roles:id,name');

        return [
            'id' => $targetUser->id,
            'clerk_user_id' => $targetUser->clerk_user_id,
            'name' => $targetUser->name,
            'first_name' => $targetUser->first_name,
            'last_name' => $targetUser->last_name,
            'email' => $targetUser->email,
            'avatar_url' => $targetUser->avatar_url,
            'roles' => $targetUser->roles->pluck('name')->values(),
        ];
    }
}
