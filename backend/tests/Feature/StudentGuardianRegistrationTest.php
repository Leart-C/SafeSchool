<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\School;
use App\Models\User;
use Firebase\JWT\JWT;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class StudentGuardianRegistrationTest extends TestCase
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

        Permission::findOrCreate('guardians.manage');

        Role::findOrCreate(UserRole::Admin->value)->givePermissionTo([
            'guardians.manage',
        ]);

        Role::findOrCreate(UserRole::Director->value)->givePermissionTo([
            'guardians.manage',
        ]);

        Role::findOrCreate(UserRole::Teacher->value);
        Role::findOrCreate(UserRole::Parent->value);
        Role::findOrCreate(UserRole::Student->value);
    }

    public function test_admin_can_create_and_link_guardian_to_student(): void
    {
        $school = $this->school();

        $admin = User::factory()->create([
            'school_id' => $school->id,
            'clerk_user_id' => 'admin_123',
        ]);
        $admin->assignRole(UserRole::Admin->value);

        $student = User::factory()->create([
            'school_id' => $school->id,
            'name' => 'Ada Lovelace',
            'email' => 'ada.student@example.com',
        ]);
        $student->assignRole(UserRole::Student->value);

        $this
            ->withToken($this->tokenFor($admin->clerk_user_id))
            ->postJson("/api/students/{$student->id}/guardians", [
                'first_name' => 'Mira',
                'last_name' => 'Lovelace',
                'email' => 'mira@example.com',
                'relationship' => 'mother',
                'is_primary' => true,
                'emergency_contact_priority' => 1,
            ])
            ->assertCreated()
            ->assertJson([
                'message' => 'Guardian linked.',
                'data' => [
                    'guardian' => [
                        'name' => 'Mira Lovelace',
                        'first_name' => 'Mira',
                        'last_name' => 'Lovelace',
                        'email' => 'mira@example.com',
                        'roles' => ['parent'],
                        'relationship' => 'mother',
                        'is_primary' => true,
                        'emergency_contact_priority' => 1,
                    ],
                ],
            ]);

        $guardian = User::query()
            ->where('email', 'mira@example.com')
            ->firstOrFail();

        $this->assertTrue($guardian->hasRole(UserRole::Parent->value));

        $this->assertDatabaseHas('guardian_student', [
            'guardian_user_id' => $guardian->id,
            'student_user_id' => $student->id,
            'relationship' => 'mother',
            'is_primary' => true,
            'emergency_contact_priority' => 1,
        ]);
    }

    public function test_director_can_create_and_link_guardian_to_student(): void
    {
        $school = $this->school();

        $director = User::factory()->create([
            'school_id' => $school->id,
            'clerk_user_id' => 'director_123',
        ]);
        $director->assignRole(UserRole::Director->value);

        $student = User::factory()->create([
            'school_id' => $school->id,
        ]);
        $student->assignRole(UserRole::Student->value);

        $this
            ->withToken($this->tokenFor($director->clerk_user_id))
            ->postJson("/api/students/{$student->id}/guardians", [
                'first_name' => 'Arta',
                'last_name' => 'Hoxha',
                'email' => 'arta@example.com',
                'relationship' => 'aunt',
            ])
            ->assertCreated()
            ->assertJson([
                'message' => 'Guardian linked.',
                'data' => [
                    'guardian' => [
                        'name' => 'Arta Hoxha',
                        'email' => 'arta@example.com',
                        'relationship' => 'aunt',
                        'is_primary' => false,
                        'emergency_contact_priority' => null,
                    ],
                ],
            ]);
    }

    public function test_teacher_cannot_create_or_link_guardian(): void
    {
        $school = $this->school();

        $teacher = User::factory()->create([
            'school_id' => $school->id,
            'clerk_user_id' => 'teacher_123',
        ]);
        $teacher->assignRole(UserRole::Teacher->value);

        $student = User::factory()->create([
            'school_id' => $school->id,
        ]);
        $student->assignRole(UserRole::Student->value);

        $this
            ->withToken($this->tokenFor($teacher->clerk_user_id))
            ->postJson("/api/students/{$student->id}/guardians", [
                'first_name' => 'Mira',
                'last_name' => 'Lovelace',
                'email' => 'mira@example.com',
                'relationship' => 'mother',
            ])
            ->assertForbidden();

        $this->assertDatabaseMissing('users', [
            'email' => 'mira@example.com',
        ]);
    }

    public function test_it_reuses_existing_parent_by_email(): void
    {
        $school = $this->school();

        $admin = User::factory()->create([
            'school_id' => $school->id,
            'clerk_user_id' => 'admin_123',
        ]);
        $admin->assignRole(UserRole::Admin->value);

        $student = User::factory()->create([
            'school_id' => $school->id,
        ]);
        $student->assignRole(UserRole::Student->value);

        $guardian = User::factory()->create([
            'school_id' => $school->id,
            'first_name' => 'Existing',
            'last_name' => 'Parent',
            'name' => 'Existing Parent',
            'email' => 'parent@example.com',
        ]);
        $guardian->assignRole(UserRole::Parent->value);

        $this
            ->withToken($this->tokenFor($admin->clerk_user_id))
            ->postJson("/api/students/{$student->id}/guardians", [
                'first_name' => 'Changed',
                'last_name' => 'Name',
                'email' => 'parent@example.com',
                'relationship' => 'father',
            ])
            ->assertCreated()
            ->assertJsonPath('data.guardian.id', $guardian->id);

        $this->assertDatabaseCount('users', 3);

        $this->assertDatabaseHas('guardian_student', [
            'guardian_user_id' => $guardian->id,
            'student_user_id' => $student->id,
            'relationship' => 'father',
        ]);
    }

    public function test_it_rejects_students_from_another_school(): void
    {
        $school = $this->school();

        $otherSchool = School::query()->create([
            'name' => 'Other School',
            'slug' => 'other-school',
            'timezone' => 'Europe/Tirane',
            'is_active' => true,
        ]);

        $admin = User::factory()->create([
            'school_id' => $school->id,
            'clerk_user_id' => 'admin_123',
        ]);
        $admin->assignRole(UserRole::Admin->value);

        $student = User::factory()->create([
            'school_id' => $otherSchool->id,
        ]);
        $student->assignRole(UserRole::Student->value);

        $this
            ->withToken($this->tokenFor($admin->clerk_user_id))
            ->postJson("/api/students/{$student->id}/guardians", [
                'first_name' => 'Mira',
                'last_name' => 'Lovelace',
                'email' => 'mira@example.com',
                'relationship' => 'mother',
            ])
            ->assertNotFound()
            ->assertJson([
                'message' => 'Student was not found for this school.',
            ]);

        $this->assertDatabaseMissing('users', [
            'email' => 'mira@example.com',
        ]);
    }

    public function test_it_does_not_duplicate_existing_guardian_student_link(): void
    {
        $school = $this->school();

        $admin = User::factory()->create([
            'school_id' => $school->id,
            'clerk_user_id' => 'admin_123',
        ]);
        $admin->assignRole(UserRole::Admin->value);

        $student = User::factory()->create([
            'school_id' => $school->id,
        ]);
        $student->assignRole(UserRole::Student->value);

        $guardian = User::factory()->create([
            'school_id' => $school->id,
            'email' => 'parent@example.com',
        ]);
        $guardian->assignRole(UserRole::Parent->value);

        $student->guardians()->attach($guardian->id, [
            'relationship' => 'mother',
            'is_primary' => false,
            'emergency_contact_priority' => null,
        ]);

        $this
            ->withToken($this->tokenFor($admin->clerk_user_id))
            ->postJson("/api/students/{$student->id}/guardians", [
                'first_name' => 'Mira',
                'last_name' => 'Lovelace',
                'email' => 'parent@example.com',
                'relationship' => 'mother',
                'is_primary' => true,
                'emergency_contact_priority' => 1,
            ])
            ->assertCreated();

        $this->assertDatabaseCount('guardian_student', 1);
    }

    public function test_it_validates_payload(): void
    {
        $school = $this->school();

        $admin = User::factory()->create([
            'school_id' => $school->id,
            'clerk_user_id' => 'admin_123',
        ]);
        $admin->assignRole(UserRole::Admin->value);

        $student = User::factory()->create([
            'school_id' => $school->id,
        ]);
        $student->assignRole(UserRole::Student->value);

        $this
            ->withToken($this->tokenFor($admin->clerk_user_id))
            ->postJson("/api/students/{$student->id}/guardians", [
                'first_name' => '',
                'last_name' => '',
                'email' => 'not-an-email',
                'relationship' => '',
                'emergency_contact_priority' => 99,
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'first_name',
                'last_name',
                'email',
                'relationship',
                'emergency_contact_priority',
            ]);
    }

    private function school(): School
    {
        return School::query()->create([
            'name' => 'SafeSchool Demo',
            'slug' => 'safe-school-demo',
            'timezone' => 'Europe/Tirane',
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