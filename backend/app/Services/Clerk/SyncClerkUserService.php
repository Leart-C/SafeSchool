<?php

namespace App\Services\Clerk;

use App\Models\User;

class SyncClerkUserService
{
    public function sync(array $clerkUser): User
    {
        $email = $this->primaryEmail($clerkUser);

        return User::updateOrCreate(
            ['clerk_user_id' => $clerkUser['id']],
            [
                'name' => trim(($clerkUser['first_name'] ?? '').' '.($clerkUser['last_name'] ?? '')) ?: $email,
                'first_name' => $clerkUser['first_name'] ?? null,
                'last_name' => $clerkUser['last_name'] ?? null,
                'email' => $email,
                'avatar_url' => $clerkUser['image_url'] ?? null,
            ]
        );
    }

    private function primaryEmail(array $clerkUser): ?string
    {
        $primaryEmailId = $clerkUser['primary_email_address_id'] ?? null;

        foreach ($clerkUser['email_addresses'] ?? [] as $emailAddress) {
            if (($emailAddress['id'] ?? null) === $primaryEmailId) {
                return $emailAddress['email_address'] ?? null;
            }
        }

        return $clerkUser['email_addresses'][0]['email_address'] ?? null;
    }
}
