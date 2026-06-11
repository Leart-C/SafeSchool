<?php

namespace App\Services\Users;

use App\Models\User;
use Illuminate\Support\Collection;

class ListUsersService
{
    /**
     * @return Collection<int, array<string, mixed>>
     */
    public function forSchool(int $schoolId): Collection
    {
        return User::query()
            ->where('school_id', $schoolId)
            ->with(['roles:id,name'])
            ->withCount([
                'teachingClasses',
                'enrolledClasses',
                'guardians',
                'students',
            ])
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->orderBy('name')
            ->get()
            ->map(fn (User $user): array => [
                'id' => $user->id,
                'clerk_user_id' => $user->clerk_user_id,
                'name' => $user->name,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
                'avatar_url' => $user->avatar_url,
                'roles' => $user->roles->pluck('name')->values(),
                'teaching_classes_count' => $user->teaching_classes_count,
                'enrolled_classes_count' => $user->enrolled_classes_count,
                'guardians_count' => $user->guardians_count,
                'students_count' => $user->students_count,
            ])
            ->values();
    }
}
