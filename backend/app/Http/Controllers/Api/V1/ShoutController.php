<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Friendship;
use App\Models\Shout;
use App\Models\ShoutParticipant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redis;

class ShoutController extends Controller
{
    /**
     * POST /shouts — Create a shout.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'message' => 'required|string|max:140',
        ]);

        $user = $request->user();

        // Get user's latest position and extract lat/lng from geography column
        $position = $user->positions()->latest('recorded_at')->first();
        if (! $position) {
            return response()->json([
                'data' => null,
                'errors' => [['code' => 'no_position', 'message' => 'No position available. Enable location.']],
            ], 422);
        }

        $coords = DB::selectOne(
            'SELECT ST_Y(location::geometry) as lat, ST_X(location::geometry) as lng FROM positions WHERE id = ?',
            [$position->id]
        );

        if (! $coords) {
            return response()->json([
                'data' => null,
                'errors' => [['code' => 'no_position', 'message' => 'Could not resolve position coordinates.']],
            ], 422);
        }

        $shout = new Shout;
        $shout->user_id = $user->id;
        $shout->message = $request->message;
        $shout->radius_meters = config('stipme.shouts.radius_meters', 2000);
        $shout->expires_at = now()->addHours(2);
        $shout->participants_count = 0;
        $shout->is_minor = $user->isMinor();

        // Set geography via raw SQL to avoid Eloquent escaping
        DB::statement(
            'INSERT INTO shouts (id, user_id, location, message, radius_meters, expires_at, participants_count, is_minor)
             VALUES (gen_random_uuid(), ?, ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography, ?, ?, ?, ?, ?)',
            [$user->id, $coords->lng, $coords->lat, $request->message,
             config('stipme.shouts.radius_meters', 2000), now()->addHours(2), 0, $user->isMinor()]
        );

        $shout = Shout::where('user_id', $user->id)->latest('created_at')->first();

        // Auto-join creator
        ShoutParticipant::create([
            'shout_id' => $shout->id,
            'user_id' => $user->id,
            'joined_at' => now(),
        ]);

        $shout->increment('participants_count');

        // Invalidate geo cache
        $latKey = round($coords->lat, 2);
        $lngKey = round($coords->lng, 2);
        Redis::del("shouts:geo:{$latKey}:{$lngKey}");

        return response()->json([
            'data' => $shout->fresh()->load('user:id,name,username,avatar_url'),
        ], 201);
    }

    /**
     * GET /shouts — Nearby active shouts.
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'lat' => 'required|numeric|between:-90,90',
            'lng' => 'required|numeric|between:-180,180',
        ]);

        $user = $request->user();
        $lat = (float) $request->lat;
        $lng = (float) $request->lng;

        // Check Redis cache
        $cacheKey = 'shouts:geo:'.round($lat, 2).':'.round($lng, 2);
        $cached = Redis::get($cacheKey);

        if ($cached) {
            $shouts = collect(json_decode($cached, true));
        } else {
            $query = Shout::active()
                ->nearby($lat, $lng)
                ->with('user:id,name,username,avatar_url')
                ->orderByDesc('created_at')
                ->limit(50);

            // Minor protection: only see friends' shouts
            if ($user->isMinor()) {
                $friendIds = DB::table('friendships')
                    ->where('status', 'accepted')
                    ->where(function ($q) use ($user) {
                        $q->where('user_id', $user->id)->orWhere('friend_id', $user->id);
                    })
                    ->selectRaw("CASE WHEN user_id = ? THEN friend_id ELSE user_id END as fid", [$user->id])
                    ->pluck('fid');

                $query->whereIn('user_id', $friendIds);
            }

            $shouts = $query->get();

            // Cache for 2 min
            Redis::setex($cacheKey, 120, json_encode($shouts));
        }

        return response()->json(['data' => $shouts]);
    }

    /**
     * GET /shouts/{id} — Shout detail.
     */
    public function show(string $id): JsonResponse
    {
        $shout = Shout::with(['user:id,name,username,avatar_url', 'participants.user:id,name,username,avatar_url'])
            ->findOrFail($id);

        return response()->json(['data' => $shout]);
    }

    /**
     * POST /shouts/{id}/join — Join a shout.
     */
    public function join(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $shout = Shout::active()->findOrFail($id);

        // Already joined?
        if (ShoutParticipant::where('shout_id', $id)->where('user_id', $user->id)->exists()) {
            return response()->json([
                'data' => null,
                'errors' => [['code' => 'already_joined', 'message' => 'Already joined this shout']],
            ], 409);
        }

        ShoutParticipant::create([
            'shout_id' => $id,
            'user_id' => $user->id,
            'joined_at' => now(),
        ]);

        $shout->increment('participants_count');

        return response()->json(['data' => $shout->fresh()->load('user:id,name,username,avatar_url')]);
    }
}
