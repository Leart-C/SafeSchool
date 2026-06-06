<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ClerkWebhookTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_rejects_webhooks_with_invalid_secret(): void
    {
        config(['clerk.webhook_secret' => 'test-secret']);

        $this->postJson('/api/webhooks/clerk', [])
            ->assertUnauthorized();
    }

    public function test_it_syncs_clerk_user_created_event(): void
    {
        config(['clerk.webhook_secret' => 'test-secret']);

        $this
            ->withHeader('X-SafeSchool-Clerk-Webhook-Secret', 'test-secret')
            ->postJson('/api/webhooks/clerk', [
                'type' => 'user.created',
                'data' => [
                    'id' => 'user_123',
                    'first_name' => 'Ada',
                    'last_name' => 'Lovelace',
                    'primary_email_address_id' => 'email_123',
                    'email_addresses' => [
                        [
                            'id' => 'email_123',
                            'email_address' => 'ada@example.com',
                        ],
                    ],
                    'image_url' => 'https://example.com/avatar.png',
                ],
            ])
            ->assertOk()
            ->assertJson([
                'message' => 'Webhook processed.',
            ]);

        $this->assertDatabaseHas('users', [
            'clerk_user_id' => 'user_123',
            'name' => 'Ada Lovelace',
            'first_name' => 'Ada',
            'last_name' => 'Lovelace',
            'email' => 'ada@example.com',
            'avatar_url' => 'https://example.com/avatar.png',
        ]);
    }

    public function test_it_updates_existing_clerk_user(): void
    {
        config(['clerk.webhook_secret' => 'test-secret']);

        User::factory()->create([
            'clerk_user_id' => 'user_123',
            'email' => 'old@example.com',
        ]);

        $this
            ->withHeader('X-SafeSchool-Clerk-Webhook-Secret', 'test-secret')
            ->postJson('/api/webhooks/clerk', [
                'type' => 'user.updated',
                'data' => [
                    'id' => 'user_123',
                    'first_name' => 'Grace',
                    'last_name' => 'Hopper',
                    'primary_email_address_id' => 'email_456',
                    'email_addresses' => [
                        [
                            'id' => 'email_456',
                            'email_address' => 'grace@example.com',
                        ],
                    ],
                    'image_url' => null,
                ],
            ])
            ->assertOk();

        $this->assertDatabaseHas('users', [
            'clerk_user_id' => 'user_123',
            'name' => 'Grace Hopper',
            'email' => 'grace@example.com',
        ]);
    }
}