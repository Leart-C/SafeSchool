<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Clerk\SyncClerkUserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
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

        // Temporary simple shared-secret check.
        // We will replace this with Clerk/Svix signature verification once real webhook values are available.
        if ($request->header('X-SafeSchool-Clerk-Webhook-Secret') !== $webhookSecret) {
            return response()->json([
                'message' => 'Invalid webhook signature.',
            ], Response::HTTP_UNAUTHORIZED);
        }

        $eventType = $request->string('type')->toString();
        $data = $request->array('data');

        if (in_array($eventType, ['user.created', 'user.updated'], true)) {
            $syncClerkUser->sync($data);
        }

        return response()->json([
            'message' => 'Webhook processed.',
        ]);
    }
}