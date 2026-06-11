<?php

namespace App\Services\Classes;

use App\Models\SchoolClass;
use App\Models\User;

class StoreClassMemberService
{
    public function __construct(
        private readonly ShowClassService $showClassService
    ) {}

    /**
     * @return array<string, mixed>|null
     */
    public function forSchool(
        SchoolClass $schoolClass,
        User $member,
        int $schoolId,
        string $role
    ): ?array {
        if ($schoolClass->school_id !== $schoolId) {
            return null;
        }

        if ($member->school_id !== $schoolId) {
            return null;
        }

        $schoolClass->users()->syncWithoutDetaching([
            $member->id => [
                'role' => $role,
            ],
        ]);

        return $this->showClassService->forSchool($schoolClass->fresh(), $schoolId);
    }
}