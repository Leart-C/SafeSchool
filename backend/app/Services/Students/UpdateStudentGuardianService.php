<?php

namespace App\Services\Students;

use App\Models\User;
use Illuminate\Support\Facades\DB;

class UpdateStudentGuardianService
{
    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>|null
     */
    public function forSchool(
        User $student,
        User $guardian,
        int $schoolId,
        array $data
    ): ?array {
        if ($student->school_id !== $schoolId || $guardian->school_id !== $schoolId) {
            return null;
        }

        if (! $student->guardians()->whereKey($guardian->id)->exists()) {
            return null;
        }

        return DB::transaction(function () use ($data, $guardian, $student): array {
            $guardian->update([
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'],
                'name' => trim($data['first_name'].' '.$data['last_name']),
                'email' => $data['email'],
                'phone' => $data['phone'] ?? null,
            ]);

            $student->guardians()->updateExistingPivot($guardian->id, [
                'relationship' => $data['relationship'],
                'is_primary' => (bool) ($data['is_primary'] ?? false),
                'emergency_contact_priority' => $data['emergency_contact_priority'] ?? null,
            ]);

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