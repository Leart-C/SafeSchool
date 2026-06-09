<?php

namespace App\Services\Clerk;

use Symfony\Component\HttpFoundation\Response;

class ClerkWebhookResult
{
    private function __construct(
        public readonly string $message,
        public readonly int $status
    ) {}

    public static function processed(): self
    {
        return new self('Webhook processed.', Response::HTTP_OK);
    }

    public static function notConfigured(): self
    {
        return new self(
            'Clerk webhook secret is not configured.',
            Response::HTTP_INTERNAL_SERVER_ERROR,
        );
    }

    public static function invalidSignature(): self
    {
        return new self(
            'Invalid webhook signature.',
            Response::HTTP_UNAUTHORIZED,
        );
    }
}