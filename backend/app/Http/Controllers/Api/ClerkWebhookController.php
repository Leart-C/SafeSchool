<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Clerk\SyncClerkUserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Svix\Exception\WebhookVerificationException;
use Svix\Webhook;
use Symfony\Component\HttpFoundation\Response;

class ClerkWebhookController extends Controller
{
    public function __invoke(Request $request, SyncClerkUserService $syncClerkUser): JsonResponse
    {
        $webhookSecret = config('clerk.webhook_secret');

        if (! $webhookSecret) {
            return response()->json([
                'message' => 'Clerk webhook secret is not configured.',
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
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
            return response()->json([
                'message' => 'Invalid webhook signature.',
            ], Response::HTTP_UNAUTHORIZED);
        }

        $eventType = $event['type'] ?? null;
        $data = $event['data'] ?? [];

        if (in_array($eventType, ['user.created', 'user.updated'], true)) {
            $syncClerkUser->sync($data);
        }

        return response()->json([
            'message' => 'Webhook processed.',
        ]);
    }
}