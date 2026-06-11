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

class UserRoleUpdateTest extends TestCase
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

    public function test_admin_can_update_user_roles_in_their_school(): void
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

        $user = User::factory()->create([
            'school_id' => $school->id,
            'name' => 'Grace Hopper',
            'email' => 'grace@example.com',
        ]);
        $user->assignRole(UserRole::Teacher->value);

        $this
            ->withToken($this->tokenFor($admin->clerk_user_id))
            ->putJson("/api/users/{$user->id}/roles", [
                'roles' => [UserRole::Director->value],
            ])
            ->assertOk()
            ->assertJson([
                'message' => 'User roles updated.',
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'name' => 'Grace Hopper',
                        'email' => 'grace@example.com',
                        'roles' => ['director'],
                    ],
                ],
            ]);

        $this->assertTrue($user->fresh()->hasRole(UserRole::Director->value));
        $this->assertFalse($user->fresh()->hasRole(UserRole::Teacher->value));
    }

    public function test_director_can_update_user_roles_in_their_school(): void
    {
        $school = School::query()->create([
            'name' => 'SafeSchool Demo',
            'slug' => 'safe-school-demo',
            'timezone' => 'Europe/Tirane',
            'is_active' => true,
        ]);

        $director = User::factory()->create([
            'school_id' => $school->id,
            'clerk_user_id' => 'director_123',
        ]);
        $director->assignRole(UserRole::Director->value);

        $user = User::factory()->create([
            'school_id' => $school->id,
            'name' => 'Parent User',
            'email' => 'parent@example.com',
        ]);
        $user->assignRole(UserRole::Parent->value);

        $this
            ->withToken($this->tokenFor($director->clerk_user_id))
            ->putJson("/api/users/{$user->id}/roles", [
                'roles' => [UserRole::Teacher->value],
            ])
            ->assertOk()
            ->assertJson([
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'roles' => ['teacher'],
                    ],
                ],
            ]);

        $this->assertTrue($user->fresh()->hasRole(UserRole::Teacher->value));
    }

    public function test_teacher_cannot_update_user_roles(): void
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

        $user = User::factory()->create([
            'school_id' => $school->id,
        ]);
        $user->assignRole(UserRole::Student->value);

        $this
            ->withToken($this->tokenFor($teacher->clerk_user_id))
            ->putJson("/api/users/{$user->id}/roles", [
                'roles' => [UserRole::Teacher->value],
            ])
            ->assertForbidden();

        $this->assertTrue($user->fresh()->hasRole(UserRole::Student->value));
    }

    public function test_it_rejects_updating_users_from_another_school(): void
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
        ]);
        $admin->assignRole(UserRole::Admin->value);

        $otherUser = User::factory()->create([
            'school_id' => $otherSchool->id,
        ]);
        $otherUser->assignRole(UserRole::Student->value);

        $this
            ->withToken($this->tokenFor($admin->clerk_user_id))
            ->putJson("/api/users/{$otherUser->id}/roles", [
                'roles' => [UserRole::Teacher->value],
            ])
            ->assertNotFound()
            ->assertJson([
                'message' => 'User was not found for this school.',
            ]);

        $this->assertTrue($otherUser->fresh()->hasRole(UserRole::Student->value));
    }

    public function test_it_validates_roles_payload(): void
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

        $user = User::factory()->create([
            'school_id' => $school->id,
        ]);
        $user->assignRole(UserRole::Student->value);

        $this
            ->withToken($this->tokenFor($admin->clerk_user_id))
            ->putJson("/api/users/{$user->id}/roles", [
                'roles' => ['super-admin'],
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['roles.0']);

        $this->assertTrue($user->fresh()->hasRole(UserRole::Student->value));
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
