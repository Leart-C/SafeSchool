<?php

use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\ClassController;
use App\Http\Controllers\Api\ClerkWebhookController;
use App\Http\Controllers\Api\MeController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\StudentController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

Route::post('/webhooks/clerk', ClerkWebhookController::class);

Route::middleware('clerk.auth')->group(function (): void {
    Route::get('/me', MeController::class);
    Route::get('/classes', [ClassController::class, 'index']);
    Route::post('/classes', [ClassController::class, 'store']);
    Route::put('/classes/{class}', [ClassController::class, 'update']);

    Route::get('/students', [StudentController::class, 'index']);
    Route::get('/students/{student}', [StudentController::class, 'show']);

    Route::get('/attendance', [AttendanceController::class, 'index']);
    Route::get('/classes/{class}/attendance-roster', [AttendanceController::class, 'roster']);
    Route::post('/classes/{class}/attendance-records', [AttendanceController::class, 'storeClassAttendance']);

    Route::get('/messages', [MessageController::class, 'index']);
    Route::post('/messages', [MessageController::class, 'store']);
    Route::put('/messages/{message}', [MessageController::class, 'update']);
    Route::post('/messages/{message}/archive', [MessageController::class, 'archive']);

    Route::get('/users', [UserController::class, 'index']);
    Route::put('/users/{user}/roles', [UserController::class, 'updateRoles']);
});
