<?php

namespace App\Services\Classes;

use App\Models\SchoolClass;
use App\Models\User;

class ShowClassService
{
    public function __construct(
        private readonly ClassResourceData $classResourceData
    ) {}

    /**
     * @return array<string, mixed>|null
     */
    public function forSchool(SchoolClass $schoolClass, int $schoolId): ?array
    {
        if ($schoolClass->school_id !== $schoolId) {
            return null;
        }

        $schoolClass->loadCount([
            'teachers',
            'students',
        ]);

        $schoolClass->load([
            'teachers' => fn ($query) => $query
                ->select([
                    'users.id',
                    'users.name',
                    'users.email',
                    'users.first_name',
                    'users.last_name',
                    'users.avatar_url',
                ])
                ->orderBy('users.last_name')
                ->orderBy('users.first_name')
                ->orderBy('users.name'),
            'students' => fn ($query) => $query
                ->select([
                    'users.id',
                    'users.name',
                    'users.email',
                    'users.first_name',
                    'users.last_name',
                    'users.avatar_url',
                ])
                ->orderBy('users.last_name')
                ->orderBy('users.first_name')
                ->orderBy('users.name'),
        ]);

        return [
            ...$this->classResourceData->fromModel($schoolClass),
            'teachers' => $schoolClass->teachers
                ->map(fn (User $teacher): array => $this->userData($teacher))
                ->values(),
            'students' => $schoolClass->students
                ->map(fn (User $student): array => $this->userData($student))
                ->values(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function userData(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'avatar_url' => $user->avatar_url,
        ];
    }
}