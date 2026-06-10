<?php

namespace Tests\Feature;

use App\Enums\MessageAudience;
use App\Models\Message;
use App\Models\School;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Firebase\JWT\JWT;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MessageIndexTest extends TestCase
{
    use RefreshDatabase;

    private string $privateKey;

    private string $publicKey;

    protected function setUp(): void
    {
        parent::setUp();

        $keyPair = openssl_pkey_new([
            'digest_alg' => 'sha256',
            'private_key_bits' => 2048,
            'private_key_type' => OPENSSL_KEYTYPE_RSA,
        ]);

        $privateKey = '';
        openssl_pkey_export($keyPair, $privateKey);
        $this->privateKey = $privateKey;

        $details = openssl_pkey_get_details($keyPair);
        $this->publicKey = $details['key'];

        config([
            'clerk.jwt_key' => $this->publicKey,
            'clerk.secret_key' => null,
            'clerk.jwt_audience' => 'safeschool-api',
            'clerk.jwt_authorized_parties' => ['http://localhost:5173'],
        ]);

        $this->seed(RoleSeeder::class);
    }

    public function test_it_lists_messages_for_the_authenticated_users_school(): void
    {
        $school = School::query()->create([
            'name' => 'SafeSchool Demo',
            'slug' => 'safe-school-demo',
            'timezone' => 'Europe/Tirane',
            'is_active' => true,
        ]);

        $otherSchool = School::query()->create([
            'name' => 'Other School',
            'slug' => 'other-school',
            'timezone' => 'Europe/Tirane',
            'is_active' => true,
        ]);

        $admin = User::factory()->create([
            'school_id' => $school->id,
            'clerk_user_id' => 'user_admin',
            'name' => 'Admin User',
            'email' => 'admin@example.com',
        ]);
        $admin->assignRole('admin');

        Message::query()->create([
            'school_id' => $school->id,
            'sender_user_id' => $admin->id,
            'audience' => MessageAudience::School->value,
            'title' => 'Welcome back',
            'body' => 'School starts Monday.',
            'published_at' => now(),
        ]);

        $otherAdmin = User::factory()->create([
            'school_id' => $otherSchool->id,
            'name' => 'Hidden Admin',
        ]);

        Message::query()->create([
            'school_id' => $otherSchool->id,
            'sender_user_id' => $otherAdmin->id,
            'audience' => MessageAudience::School->value,
            'title' => 'Hidden message',
            'body' => 'Should not be visible.',
            'published_at' => now(),
        ]);

        $this
            ->withToken($this->tokenFor($admin->clerk_user_id))
            ->getJson('/api/messages')
            ->assertOk()
            ->assertJson([
                'message' => 'Messages retrieved.',
                'data' => [
                    'messages' => [
                        [
                            'audience' => 'school',
                            'title' => 'Welcome back',
                            'body' => 'School starts Monday.',
                            'sender' => [
                                'id' => $admin->id,
                                'name' => 'Admin User',
                                'email' => 'admin@example.com',
                            ],
                            'class' => null,
                        ],
                    ],
                ],
            ])
            ->assertJsonMissing([
                'title' => 'Hidden message',
            ]);
    }

    public function test_it_rejects_users_without_school_scope(): void
    {
        $admin = User::factory()->create([
            'school_id' => null,
            'clerk_user_id' => 'user_admin',
        ]);
        $admin->assignRole('admin');

        $this
            ->withToken($this->tokenFor($admin->clerk_user_id))
            ->getJson('/api/messages')
            ->assertForbidden()
            ->assertJson([
                'message' => 'Authenticated user is not assigned to a school.',
            ]);
    }

    private function tokenFor(string $clerkUserId): string
    {
        return JWT::encode([
            'azp' => 'http://localhost:5173',
            'aud' => 'safeschool-api',
            'exp' => now()->addMinutes(10)->timestamp,
            'iat' => now()->timestamp,
            'iss' => 'https://clerk.safeschool.test',
            'nbf' => now()->subMinute()->timestamp,
            'sid' => 'sess_test_123',
            'sub' => $clerkUserId,
            'v' => 2,
        ], $this->privateKey, 'RS256');
    }
}