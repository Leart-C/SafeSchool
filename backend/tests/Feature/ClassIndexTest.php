<?php

namespace Tests\Feature;

use App\Models\School;
use App\Models\SchoolClass;
use App\Models\User;
use Firebase\JWT\JWT;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ClassIndexTest extends TestCase
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

    public function test_it_lists_classes_for_the_authenticated_users_school(): void
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

        $user = User::factory()->create([
            'school_id' => $school->id,
            'clerk_user_id' => 'user_123',
        ]);

        $teacher = User::factory()->create([
            'school_id' => $school->id,
        ]);

        $student = User::factory()->create([
            'school_id' => $school->id,
        ]);

        $class = SchoolClass::query()->create([
            'school_id' => $school->id,
            'name' => 'Grade 5A',
            'grade_level' => '5',
            'section' => 'A',
            'academic_year' => '2026-2027',
            'is_active' => true,
        ]);

        $class->users()->attach($teacher->id, ['role' => 'teacher']);
        $class->users()->attach($student->id, ['role' => 'student']);

        SchoolClass::query()->create([
            'school_id' => $otherSchool->id,
            'name' => 'Hidden Class',
            'grade_level' => '6',
            'section' => 'B',
            'academic_year' => '2026-2027',
            'is_active' => true,
        ]);

        $this
            ->withToken($this->tokenFor($user->clerk_user_id))
            ->getJson('/api/classes')
            ->assertOk()
            ->assertJson([
                'message' => 'Classes retrieved.',
                'data' => [
                    'classes' => [
                        [
                            'id' => $class->id,
                            'name' => 'Grade 5A',
                            'grade_level' => '5',
                            'academic_year' => '2026-2027',
                            'is_active' => true,
                            'teachers_count' => 1,
                            'students_count' => 1,
                        ],
                    ],
                ],
            ])
            ->assertJsonMissing([
                'name' => 'Hidden Class',
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
            ->getJson('/api/classes')
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