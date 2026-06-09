<?php

namespace App\Http\Controllers\Api;

use App\Services\Clerk\ProcessClerkWebhookService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClerkWebhookController extends ApiController
{
    public function __invoke(
        Request $request,
        ProcessClerkWebhookService $processClerkWebhook
    ): JsonResponse {
        $result = $processClerkWebhook->process($request);

        return response()->json([
            'message' => $result->message,
        ], $result->status);
    }
}