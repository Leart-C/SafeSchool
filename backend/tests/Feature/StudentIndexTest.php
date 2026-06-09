<?php

namespace Tests\Feature;

use App\Models\School;
use App\Models\SchoolClass;
use App\Models\User;
use Firebase\JWT\JWT;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class StudentIndexTest extends TestCase
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

        Role::findOrCreate('student');
        Role::findOrCreate('teacher');
    }

    public function test_it_lists_students_for_the_authenticated_users_school(): void
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
            'clerk_user_id' => 'user_123',
        ]);

        $student = User::factory()->create([
            'school_id' => $school->id,
            'first_name' => 'Ada',
            'last_name' => 'Lovelace',
            'name' => 'Ada Lovelace',
            'email' => 'ada.student@example.com',
        ]);
        $student->assignRole('student');

        $guardian = User::factory()->create([
            'school_id' => $school->id,
        ]);
        $student->guardians()->attach($guardian->id, [
            'relationship' => 'mother',
            'is_primary' => true,
            'emergency_contact_priority' => 1,
        ]);

        $class = SchoolClass::query()->create([
            'school_id' => $school->id,
            'name' => 'Grade 5A',
            'grade_level' => '5',
            'section' => 'A',
            'academic_year' => '2026-2027',
            'is_active' => true,
        ]);
        $class->users()->attach($student->id, ['role' => 'student']);

        $teacher = User::factory()->create([
            'school_id' => $school->id,
            'name' => 'Teacher User',
        ]);
        $teacher->assignRole('teacher');

        $otherStudent = User::factory()->create([
            'school_id' => $otherSchool->id,
            'name' => 'Hidden Student',
        ]);
        $otherStudent->assignRole('student');

        $this
            ->withToken($this->tokenFor($admin->clerk_user_id))
            ->getJson('/api/students')
            ->assertOk()
            ->assertJson([
                'message' => 'Students retrieved.',
                'data' => [
                    'students' => [
                        [
                            'id' => $student->id,
                            'name' => 'Ada Lovelace',
                            'first_name' => 'Ada',
                            'last_name' => 'Lovelace',
                            'email' => 'ada.student@example.com',
                            'guardians_count' => 1,
                            'classes_count' => 1,
                        ],
                    ],
                ],
            ])
            ->assertJsonMissing([
                'name' => 'Teacher User',
            ])
            ->assertJsonMissing([
                'name' => 'Hidden Student',
            ]);
    }

    public function test_it_rejects_users_without_school_scope(): void
    {
        $admin = User::factory()->create([
            'school_id' => null,
            'clerk_user_id' => 'user_123',
        ]);

        $this
            ->withToken($this->tokenFor($admin->clerk_user_id))
            ->getJson('/api/students')
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