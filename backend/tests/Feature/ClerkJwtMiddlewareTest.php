<?php

namespace Tests\Feature;

use App\Models\School;
use App\Models\User;
use Firebase\JWT\JWT;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ClerkJwtMiddlewareTest extends TestCase
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
    }

    public function test_it_rejects_requests_without_a_token(): void
    {
        $this->getJson('/api/me')
            ->assertUnauthorized()
            ->assertJson([
                'message' => 'Unauthenticated.',
            ]);
    }

    public function test_it_rejects_valid_clerk_tokens_without_a_synced_local_user(): void
    {
        $this
            ->withToken($this->tokenFor('user_missing'))
            ->getJson('/api/me')
            ->assertUnauthorized()
            ->assertJson([
                'message' => 'Authenticated Clerk user is not synced locally.',
            ]);
    }

    public function test_it_returns_the_authenticated_local_user(): void
    {
        $school = School::query()->create([
            'name' => 'SafeSchool Demo',
            'slug' => 'safe-school-demo',
            'timezone' => 'Europe/Tirane',
            'is_active' => true,
        ]);

        $user = User::factory()->create([
            'school_id' => $school->id,
            'clerk_user_id' => 'user_123',
            'name' => 'Ada Lovelace',
            'email' => 'ada@example.com',
        ]);

        Role::findOrCreate('teacher');
        $user->assignRole('teacher');

        $this
            ->withToken($this->tokenFor('user_123'))
            ->getJson('/api/me')
            ->assertOk()
            ->assertJson([
                'data' => [
                    'id' => $user->id,
                    'clerk_user_id' => 'user_123',
                    'name' => 'Ada Lovelace',
                    'email' => 'ada@example.com',
                    'roles' => ['teacher'],
                    'school' => [
                        'id' => $school->id,
                        'name' => 'SafeSchool Demo',
                        'slug' => 'safe-school-demo',
                    ],
                ],
                'message' => 'Authenticated user retrieved.',
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
