<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\School;
use App\Models\StudentProfile;
use App\Models\User;
use Firebase\JWT\JWT;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class StudentRegistrationTest extends TestCase
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

        Permission::findOrCreate('users.manage');

        Role::findOrCreate(UserRole::Admin->value)->givePermissionTo([
            'users.manage',
        ]);

        Role::findOrCreate(UserRole::Director->value)->givePermissionTo([
            'users.manage',
        ]);

        Role::findOrCreate(UserRole::Teacher->value);
        Role::findOrCreate(UserRole::Student->value);
    }

    public function test_admin_can_register_student_with_profile(): void
    {
        $school = School::query()->create([
            'name' => 'SafeSchool Demo',
            'slug' => 'safe-school-demo',
            'timezone' => 'Europe/Tirane',
            'is_active' => true,
        ]);

        $admin = User::factory()->create([
            'school_id' => $school->id,
            'clerk_user_id' => 'admin_123',
        ]);
        $admin->assignRole(UserRole::Admin->value);

        $this
            ->withToken($this->tokenFor($admin->clerk_user_id))
            ->postJson('/api/students', [
                'first_name' => 'Ada',
                'last_name' => 'Lovelace',
                'email' => 'ada.student@example.com',
                'student_code' => 'SS-2026-000421',
                'date_of_birth' => '2014-03-18',
                'grade_level' => '6',
                'enrollment_status' => 'active',
                'notes' => 'Transferred from another school.',
            ])
            ->assertCreated()
            ->assertJson([
                'message' => 'Student registered.',
                'data' => [
                    'student' => [
                        'name' => 'Ada Lovelace',
                        'first_name' => 'Ada',
                        'last_name' => 'Lovelace',
                        'email' => 'ada.student@example.com',
                        'profile' => [
                            'student_code' => 'SS-2026-000421',
                            'date_of_birth' => '2014-03-18',
                            'grade_level' => '6',
                            'enrollment_status' => 'active',
                            'notes' => 'Transferred from another school.',
                        ],
                    ],
                ],
            ]);

        $student = User::query()
            ->where('email', 'ada.student@example.com')
            ->firstOrFail();

        $this->assertTrue($student->hasRole(UserRole::Student->value));

        $this->assertDatabaseHas('student_profiles', [
            'school_id' => $school->id,
            'user_id' => $student->id,
            'student_code' => 'SS-2026-000421',
            'grade_level' => '6',
            'enrollment_status' => 'active',
        ]);
    }

    public function test_it_generates_student_code_and_placeholder_email_when_missing(): void
    {
        $school = School::query()->create([
            'name' => 'SafeSchool Demo',
            'slug' => 'safe-school-demo',
            'timezone' => 'Europe/Tirane',
            'is_active' => true,
        ]);

        $admin = User::factory()->create([
            'school_id' => $school->id,
            'clerk_user_id' => 'admin_123',
        ]);
        $admin->assignRole(UserRole::Admin->value);

        $this
            ->withToken($this->tokenFor($admin->clerk_user_id))
            ->postJson('/api/students', [
                'first_name' => 'Ardit',
                'last_name' => 'Hoxha',
                'grade_level' => '5',
            ])
            ->assertCreated()
            ->assertJsonPath('data.student.profile.student_code', 'SS-'.now()->year.'-000001')
            ->assertJsonPath('data.student.profile.grade_level', '5');

        $student = User::query()
            ->where('first_name', 'Ardit')
            ->where('last_name', 'Hoxha')
            ->firstOrFail();

        $this->assertStringContainsString('@safeschool.local', $student->email);
    }

    public function test_teacher_cannot_register_student(): void
    {
        $school = School::query()->create([
            'name' => 'SafeSchool Demo',
            'slug' => 'safe-school-demo',
            'timezone' => 'Europe/Tirane',
            'is_active' => true,
        ]);

        $teacher = User::factory()->create([
            'school_id' => $school->id,
            'clerk_user_id' => 'teacher_123',
        ]);
        $teacher->assignRole(UserRole::Teacher->value);

        $this
            ->withToken($this->tokenFor($teacher->clerk_user_id))
            ->postJson('/api/students', [
                'first_name' => 'Ada',
                'last_name' => 'Lovelace',
                'grade_level' => '6',
            ])
            ->assertForbidden();

        $this->assertDatabaseMissing('users', [
            'first_name' => 'Ada',
            'last_name' => 'Lovelace',
        ]);
    }

    public function test_it_validates_unique_student_code_per_school(): void
    {
        $school = School::query()->create([
            'name' => 'SafeSchool Demo',
            'slug' => 'safe-school-demo',
            'timezone' => 'Europe/Tirane',
            'is_active' => true,
        ]);

        $admin = User::factory()->create([
            'school_id' => $school->id,
            'clerk_user_id' => 'admin_123',
        ]);
        $admin->assignRole(UserRole::Admin->value);

        $existingStudent = User::factory()->create([
            'school_id' => $school->id,
        ]);
        $existingStudent->assignRole(UserRole::Student->value);

        StudentProfile::query()->create([
            'school_id' => $school->id,
            'user_id' => $existingStudent->id,
            'student_code' => 'SS-2026-000421',
            'grade_level' => '6',
            'enrollment_status' => 'active',
        ]);

        $this
            ->withToken($this->tokenFor($admin->clerk_user_id))
            ->postJson('/api/students', [
                'first_name' => 'Ada',
                'last_name' => 'Lovelace',
                'student_code' => 'SS-2026-000421',
                'grade_level' => '6',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['student_code']);
    }

    public function test_it_rejects_users_without_school_scope(): void
    {
        $admin = User::factory()->create([
            'school_id' => null,
            'clerk_user_id' => 'admin_123',
        ]);
        $admin->assignRole(UserRole::Admin->value);

        $this
            ->withToken($this->tokenFor($admin->clerk_user_id))
            ->postJson('/api/students', [
                'first_name' => 'Ada',
                'last_name' => 'Lovelace',
                'grade_level' => '6',
            ])
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