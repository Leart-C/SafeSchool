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
        config(['clerk.webhook_secret' => $this->webhookSecret()]);

        $this->postJson('/api/webhooks/clerk', [])
            ->assertUnauthorized();
    }

    public function test_it_syncs_clerk_user_created_event(): void
    {
        $secret = $this->webhookSecret();
        config(['clerk.webhook_secret' => $secret]);

        $payload = $this->payload([
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
        ]);

        $this
            ->call(
                'POST',
                '/api/webhooks/clerk',
                [],
                [],
                [],
                $this->signedWebhookHeaders($payload, $secret),
                $payload,
            )
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
        $secret = $this->webhookSecret();
        config(['clerk.webhook_secret' => $secret]);

        User::factory()->create([
            'clerk_user_id' => 'user_123',
            'email' => 'old@example.com',
        ]);

        $payload = $this->payload([
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
        ]);

        $this
            ->call(
                'POST',
                '/api/webhooks/clerk',
                [],
                [],
                [],
                $this->signedWebhookHeaders($payload, $secret),
                $payload,
            )
            ->assertOk();

        $this->assertDatabaseHas('users', [
            'clerk_user_id' => 'user_123',
            'name' => 'Grace Hopper',
            'email' => 'grace@example.com',
        ]);
    }

    private function webhookSecret(): string
    {
        return 'whsec_'.base64_encode('test-secret-value');
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function payload(array $data): string
    {
        return json_encode($data, JSON_THROW_ON_ERROR);
    }

    private function signedWebhookHeaders(string $payload, string $secret): array
    {
        $id = 'msg_test_123';
        $timestamp = (string) time();
        $secretBytes = base64_decode(substr($secret, strlen('whsec_')), true);

        $signature = base64_encode(hash_hmac(
            'sha256',
            "{$id}.{$timestamp}.{$payload}",
            $secretBytes,
            true
        ));

        return [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_SVIX_ID' => $id,
            'HTTP_SVIX_TIMESTAMP' => $timestamp,
            'HTTP_SVIX_SIGNATURE' => "v1,{$signature}",
        ];
    }
}
