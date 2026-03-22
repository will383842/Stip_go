<?php

use App\Http\Controllers\Api\V1\AppController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\DmController;
use App\Http\Controllers\Api\V1\ExplorationController;
use App\Http\Controllers\Api\V1\FeedController;
use App\Http\Controllers\Api\V1\FlashController;
use App\Http\Controllers\Api\V1\FriendshipController;
use App\Http\Controllers\Api\V1\NotificationController;
use App\Http\Controllers\Api\V1\PassportController;
use App\Http\Controllers\Api\V1\PepiteController;
use App\Http\Controllers\Api\V1\PositionController;
use App\Http\Controllers\Api\V1\ReportController;
use App\Http\Controllers\Api\V1\SearchController;
use App\Http\Controllers\Api\V1\ShoutController;
use App\Http\Controllers\Api\V1\SquadController;
use App\Http\Controllers\Api\V1\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — /api/v1
| C2 fix: UUID constraints on all {id}/{user}/{notification} params
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
        Route::get('/users/{id}/profile', [UserController::class, 'show'])
            ->where('id', '[0-9a-f\-]{36}');
        Route::post('/users/{id}/block', [UserController::class, 'block'])
            ->where('id', '[0-9a-f\-]{36}');
        Route::delete('/users/{id}/block', [UserController::class, 'unblock'])
            ->where('id', '[0-9a-f\-]{36}');

        // Positions
        Route::post('/positions', [PositionController::class, 'store']);
        Route::get('/positions/me', [PositionController::class, 'index']);
        Route::get('/clusters', [PositionController::class, 'clusters'])
            ->middleware('throttle:60,1');

        // World Passport
        Route::get('/passport', [PassportController::class, 'index']);
        Route::post('/passport/declare', [PassportController::class, 'declare'])
            ->middleware('throttle:10,1');
        Route::get('/passport/compare/{user}', [PassportController::class, 'compare'])
            ->where('user', '[0-9a-f\-]{36}')
            ->middleware('throttle:60,1');

        // Reports
        Route::post('/reports', [ReportController::class, 'store'])
            ->middleware('throttle:10,1440');

        // Notifications
        Route::get('/notifications', [NotificationController::class, 'index']);
        Route::patch('/notifications/{notification}/read', [NotificationController::class, 'markRead'])
            ->where('notification', '[0-9a-f\-]{36}');

        // Search
        Route::get('/search', [SearchController::class, 'index'])
            ->middleware('throttle:30,1');

        // --- Sprint 3-4: Social ---

        // Friendships
        Route::prefix('friends')->group(function () {
            Route::get('/', [FriendshipController::class, 'index']);
            Route::get('/requests', [FriendshipController::class, 'requests']);
            Route::post('/{id}/request', [FriendshipController::class, 'sendRequest'])
                ->where('id', '[0-9a-f\-]{36}');
            Route::post('/{id}/accept', [FriendshipController::class, 'accept'])
                ->where('id', '[0-9a-f\-]{36}');
            Route::delete('/{id}', [FriendshipController::class, 'destroy'])
                ->where('id', '[0-9a-f\-]{36}');
        });

        // DM
        Route::prefix('dm')->group(function () {
            Route::get('/', [DmController::class, 'conversations']);
            Route::post('/', [DmController::class, 'send'])
                ->middleware('throttle:60,1');
            Route::get('/{conversation_id}', [DmController::class, 'messages'])
                ->where('conversation_id', '[0-9a-f\-]{36}');
            Route::post('/{conversation_id}/react', [DmController::class, 'react'])
                ->where('conversation_id', '[0-9a-f\-]{36}');
            Route::post('/{conversation_id}/read', [DmController::class, 'markRead'])
                ->where('conversation_id', '[0-9a-f\-]{36}');
        });

        // Shouts
        Route::prefix('shouts')->group(function () {
            Route::post('/', [ShoutController::class, 'store'])
                ->middleware('throttle:10,1440');
            Route::get('/', [ShoutController::class, 'index']);
            Route::get('/{id}', [ShoutController::class, 'show'])
                ->where('id', '[0-9a-f\-]{36}');
            Route::post('/{id}/join', [ShoutController::class, 'join'])
                ->where('id', '[0-9a-f\-]{36}');
        });

        // Squads
        Route::prefix('squads')->group(function () {
            Route::post('/', [SquadController::class, 'store'])
                ->middleware('throttle:1,1440'); // 1/day
            Route::get('/me', [SquadController::class, 'mySquads']);
            Route::get('/join/{invite_code}', [SquadController::class, 'joinByCode']);
            Route::get('/{id}', [SquadController::class, 'show'])
                ->where('id', '[0-9a-f\-]{36}');
            Route::patch('/{id}', [SquadController::class, 'update'])
                ->where('id', '[0-9a-f\-]{36}')
                ->middleware('throttle:60,1');
            Route::delete('/{id}', [SquadController::class, 'destroy'])
                ->where('id', '[0-9a-f\-]{36}')
                ->middleware('throttle:60,1');
            Route::post('/{id}/join', [SquadController::class, 'join'])
                ->where('id', '[0-9a-f\-]{36}')
                ->middleware('throttle:120,1');
            Route::delete('/{id}/leave', [SquadController::class, 'leave'])
                ->where('id', '[0-9a-f\-]{36}')
                ->middleware('throttle:60,1');
            Route::delete('/{id}/members/{uid}', [SquadController::class, 'kick'])
                ->where(['id' => '[0-9a-f\-]{36}', 'uid' => '[0-9a-f\-]{36}'])
                ->middleware('throttle:60,1');
            Route::post('/{id}/stamps', [SquadController::class, 'createStamp'])
                ->where('id', '[0-9a-f\-]{36}');
            Route::get('/{id}/stamps', [SquadController::class, 'stamps'])
                ->where('id', '[0-9a-f\-]{36}')
                ->middleware('throttle:60,1');
            Route::post('/{id}/messages', [SquadController::class, 'sendMessage'])
                ->where('id', '[0-9a-f\-]{36}');
            Route::get('/{id}/messages', [SquadController::class, 'messages'])
                ->where('id', '[0-9a-f\-]{36}');
            Route::get('/{id}/leaderboard', [SquadController::class, 'leaderboard'])
                ->where('id', '[0-9a-f\-]{36}')
                ->middleware('throttle:60,1');
            Route::get('/{id}/stats', [SquadController::class, 'stats'])
                ->where('id', '[0-9a-f\-]{36}')
                ->middleware('throttle:60,1');
        });

        // Stamp Flash
        Route::prefix('stamps/flash')->group(function () {
            Route::get('/today', [FlashController::class, 'today']);
            Route::post('/capture', [FlashController::class, 'capture'])
                ->middleware('throttle:1,1440'); // 1/day
        });

        // Pépites
        Route::prefix('pepites')->group(function () {
            Route::post('/', [PepiteController::class, 'store'])
                ->middleware('throttle:120,1');
            Route::get('/', [PepiteController::class, 'index'])
                ->middleware('throttle:60,1');
            Route::get('/top', [PepiteController::class, 'top'])
                ->middleware('throttle:60,1');
            Route::get('/{id}', [PepiteController::class, 'show'])
                ->where('id', '[0-9a-f\-]{36}');
            Route::post('/{id}/vote', [PepiteController::class, 'vote'])
                ->where('id', '[0-9a-f\-]{36}')
                ->middleware('throttle:120,1');
            Route::delete('/{id}/vote', [PepiteController::class, 'unvote'])
                ->where('id', '[0-9a-f\-]{36}')
                ->middleware('throttle:120,1');
        });

        // Terra Incognita
        Route::prefix('exploration')->middleware('throttle:60,1')->group(function () {
            Route::get('/coverage', [ExplorationController::class, 'coverage']);
            Route::get('/tiles', [ExplorationController::class, 'tiles']);
        });

        // Feed
        Route::get('/feed', [FeedController::class, 'index'])
            ->middleware('throttle:60,1');
    });
});
