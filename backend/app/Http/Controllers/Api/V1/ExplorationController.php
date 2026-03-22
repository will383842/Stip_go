<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ExploredTile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;

class ExplorationController extends Controller
{
    /**
     * GET /exploration/coverage — Coverage % for a city.
     */
    public function coverage(Request $request): JsonResponse
    {
        $request->validate([
            'city' => 'required|string|max:100',
        ]);

        $user = $request->user();
        $city = $request->city;

        // Check cache
        $cacheKey = "user:{$user->id}:coverage:{$city}";
        $cached = Redis::get($cacheKey);

        if ($cached !== null) {
            return response()->json([
                'data' => ['city' => $city, 'coverage_percent' => (float) $cached],
            ]);
        }

        // Count user's explored tiles
        $userTiles = ExploredTile::where('user_id', $user->id)->count();

        // Estimate total tiles for the city (based on typical city area)
        // This is a rough estimate — in production, use city boundary + H3 polyfill
        $totalTiles = $this->estimateCityTiles($city);

        $coverage = $totalTiles > 0 ? min(100, round(($userTiles / $totalTiles) * 100, 2)) : 0;

        // Cache for 1h
        Redis::setex($cacheKey, 3600, $coverage);

        return response()->json([
            'data' => ['city' => $city, 'coverage_percent' => $coverage, 'explored_tiles' => $userTiles, 'total_tiles' => $totalTiles],
        ]);
    }

    /**
     * GET /exploration/tiles — Explored tiles in viewport (bbox).
     */
    public function tiles(Request $request): JsonResponse
    {
        $request->validate([
            'bbox' => 'required|string', // swLat,swLng,neLat,neLng
        ]);

        $user = $request->user();
        $parts = explode(',', $request->bbox);

        if (count($parts) !== 4) {
            return response()->json([
                'data' => null,
                'errors' => [['code' => 'invalid_bbox', 'message' => 'bbox must be swLat,swLng,neLat,neLng']],
            ], 422);
        }

        [$swLat, $swLng, $neLat, $neLng] = array_map('floatval', $parts);

        // Get all explored tiles for this user
        // In production, we'd filter by H3 index range for the bbox
        $cacheKey = "user:{$user->id}:explored_tiles";
        $cached = Redis::smembers($cacheKey);

        if (! empty($cached)) {
            $tiles = $cached;
        } else {
            $tiles = ExploredTile::where('user_id', $user->id)
                ->pluck('h3_index')
                ->toArray();

            if (! empty($tiles)) {
                Redis::sadd($cacheKey, ...$tiles);
                Redis::expire($cacheKey, 600); // 10min
            }
        }

        return response()->json([
            'data' => [
                'tiles' => $tiles,
                'count' => count($tiles),
            ],
        ]);
    }

    /**
     * Estimate total H3 tiles for a city (rough approximation).
     */
    private function estimateCityTiles(string $city): int
    {
        // Average city: ~100 km² → at H3 resolution 8, each hex ≈ 0.74 km²
        // ~135 hexagons for a typical city
        // For large cities, this could be much higher
        $cityAreas = [
            'lisbon' => 200, 'barcelona' => 250, 'amsterdam' => 180,
            'berlin' => 350, 'bangkok' => 400, 'paris' => 250,
        ];

        $areaKm2 = $cityAreas[strtolower($city)] ?? 150;

        return (int) ceil($areaKm2 / 0.74); // H3 res 8
    }
}
