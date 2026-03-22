<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ActivityFeed;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redis;

class FlashController extends Controller
{
    /**
     * GET /stamps/flash/today — Get today's flash for the zone.
     */
    public function today(Request $request): JsonResponse
    {
        $request->validate([
            'lat' => 'required|numeric|between:-90,90',
            'lng' => 'required|numeric|between:-180,180',
        ]);

        $lat = round((float) $request->lat, 2);
        $lng = round((float) $request->lng, 2);
        $user = $request->user();

        $cacheKey = "daily_stamp:{$lat}:{$lng}";
        $flash = Redis::get($cacheKey);

        if (! $flash) {
            return response()->json([
                'data' => null,
                'meta' => ['message' => 'No flash available for this zone today'],
            ]);
        }

        $flash = json_decode($flash, true);

        // Check if user already captured
        $captured = (bool) Redis::get("user:{$user->id}:daily_flash_captured");

        return response()->json([
            'data' => [
                'id' => $flash['id'] ?? null,
                'location' => $flash['location'] ?? null,
                'name' => $flash['name'] ?? null,
                'expires_at' => $flash['expires_at'] ?? null,
                'captured' => $captured,
                'miles_bonus' => config('stipme.stamp_flash.bonus_miles', 25),
            ],
        ]);
    }

    /**
     * POST /stamps/flash/capture — Capture today's flash.
     */
    public function capture(Request $request): JsonResponse
    {
        $user = $request->user();

        // Already captured today?
        if (Redis::get("user:{$user->id}:daily_flash_captured")) {
            return response()->json([
                'data' => null,
                'errors' => [['code' => 'already_captured', 'message' => 'Flash already captured today']],
            ], 409);
        }

        $bonusMiles = config('stipme.stamp_flash.bonus_miles', 25);

        // Award miles
        $user->increment('miles_balance', $bonusMiles);

        // Mark captured
        Redis::setex("user:{$user->id}:daily_flash_captured", 86400, '1');

        // Activity feed
        ActivityFeed::create([
            'user_id' => $user->id,
            'type' => 'flash_capture',
            'content' => ['miles_bonus' => $bonusMiles],
        ]);

        return response()->json([
            'data' => [
                'captured' => true,
                'miles_bonus' => $bonusMiles,
                'new_miles_balance' => $user->fresh()->miles_balance,
            ],
        ]);
    }
}
