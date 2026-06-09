<?php

namespace Tests\Feature;

use App\Models\School;
use App\Models\User;
use Firebase\JWT\JWT;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ClassStoreTest extends TestCase
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

    public function test_it_creates_a_class_for_the_authenticated_users_school(): void
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
        ]);

        $this
            ->withToken($this->tokenFor($user->clerk_user_id))
            ->postJson('/api/classes', [
                'name' => 'Grade 8A',
                'grade_level' => '8',
                'section' => 'A',
                'academic_year' => '2026-2027',
                'is_active' => true,
            ])
            ->assertCreated()
            ->assertJson([
                'message' => 'Class created.',
                'data' => [
                    'class' => [
                        'name' => 'Grade 8A',
                        'grade_level' => '8',
                        'section' => 'A',
                        'academic_year' => '2026-2027',
                        'is_active' => true,
                        'teachers_count' => 0,
                        'students_count' => 0,
                    ],
                ],
            ]);

        $this->assertDatabaseHas('school_classes', [
            'school_id' => $school->id,
            'name' => 'Grade 8A',
            'grade_level' => '8',
            'section' => 'A',
            'academic_year' => '2026-2027',
            'is_active' => true,
        ]);
    }

    public function test_it_validates_required_fields(): void
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
        ]);

        $this
            ->withToken($this->tokenFor($user->clerk_user_id))
            ->postJson('/api/classes', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'name',
                'grade_level',
                'academic_year',
            ]);
    }

    public function test_it_rejects_users_without_school_scope(): void
    {
        $user = User::factory()->create([
            'school_id' => null,
            'clerk_user_id' => 'user_123',
        ]);

        $this
            ->withToken($this->tokenFor($user->clerk_user_id))
            ->postJson('/api/classes', [
                'name' => 'Grade 8A',
                'grade_level' => '8',
                'section' => 'A',
                'academic_year' => '2026-2027',
            ])
            ->assertForbidden();
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