<?php

return [
    'secret_key' => env('CLERK_SECRET_KEY'),
    'publishable_key' => env('CLERK_PUBLISHABLE_KEY'),
    'webhook_secret' => env('CLERK_WEBHOOK_SECRET'),
    'jwt_issuer' => env('CLERK_JWT_ISSUER'),
    'jwt_audience' => env('CLERK_JWT_AUDIENCE'),
];