<?php

use App\Http\Controllers\Api\ClerkWebhookController;
use Illuminate\Support\Facades\Route;

Route::post('/webhooks/clerk', ClerkWebhookController::class);