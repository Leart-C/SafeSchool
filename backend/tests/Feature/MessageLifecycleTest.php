<?php

namespace Tests\Feature;

use App\Enums\MessageAudience;
use App\Models\Message;
use App\Models\School;
use App\Models\SchoolClass;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Firebase\JWT\JWT;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MessageLifecycleTest extends TestCase
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

    public function test_admin_can_update_message(): void
    {
        [$school, $admin, $message] = $this->schoolAdminAndMessage();

        $this
            ->withToken($this->tokenFor($admin->clerk_user_id))
            ->putJson("/api/messages/{$message->id}", [
                'audience' => MessageAudience::Parents->value,
                'title' => 'Updated announcement',
                'body' => 'Updated body.',
                'publish_now' => true,
            ])
            ->assertOk()
            ->assertJson([
                'message' => 'Message updated.',
                'data' => [
                    'message' => [
                        'id' => $message->id,
                        'audience' => 'parents',
                        'title' => 'Updated announcement',
                        'body' => 'Updated body.',
                    ],
                ],
            ]);

        $this->assertDatabaseHas('messages', [
            'id' => $message->id,
            'school_id' => $school->id,
            'audience' => 'parents',
            'title' => 'Updated announcement',
            'body' => 'Updated body.',
        ]);

        $this->assertNotNull($message->fresh()->edited_at);
    }

    public function test_admin_can_archive_message_without_deleting_it(): void
    {
        [, $admin, $message] = $this->schoolAdminAndMessage();

        $this
            ->withToken($this->tokenFor($admin->clerk_user_id))
            ->postJson("/api/messages/{$message->id}/archive")
            ->assertOk()
            ->assertJson([
                'message' => 'Message archived.',
            ]);

        $this->assertDatabaseHas('messages', [
            'id' => $message->id,
            'title' => 'Original announcement',
        ]);

        $this->assertNotNull($message->fresh()->archived_at);
    }

    public function test_archived_messages_do_not_appear_in_message_list(): void
    {
        [, $admin, $message] = $this->schoolAdminAndMessage();

        $message->update([
            'archived_at' => now(),
        ]);

        $this
            ->withToken($this->tokenFor($admin->clerk_user_id))
            ->getJson('/api/messages')
            ->assertOk()
            ->assertJson([
                'message' => 'Messages retrieved.',
                'data' => [
                    'messages' => [],
                ],
            ]);
    }

    public function test_parent_cannot_update_message(): void
    {
        [$school, , $message] = $this->schoolAdminAndMessage();

        $parent = User::factory()->create([
            'school_id' => $school->id,
            'clerk_user_id' => 'user_parent',
        ]);
        $parent->assignRole('parent');

        $this
            ->withToken($this->tokenFor($parent->clerk_user_id))
            ->putJson("/api/messages/{$message->id}", [
                'audience' => MessageAudience::School->value,
                'title' => 'Not allowed',
                'body' => 'This should fail.',
                'publish_now' => true,
            ])
            ->assertForbidden()
            ->assertJson([
                'message' => 'You are not allowed to update messages.',
            ]);
    }

    public function test_user_cannot_update_message_from_another_school(): void
    {
        [, $admin, $message] = $this->schoolAdminAndMessage();

        $otherSchool = School::query()->create([
            'name' => 'Other School',
            'slug' => 'other-school',
            'timezone' => 'Europe/Tirane',
            'is_active' => true,
        ]);

        $admin->update([
            'school_id' => $otherSchool->id,
        ]);

        $this
            ->withToken($this->tokenFor($admin->clerk_user_id))
            ->putJson("/api/messages/{$message->id}", [
                'audience' => MessageAudience::School->value,
                'title' => 'Not found',
                'body' => 'This should not be allowed.',
                'publish_now' => true,
            ])
            ->assertNotFound()
            ->assertJson([
                'message' => 'Message was not found for this school.',
            ]);
    }

    public function test_class_message_update_requires_class_from_same_school(): void
    {
        [$school, $admin, $message] = $this->schoolAdminAndMessage();

        $otherSchool = School::query()->create([
            'name' => 'Other School',
            'slug' => 'other-school',
            'timezone' => 'Europe/Tirane',
            'is_active' => true,
        ]);

        $otherClass = SchoolClass::query()->create([
            'school_id' => $otherSchool->id,
            'name' => 'Hidden Class',
            'grade_level' => '6',
            'section' => 'B',
            'academic_year' => '2026-2027',
            'is_active' => true,
        ]);

        $this
            ->withToken($this->tokenFor($admin->clerk_user_id))
            ->putJson("/api/messages/{$message->id}", [
                'audience' => MessageAudience::ClassAudience->value,
                'school_class_id' => $otherClass->id,
                'title' => 'Class update',
                'body' => 'Should not be allowed.',
                'publish_now' => true,
            ])
            ->assertNotFound()
            ->assertJson([
                'message' => 'Class was not found for this school.',
            ]);
    }

    /**
     * @return array{0: School, 1: User, 2: Message}
     */
    private function schoolAdminAndMessage(): array
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
        ]);
        $admin->assignRole('admin');

        $message = Message::query()->create([
            'school_id' => $school->id,
            'sender_user_id' => $admin->id,
            'audience' => MessageAudience::School->value,
            'title' => 'Original announcement',
            'body' => 'Original body.',
            'published_at' => now(),
        ]);

        return [$school, $admin, $message];
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
