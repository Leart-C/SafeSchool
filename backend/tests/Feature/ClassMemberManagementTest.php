<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\School;
use App\Models\SchoolClass;
use App\Models\User;
use Firebase\JWT\JWT;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ClassMemberManagementTest extends TestCase
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

        Permission::findOrCreate('class_memberships.manage');

        Role::findOrCreate(UserRole::Admin->value)->givePermissionTo([
            'class_memberships.manage',
        ]);

        Role::findOrCreate(UserRole::Director->value)->givePermissionTo([
            'class_memberships.manage',
        ]);

        Role::findOrCreate(UserRole::Teacher->value);
        Role::findOrCreate(UserRole::Student->value);
    }

    public function test_admin_can_add_student_to_class(): void
    {
        [$school, $admin, $class] = $this->schoolAdminAndClass();

        $student = User::factory()->create([
            'school_id' => $school->id,
            'name' => 'Ada Lovelace',
            'email' => 'ada.student@example.com',
        ]);
        $student->assignRole(UserRole::Student->value);

        $this
            ->withToken($this->tokenFor($admin->clerk_user_id))
            ->postJson("/api/classes/{$class->id}/members", [
                'user_id' => $student->id,
                'role' => 'student',
            ])
            ->assertOk()
            ->assertJson([
                'message' => 'Class member saved.',
                'data' => [
                    'class' => [
                        'id' => $class->id,
                        'students_count' => 1,
                        'students' => [
                            [
                                'id' => $student->id,
                                'name' => 'Ada Lovelace',
                                'email' => 'ada.student@example.com',
                            ],
                        ],
                    ],
                ],
            ]);

        $this->assertDatabaseHas('class_user', [
            'school_class_id' => $class->id,
            'user_id' => $student->id,
            'role' => 'student',
        ]);
    }

    public function test_admin_can_add_teacher_to_class(): void
    {
        [$school, $admin, $class] = $this->schoolAdminAndClass();

        $teacher = User::factory()->create([
            'school_id' => $school->id,
            'name' => 'Grace Hopper',
            'email' => 'grace.teacher@example.com',
        ]);
        $teacher->assignRole(UserRole::Teacher->value);

        $this
            ->withToken($this->tokenFor($admin->clerk_user_id))
            ->postJson("/api/classes/{$class->id}/members", [
                'user_id' => $teacher->id,
                'role' => 'teacher',
            ])
            ->assertOk()
            ->assertJson([
                'data' => [
                    'class' => [
                        'teachers_count' => 1,
                        'teachers' => [
                            [
                                'id' => $teacher->id,
                                'name' => 'Grace Hopper',
                            ],
                        ],
                    ],
                ],
            ]);

        $this->assertDatabaseHas('class_user', [
            'school_class_id' => $class->id,
            'user_id' => $teacher->id,
            'role' => 'teacher',
        ]);
    }

    public function test_admin_can_remove_member_from_class(): void
    {
        [$school, $admin, $class] = $this->schoolAdminAndClass();

        $student = User::factory()->create([
            'school_id' => $school->id,
            'name' => 'Ada Lovelace',
        ]);
        $student->assignRole(UserRole::Student->value);

        $class->users()->attach($student->id, ['role' => 'student']);

        $this
            ->withToken($this->tokenFor($admin->clerk_user_id))
            ->deleteJson("/api/classes/{$class->id}/members/{$student->id}")
            ->assertOk()
            ->assertJson([
                'message' => 'Class member removed.',
                'data' => [
                    'class' => [
                        'id' => $class->id,
                        'students_count' => 0,
                        'students' => [],
                    ],
                ],
            ]);

        $this->assertDatabaseMissing('class_user', [
            'school_class_id' => $class->id,
            'user_id' => $student->id,
        ]);
    }

    public function test_teacher_cannot_manage_class_members(): void
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

        $class = $this->createClass($school);

        $student = User::factory()->create([
            'school_id' => $school->id,
        ]);
        $student->assignRole(UserRole::Student->value);

        $this
            ->withToken($this->tokenFor($teacher->clerk_user_id))
            ->postJson("/api/classes/{$class->id}/members", [
                'user_id' => $student->id,
                'role' => 'student',
            ])
            ->assertForbidden();

        $this->assertDatabaseMissing('class_user', [
            'school_class_id' => $class->id,
            'user_id' => $student->id,
        ]);
    }

    public function test_it_rejects_members_from_another_school(): void
    {
        [$school, $admin, $class] = $this->schoolAdminAndClass();

        $otherSchool = School::query()->create([
            'name' => 'Other School',
            'slug' => 'other-school',
            'timezone' => 'Europe/Tirane',
            'is_active' => true,
        ]);

        $otherStudent = User::factory()->create([
            'school_id' => $otherSchool->id,
        ]);
        $otherStudent->assignRole(UserRole::Student->value);

        $this
            ->withToken($this->tokenFor($admin->clerk_user_id))
            ->postJson("/api/classes/{$class->id}/members", [
                'user_id' => $otherStudent->id,
                'role' => 'student',
            ])
            ->assertNotFound()
            ->assertJson([
                'message' => 'Class member was not found for this school.',
            ]);

        $this->assertDatabaseMissing('class_user', [
            'school_class_id' => $class->id,
            'user_id' => $otherStudent->id,
        ]);
    }

    public function test_it_validates_member_role(): void
    {
        [$school, $admin, $class] = $this->schoolAdminAndClass();

        $student = User::factory()->create([
            'school_id' => $school->id,
        ]);
        $student->assignRole(UserRole::Student->value);

        $this
            ->withToken($this->tokenFor($admin->clerk_user_id))
            ->postJson("/api/classes/{$class->id}/members", [
                'user_id' => $student->id,
                'role' => 'principal',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['role']);
    }

    /**
     * @return array{0: School, 1: User, 2: SchoolClass}
     */
    private function schoolAdminAndClass(): array
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

        return [$school, $admin, $this->createClass($school)];
    }

    private function createClass(School $school): SchoolClass
    {
        return SchoolClass::query()->create([
            'school_id' => $school->id,
            'name' => 'Grade 5A',
            'grade_level' => '5',
            'section' => 'A',
            'academic_year' => '2026-2027',
            'is_active' => true,
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