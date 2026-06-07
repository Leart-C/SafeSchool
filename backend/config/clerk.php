<?php

return [
    'secret_key' => env('CLERK_SECRET_KEY'),
    'publishable_key' => env('CLERK_PUBLISHABLE_KEY'),
    'webhook_secret' => env('CLERK_WEBHOOK_SECRET'),
    'jwt_key' => env('CLERK_JWT_KEY'),
    'jwt_issuer' => env('CLERK_JWT_ISSUER'),
    'jwt_audience' => env('CLERK_JWT_AUDIENCE'),
    'jwt_authorized_parties' => array_values(array_filter(array_map(
        'trim',
        explode(',', env('CLERK_JWT_AUTHORIZED_PARTIES', ''))
    ))),
];
