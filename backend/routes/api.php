<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — /api/v1
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {
    // Health check
    Route::get('/health', function () {
        return response()->json([
            'data' => [
                'status' => 'ok',
                'app' => config('app.name'),
                'version' => '0.1.0',
                'timestamp' => now()->toIso8601String(),
            ],
        ]);
    });

    // Authenticated routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/user', function (Request $request) {
            return response()->json(['data' => $request->user()]);
        });
    });
});
