<?php

namespace App\Services\Students;

use App\Models\User;
use Illuminate\Support\Collection;

class ListStudentsService
{
    /**
     * @return Collection<int, array<string, mixed>>
     */
    public function forSchool(int $schoolId): Collection
    {
        return User::query()
            ->where('school_id', $schoolId)
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
    }
}