<?php

namespace App\Services\Students;

use App\Enums\UserRole;
use App\Models\StudentProfile;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class CreateStudentService
{
    public function __construct(
        private readonly StudentProfileData $studentProfileData
    ) {}

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    public function forSchool(int $schoolId, array $data): array
    {
        return DB::transaction(function () use ($schoolId, $data): array {
            $firstName = trim($data['first_name']);
            $lastName = trim($data['last_name']);
            $name = trim("{$firstName} {$lastName}");

            $student = User::query()->create([
                'school_id' => $schoolId,
                'name' => $name,
                'first_name' => $firstName,
                'last_name' => $lastName,
                'email' => $data['email'] ?? $this->placeholderEmail($schoolId),
            ]);

            $student->assignRole(UserRole::Student->value);

            $profile = StudentProfile::query()->create([
                'school_id' => $schoolId,
                'user_id' => $student->id,
                'student_code' => $data['student_code'] ?? $this->nextStudentCode($schoolId),
                'date_of_birth' => $data['date_of_birth'] ?? null,
                'grade_level' => $data['grade_level'],
                'enrollment_status' => $data['enrollment_status'] ?? 'active',
                'notes' => $data['notes'] ?? null,
            ]);

            return [
                'id' => $student->id,
                'name' => $student->name,
                'first_name' => $student->first_name,
                'last_name' => $student->last_name,
                'email' => $student->email,
                'avatar_url' => $student->avatar_url,
                'profile' => $this->studentProfileData->fromProfile($profile),
                'guardians_count' => 0,
                'classes_count' => 0,
            ];
        });
    }

    private function nextStudentCode(int $schoolId): string
    {
        $nextNumber = StudentProfile::query()
            ->where('school_id', $schoolId)
            ->count() + 1;

        return sprintf('SS-%s-%06d', now()->year, $nextNumber);
    }

    private function placeholderEmail(int $schoolId): string
    {
        return sprintf(
            'student-%s-%s@safeschool.local',
            $schoolId,
            str()->uuid(),
        );
    }
}