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

class StudentGuardianLifecycleTest extends TestCase
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

        Role::findOrCreate(UserRole::Admin->value)->givePermissionTo(['guardians.manage']);
        Role::findOrCreate(UserRole::Director->value)->givePermissionTo(['guardians.manage']);
        Role::findOrCreate(UserRole::Teacher->value);
        Role::findOrCreate(UserRole::Parent->value);
        Role::findOrCreate(UserRole::Student->value);
    }

    public function test_admin_can_update_student_guardian(): void
    {
        [$school, $admin, $student, $guardian] = $this->linkedGuardianFixture(UserRole::Admin);

        $this
            ->withToken($this->tokenFor($admin->clerk_user_id))
            ->putJson("/api/students/{$student->id}/guardians/{$guardian->id}", [
                'first_name' => 'Mira',
                'last_name' => 'Lovelace',
                'email' => 'mira.updated@example.com',
                'phone' => '+355690000000',
                'relationship' => 'mother',
                'is_primary' => true,
                'emergency_contact_priority' => 1,
            ])
            ->assertOk()
            ->assertJson([
                'message' => 'Guardian updated.',
                'data' => [
                    'guardian' => [
                        'id' => $guardian->id,
                        'name' => 'Mira Lovelace',
                        'email' => 'mira.updated@example.com',
                        'phone' => '+355690000000',
                        'relationship' => 'mother',
                        'is_primary' => true,
                        'emergency_contact_priority' => 1,
                    ],
                ],
            ]);

        $this->assertDatabaseHas('users', [
            'id' => $guardian->id,
            'name' => 'Mira Lovelace',
            'email' => 'mira.updated@example.com',
            'phone' => '+355690000000',
            'school_id' => $school->id,
        ]);

        $this->assertDatabaseHas('guardian_student', [
            'guardian_user_id' => $guardian->id,
            'student_user_id' => $student->id,
            'relationship' => 'mother',
            'is_primary' => true,
            'emergency_contact_priority' => 1,
        ]);
    }

    public function test_director_can_update_student_guardian(): void
    {
        [, $director, $student, $guardian] = $this->linkedGuardianFixture(UserRole::Director);

        $this
            ->withToken($this->tokenFor($director->clerk_user_id))
            ->putJson("/api/students/{$student->id}/guardians/{$guardian->id}", [
                'first_name' => 'Arta',
                'last_name' => 'Hoxha',
                'email' => 'arta@example.com',
                'phone' => null,
                'relationship' => 'aunt',
                'is_primary' => false,
                'emergency_contact_priority' => null,
            ])
            ->assertOk()
            ->assertJsonPath('data.guardian.relationship', 'aunt');
    }

    public function test_teacher_cannot_update_student_guardian(): void
    {
        [$school, , $student, $guardian] = $this->linkedGuardianFixture(UserRole::Admin);

        $teacher = User::factory()->create([
            'school_id' => $school->id,
            'clerk_user_id' => 'teacher_123',
        ]);
        $teacher->assignRole(UserRole::Teacher->value);

        $this
            ->withToken($this->tokenFor($teacher->clerk_user_id))
            ->putJson("/api/students/{$student->id}/guardians/{$guardian->id}", [
                'first_name' => 'Mira',
                'last_name' => 'Lovelace',
                'email' => 'mira@example.com',
                'relationship' => 'mother',
            ])
            ->assertForbidden();
    }

    public function test_admin_can_unlink_guardian_without_deleting_user(): void
    {
        [, $admin, $student, $guardian] = $this->linkedGuardianFixture(UserRole::Admin);

        $this
            ->withToken($this->tokenFor($admin->clerk_user_id))
            ->deleteJson("/api/students/{$student->id}/guardians/{$guardian->id}")
            ->assertOk()
            ->assertJson([
                'message' => 'Guardian unlinked.',
            ]);

        $this->assertDatabaseHas('users', [
            'id' => $guardian->id,
            'email' => $guardian->email,
        ]);

        $this->assertDatabaseMissing('guardian_student', [
            'guardian_user_id' => $guardian->id,
            'student_user_id' => $student->id,
        ]);
    }

    public function test_it_rejects_guardian_links_from_another_school(): void
    {
        [, $admin, $student] = $this->linkedGuardianFixture(UserRole::Admin);

        $otherSchool = School::query()->create([
            'name' => 'Other School',
            'slug' => 'other-school',
            'timezone' => 'Europe/Tirane',
            'is_active' => true,
        ]);

        $otherGuardian = User::factory()->create([
            'school_id' => $otherSchool->id,
            'email' => 'other.parent@example.com',
        ]);
        $otherGuardian->assignRole(UserRole::Parent->value);

        $this
            ->withToken($this->tokenFor($admin->clerk_user_id))
            ->putJson("/api/students/{$student->id}/guardians/{$otherGuardian->id}", [
                'first_name' => 'Other',
                'last_name' => 'Parent',
                'email' => 'other.parent@example.com',
                'relationship' => 'mother',
            ])
            ->assertNotFound()
            ->assertJson([
                'message' => 'Guardian link was not found for this school.',
            ]);
    }

    public function test_it_validates_update_payload(): void
    {
        [, $admin, $student, $guardian] = $this->linkedGuardianFixture(UserRole::Admin);

        $this
            ->withToken($this->tokenFor($admin->clerk_user_id))
            ->putJson("/api/students/{$student->id}/guardians/{$guardian->id}", [
                'first_name' => '',
                'last_name' => '',
                'email' => 'not-an-email',
                'phone' => str_repeat('1', 51),
                'relationship' => '',
                'emergency_contact_priority' => 99,
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'first_name',
                'last_name',
                'email',
                'phone',
                'relationship',
                'emergency_contact_priority',
            ]);
    }

    private function linkedGuardianFixture(UserRole $actorRole): array
    {
        $school = School::query()->create([
            'name' => 'SafeSchool Demo',
            'slug' => 'safe-school-demo',
            'timezone' => 'Europe/Tirane',
            'is_active' => true,
        ]);

        $actor = User::factory()->create([
            'school_id' => $school->id,
            'clerk_user_id' => strtolower($actorRole->value).'_123',
        ]);
        $actor->assignRole($actorRole->value);

        $student = User::factory()->create([
            'school_id' => $school->id,
            'email' => 'student@example.com',
        ]);
        $student->assignRole(UserRole::Student->value);

        $guardian = User::factory()->create([
            'school_id' => $school->id,
            'first_name' => 'Parent',
            'last_name' => 'User',
            'name' => 'Parent User',
            'email' => 'parent@example.com',
        ]);
        $guardian->assignRole(UserRole::Parent->value);

        $student->guardians()->attach($guardian->id, [
            'relationship' => 'parent',
            'is_primary' => false,
            'emergency_contact_priority' => null,
        ]);

        return [$school, $actor, $student, $guardian];
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