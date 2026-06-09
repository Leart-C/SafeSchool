<?php

use App\Http\Controllers\Api\ClassController;
use App\Http\Controllers\Api\ClerkWebhookController;
use App\Http\Controllers\Api\MeController;
use Illuminate\Support\Facades\Route;

Route::post('/webhooks/clerk', ClerkWebhookController::class);

Route::middleware('clerk.auth')->group(function (): void {
    Route::get('/me', MeController::class);
    Route::get('/classes', [ClassController::class, 'index']);
    Route::post('/classes', [ClassController::class, 'store']);
});
