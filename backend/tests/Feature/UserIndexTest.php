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

class UserIndexTest extends TestCase
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

        Permission::findOrCreate('users.view');
        Permission::findOrCreate('users.manage');

        Role::findOrCreate(UserRole::Admin->value)->givePermissionTo([
            'users.view',
            'users.manage',
        ]);

        Role::findOrCreate(UserRole::Director->value)->givePermissionTo([
            'users.view',
            'users.manage',
        ]);

        Role::findOrCreate(UserRole::Teacher->value);
        Role::findOrCreate(UserRole::Parent->value);
        Role::findOrCreate(UserRole::Student->value);
    }

    public function test_admin_can_list_users_for_their_school(): void
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
            'clerk_user_id' => 'admin_123',
            'name' => 'Admin User',
            'email' => 'admin@example.com',
        ]);
        $admin->assignRole(UserRole::Admin->value);

        $teacher = User::factory()->create([
            'school_id' => $school->id,
            'first_name' => 'Grace',
            'last_name' => 'Hopper',
            'name' => 'Grace Hopper',
            'email' => 'grace.teacher@example.com',
        ]);
        $teacher->assignRole(UserRole::Teacher->value);

        $student = User::factory()->create([
            'school_id' => $school->id,
            'first_name' => 'Ada',
            'last_name' => 'Lovelace',
            'name' => 'Ada Lovelace',
            'email' => 'ada.student@example.com',
        ]);
        $student->assignRole(UserRole::Student->value);

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

        $guardian = User::factory()->create([
            'school_id' => $school->id,
            'name' => 'Parent User',
            'email' => 'parent@example.com',
        ]);
        $guardian->assignRole(UserRole::Parent->value);

        $student->guardians()->attach($guardian->id, [
            'relationship' => 'father',
            'is_primary' => true,
            'emergency_contact_priority' => 1,
        ]);

        $hiddenUser = User::factory()->create([
            'school_id' => $otherSchool->id,
            'name' => 'Hidden User',
            'email' => 'hidden@example.com',
        ]);
        $hiddenUser->assignRole(UserRole::Teacher->value);

        $this
            ->withToken($this->tokenFor($admin->clerk_user_id))
            ->getJson('/api/users')
            ->assertOk()
            ->assertJson([
                'message' => 'Users retrieved.',
            ])
            ->assertJsonFragment([
                'id' => $student->id,
                'name' => 'Ada Lovelace',
                'email' => 'ada.student@example.com',
                'roles' => ['student'],
                'enrolled_classes_count' => 1,
                'guardians_count' => 1,
            ])
            ->assertJsonFragment([
                'id' => $teacher->id,
                'name' => 'Grace Hopper',
                'email' => 'grace.teacher@example.com',
                'roles' => ['teacher'],
                'teaching_classes_count' => 1,
            ])
            ->assertJsonMissing([
                'name' => 'Hidden User',
            ]);
    }

    public function test_teacher_cannot_list_users(): void
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
            ->getJson('/api/users')
            ->assertForbidden()
            ->assertJson([
                'message' => 'You are not allowed to view users.',
            ]);
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
            ->getJson('/api/users')
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
