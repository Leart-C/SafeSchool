<?php

namespace Tests\Feature;

use App\Enums\MessageAudience;
use App\Models\School;
use App\Models\SchoolClass;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Firebase\JWT\JWT;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MessageStoreTest extends TestCase
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

        $this->seed(RoleSeeder::class);
    }

    public function test_admin_can_create_school_message(): void
    {
        $school = School::query()->create([
            'name' => 'SafeSchool Demo',
            'slug' => 'safe-school-demo',
            'timezone' => 'Europe/Tirane',
            'is_active' => true,
        ]);

        $admin = User::factory()->create([
            'school_id' => $school->id,
            'clerk_user_id' => 'user_admin',
            'name' => 'Admin User',
            'email' => 'admin@example.com',
        ]);
        $admin->assignRole('admin');

        $this
            ->withToken($this->tokenFor($admin->clerk_user_id))
            ->postJson('/api/messages', [
                'audience' => MessageAudience::School->value,
                'title' => 'Welcome back',
                'body' => 'School starts Monday.',
                'publish_now' => true,
            ])
            ->assertCreated()
            ->assertJson([
                'message' => 'Message created.',
                'data' => [
                    'message' => [
                        'audience' => 'school',
                        'title' => 'Welcome back',
                        'body' => 'School starts Monday.',
                        'sender' => [
                            'id' => $admin->id,
                            'name' => 'Admin User',
                            'email' => 'admin@example.com',
                        ],
                    ],
                ],
            ]);

        $this->assertDatabaseHas('messages', [
            'school_id' => $school->id,
            'sender_user_id' => $admin->id,
            'audience' => 'school',
            'title' => 'Welcome back',
            'body' => 'School starts Monday.',
        ]);
    }

    public function test_teacher_can_create_class_message_for_school_class(): void
    {
        $school = School::query()->create([
            'name' => 'SafeSchool Demo',
            'slug' => 'safe-school-demo',
            'timezone' => 'Europe/Tirane',
            'is_active' => true,
        ]);

        $teacher = User::factory()->create([
            'school_id' => $school->id,
            'clerk_user_id' => 'user_teacher',
        ]);
        $teacher->assignRole('teacher');

        $class = SchoolClass::query()->create([
            'school_id' => $school->id,
            'name' => 'Grade 5A',
            'grade_level' => '5',
            'section' => 'A',
            'academic_year' => '2026-2027',
            'is_active' => true,
        ]);

        $this
            ->withToken($this->tokenFor($teacher->clerk_user_id))
            ->postJson('/api/messages', [
                'audience' => MessageAudience::ClassAudience->value,
                'school_class_id' => $class->id,
                'title' => 'Math reminder',
                'body' => 'Bring your workbook tomorrow.',
                'publish_now' => true,
            ])
            ->assertCreated()
            ->assertJson([
                'message' => 'Message created.',
                'data' => [
                    'message' => [
                        'audience' => 'class',
                        'title' => 'Math reminder',
                        'class' => [
                            'id' => $class->id,
                            'name' => 'Grade 5A',
                        ],
                    ],
                ],
            ]);
    }

    public function test_parent_cannot_create_messages(): void
    {
        $school = School::query()->create([
            'name' => 'SafeSchool Demo',
            'slug' => 'safe-school-demo',
            'timezone' => 'Europe/Tirane',
            'is_active' => true,
        ]);

        $parent = User::factory()->create([
            'school_id' => $school->id,
            'clerk_user_id' => 'user_parent',
        ]);
        $parent->assignRole('parent');

        $this
            ->withToken($this->tokenFor($parent->clerk_user_id))
            ->postJson('/api/messages', [
                'audience' => MessageAudience::School->value,
                'title' => 'Not allowed',
                'body' => 'Parents cannot send school announcements.',
            ])
            ->assertForbidden()
            ->assertJson([
                'message' => 'You are not allowed to create messages.',
            ]);
    }

    public function test_it_rejects_class_messages_for_classes_from_another_school(): void
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
            'clerk_user_id' => 'user_admin',
        ]);
        $admin->assignRole('admin');

        $class = SchoolClass::query()->create([
            'school_id' => $otherSchool->id,
            'name' => 'Hidden Class',
            'grade_level' => '6',
            'section' => 'B',
            'academic_year' => '2026-2027',
            'is_active' => true,
        ]);

        $this
            ->withToken($this->tokenFor($admin->clerk_user_id))
            ->postJson('/api/messages', [
                'audience' => MessageAudience::ClassAudience->value,
                'school_class_id' => $class->id,
                'title' => 'Hidden class',
                'body' => 'Should not be allowed.',
            ])
            ->assertNotFound()
            ->assertJson([
                'message' => 'Class was not found for this school.',
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

        $admin = User::factory()->create([
            'school_id' => $school->id,
            'clerk_user_id' => 'user_admin',
        ]);
        $admin->assignRole('admin');

        $this
            ->withToken($this->tokenFor($admin->clerk_user_id))
            ->postJson('/api/messages', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'audience',
                'title',
                'body',
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
