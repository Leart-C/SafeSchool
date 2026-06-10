<?php

namespace App\Services\Clerk;

use Illuminate\Http\Request;
use Svix\Exception\WebhookVerificationException;
use Svix\Webhook;

class ProcessClerkWebhookService
{
    public function __construct(
        private readonly SyncClerkUserService $syncClerkUser
    ) {}

    public function process(Request $request): ClerkWebhookResult
    {
        $webhookSecret = config('clerk.webhook_secret');

        if (! $webhookSecret) {
            return ClerkWebhookResult::notConfigured();
        }

        try {
            $webhook = new Webhook($webhookSecret);

            $event = $webhook->verify(
                $request->getContent(),
                collect($request->headers->all())
                    ->map(fn (array $values): string => $values[0])
                    ->all()
            );
        } catch (WebhookVerificationException) {
            return ClerkWebhookResult::invalidSignature();
        }

        $eventType = $event['type'] ?? null;
        $data = $event['data'] ?? [];

        if (in_array($eventType, ['user.created', 'user.updated'], true)) {
            $this->syncClerkUser->sync($data);
        }

        return ClerkWebhookResult::processed();
    }
}
