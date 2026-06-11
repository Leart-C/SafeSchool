<?php

namespace App\Services\Students;

use App\Enums\UserRole;
use App\Models\User;
use App\Services\Users\LinkGuardianToStudentService;
use Illuminate\Support\Facades\DB;

class CreateAndLinkGuardianService
{
    public function __construct(
        private readonly LinkGuardianToStudentService $linkGuardianToStudent
    ) {}

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>|null
     */
    public function forSchool(User $student, int $schoolId, array $data): ?array
    {
        if ($student->school_id !== $schoolId) {
            return null;
        }

        return DB::transaction(function () use ($data, $schoolId, $student): array {
            $guardian = User::query()
                ->where('school_id', $schoolId)
                ->where('email', $data['email'])
                ->first();

            if (! $guardian) {
                $guardian = User::query()->create([
                    'school_id' => $schoolId,
                    'first_name' => $data['first_name'],
                    'last_name' => $data['last_name'],
                    'name' => trim($data['first_name'].' '.$data['last_name']),
                    'email' => $data['email'],
                    'phone' => $data['phone'] ?? null,
                ]);
            } else {
                $guardian->forceFill([
                    'first_name' => $guardian->first_name ?: $data['first_name'],
                    'last_name' => $guardian->last_name ?: $data['last_name'],
                    'name' => $guardian->name ?: trim($data['first_name'].' '.$data['last_name']),
                    'phone' => $guardian->phone ?: ($data['phone'] ?? null),
                ])->save();
            }

            $guardian->assignRole(UserRole::Parent->value);

            $this->linkGuardianToStudent->link(
                guardian: $guardian,
                student: $student,
                relationship: $data['relationship'],
                isPrimary: (bool) ($data['is_primary'] ?? false),
                emergencyContactPriority: $data['emergency_contact_priority'] ?? null,
            );

            $guardian->load('roles');

            return [
                'id' => $guardian->id,
                'name' => $guardian->name,
                'first_name' => $guardian->first_name,
                'last_name' => $guardian->last_name,
                'email' => $guardian->email,
                'phone' => $guardian->phone,
                'avatar_url' => $guardian->avatar_url,
                'roles' => $guardian->roles->pluck('name')->values(),
                'relationship' => $data['relationship'],
                'is_primary' => (bool) ($data['is_primary'] ?? false),
                'emergency_contact_priority' => $data['emergency_contact_priority'] ?? null,
            ];
        });
    }
}
