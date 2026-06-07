<?php

namespace App\Http\Middleware;

use App\Models\User;
use Clerk\Backend\Helpers\Jwks\AuthenticateRequest;
use Clerk\Backend\Helpers\Jwks\AuthenticateRequestException;
use Clerk\Backend\Helpers\Jwks\AuthenticateRequestOptions;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateClerkJwt
{
    public function handle(Request $request, Closure $next): Response
    {
        $secretKey = config('clerk.secret_key');
        $jwtKey = config('clerk.jwt_key');
        $audience = config('clerk.jwt_audience');
        $authorizedParties = config('clerk.jwt_authorized_parties');

        if (! $secretKey && ! $jwtKey) {
            return response()->json([
                'message' => 'Clerk JWT verification is not configured.',
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        try {
            $state = AuthenticateRequest::authenticateRequest(
                $request,
                new AuthenticateRequestOptions(
                    secretKey: $secretKey,
                    jwtKey: $jwtKey,
                    audiences: $audience ? [$audience] : null,
                    authorizedParties: $authorizedParties ?: null,
                    acceptsToken: ['session_token'],
                ),
            );
        } catch (AuthenticateRequestException) {
            return response()->json([
                'message' => 'Invalid authentication token.',
            ], Response::HTTP_UNAUTHORIZED);
        }

        if (! $state->isAuthenticated()) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], Response::HTTP_UNAUTHORIZED);
        }

        $claims = $state->getPayload();
        $clerkUserId = $claims?->sub ?? null;

        if (! $clerkUserId) {
            return response()->json([
                'message' => 'Authentication token is missing a user subject.',
            ], Response::HTTP_UNAUTHORIZED);
        }

        $user = User::query()
            ->where('clerk_user_id', $clerkUserId)
            ->first();

        if (! $user) {
            return response()->json([
                'message' => 'Authenticated Clerk user is not synced locally.',
            ], Response::HTTP_UNAUTHORIZED);
        }

        $request->setUserResolver(fn () => $user);
        $request->attributes->set('clerk_claims', $claims);

        return $next($request);
    }
}
