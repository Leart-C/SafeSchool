<?php

namespace App\Services\Classes;

use App\Models\SchoolClass;
use App\Models\User;

class DestroyClassMemberService
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
        int $schoolId
    ): ?array {
        if ($schoolClass->school_id !== $schoolId) {
            return null;
        }

        if ($member->school_id !== $schoolId) {
            return null;
        }

        $schoolClass->users()->detach($member->id);

        return $this->showClassService->forSchool($schoolClass->fresh(), $schoolId);
    }
}