<?php

use App\Http\Controllers\Api\ClerkWebhookController;
use App\Http\Controllers\Api\MeController;
use Illuminate\Support\Facades\Route;

Route::post('/webhooks/clerk', ClerkWebhookController::class);

Route::middleware('clerk.auth')->get('/me', MeController::class);
