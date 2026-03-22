<?php

use App\Http\Controllers\Api\V1\AppController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\PassportController;
use App\Http\Controllers\Api\V1\PositionController;
use App\Http\Controllers\Api\V1\ReportController;
use App\Http\Controllers\Api\V1\SearchController;
use App\Http\Controllers\Api\V1\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — /api/v1
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {

    // Public (no auth)
    Route::get('/health', [AppController::class, 'health']);
    Route::get('/app/version', [AppController::class, 'version']);

    // Auth (rate limited 5/min per IP)
    Route::prefix('auth')->middleware('throttle:5,1')->group(function () {
        Route::post('/social', [AuthController::class, 'social']);
        Route::post('/email-otp', [AuthController::class, 'sendOtp']);
        Route::post('/email-otp/verify', [AuthController::class, 'verifyOtp']);
        Route::post('/magic-link', [AuthController::class, 'sendMagicLink']);
        Route::post('/magic-link/verify', [AuthController::class, 'verifyMagicLink']);
        Route::get('/check-username', [AuthController::class, 'checkUsername'])
            ->middleware('throttle:30,1');
    });

    Route::get('/auth/me', [AuthController::class, 'me'])
        ->middleware('auth:sanctum');

    // Authenticated routes
    Route::middleware('auth:sanctum')->group(function () {

        // Users
        Route::patch('/users/me', [UserController::class, 'update']);
        Route::put('/users/me/settings', [UserController::class, 'updateSettings']);
        Route::delete('/users/me', [UserController::class, 'destroy']);
        Route::post('/users/me/export', [UserController::class, 'export'])
            ->middleware('throttle:1,1440');
        Route::get('/users/{id}/profile', [UserController::class, 'show']);
        Route::post('/users/{id}/block', [UserController::class, 'block']);
        Route::delete('/users/{id}/block', [UserController::class, 'unblock']);

        // Positions
        Route::post('/positions', [PositionController::class, 'store']);
        Route::get('/positions/me', [PositionController::class, 'index']);
        Route::get('/clusters', [PositionController::class, 'clusters'])
            ->middleware('throttle:60,1');

        // World Passport
        Route::get('/passport', [PassportController::class, 'index']);
        Route::get('/passport/compare/{user}', [PassportController::class, 'compare'])
            ->middleware('throttle:60,1');

        // Reports
        Route::post('/reports', [ReportController::class, 'store'])
            ->middleware('throttle:10,1440');

        // Search
        Route::get('/search', [SearchController::class, 'index'])
            ->middleware('throttle:30,1');
    });
});
