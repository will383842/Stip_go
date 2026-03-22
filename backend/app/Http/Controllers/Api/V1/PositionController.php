<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PositionController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'positions' => 'required|array|min:1|max:100',
            'positions.*.lat' => 'required|numeric|between:-90,90',
            'positions.*.lng' => 'required|numeric|between:-180,180',
            'positions.*.accuracy' => 'nullable|numeric',
            'positions.*.speed' => 'nullable|numeric',
            'positions.*.battery' => 'nullable|integer|min:0|max:100',
            'positions.*.altitude' => 'nullable|numeric',
            'positions.*.is_mock' => 'nullable|boolean',
            'positions.*.recorded_at' => 'required|date',
        ]);

        $userId = $request->user()->id;
        $stored = 0;

        // Get user's last stored position
        $lastPosition = DB::selectOne(
            'SELECT ST_X(location::geometry) as lng, ST_Y(location::geometry) as lat
             FROM positions WHERE user_id = ? ORDER BY recorded_at DESC LIMIT 1',
            [$userId]
        );

        foreach ($request->positions as $pos) {
            // Skip if distance < 50m from last stored position
            if ($lastPosition) {
                $distance = DB::selectOne(
                    'SELECT ST_Distance(
                        ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography,
                        ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography
                    ) as dist',
                    [$pos['lng'], $pos['lat'], $lastPosition->lng, $lastPosition->lat]
                );

                if ($distance && $distance->dist < 50) {
                    continue;
                }
            }

            // Flag suspicious: speed > 250 m/s (~900 km/h)
            $isSuspicious = isset($pos['speed']) && $pos['speed'] > 250;

            DB::statement(
                'INSERT INTO positions (user_id, location, accuracy, speed, battery_level, altitude, is_mock, is_suspicious, recorded_at)
                 VALUES (?, ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography, ?, ?, ?, ?, ?, ?, ?)',
                [
                    $userId,
                    $pos['lng'], $pos['lat'],
                    $pos['accuracy'] ?? null,
                    $pos['speed'] ?? null,
                    $pos['battery'] ?? null,
                    $pos['altitude'] ?? null,
                    $pos['is_mock'] ?? false,
                    $isSuspicious,
                    $pos['recorded_at'],
                ]
            );

            $lastPosition = (object) ['lat' => $pos['lat'], 'lng' => $pos['lng']];
            $stored++;
        }

        return response()->json([
            'data' => ['stored' => $stored, 'skipped' => count($request->positions) - $stored],
            'meta' => [],
            'errors' => [],
        ], 201);
    }

    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'from' => 'nullable|date',
            'to' => 'nullable|date',
        ]);

        $query = DB::table('positions')
            ->where('user_id', $request->user()->id)
            ->select(DB::raw('id, ST_Y(location::geometry) as lat, ST_X(location::geometry) as lng, accuracy, speed, recorded_at'))
            ->orderByDesc('recorded_at');

        if ($request->from) {
            $query->where('recorded_at', '>=', $request->from);
        }
        if ($request->to) {
            $query->where('recorded_at', '<=', $request->to);
        }

        $positions = $query->cursorPaginate(50);

        return response()->json([
            'data' => $positions->items(),
            'meta' => [
                'pagination' => [
                    'cursor' => $positions->nextCursor()?->encode(),
                    'has_more' => $positions->hasMorePages(),
                ],
            ],
            'errors' => [],
        ]);
    }

    public function clusters(Request $request): JsonResponse
    {
        $request->validate([
            'zoom' => 'required|integer|min:1|max:4',
            'bbox' => 'required|string',
        ]);

        $bbox = explode(',', $request->bbox);
        if (count($bbox) !== 4) {
            return response()->json(['data' => null, 'errors' => [['code' => 'invalid_bbox', 'message' => 'bbox must be swLat,swLng,neLat,neLng']]], 422);
        }

        [$swLat, $swLng, $neLat, $neLng] = array_map('floatval', $bbox);

        // H3 fix: validate bbox ranges
        if ($swLat < -90 || $neLat > 90 || $swLng < -180 || $neLng > 180 || $swLat > $neLat || $swLng > $neLng) {
            return response()->json(['data' => null, 'errors' => [['code' => 'invalid_bbox', 'message' => 'bbox out of range']]], 422);
        }

        // Note: position_clusters is an aggregated table (no user_id column),
        // so blocked user filtering happens at the individual position level
        // during the clusters:refresh cron, not here.

        $clusters = DB::table('position_clusters')
            ->where('zoom_level', $request->zoom)
            ->select(DB::raw('
                id,
                ROUND(ST_Y(center::geometry)::numeric, 2) as lat,
                ROUND(ST_X(center::geometry)::numeric, 2) as lng,
                count
            '))
            ->whereRaw('ST_Y(center::geometry) BETWEEN ? AND ?', [$swLat, $neLat])
            ->whereRaw('ST_X(center::geometry) BETWEEN ? AND ?', [$swLng, $neLng])
            ->get();

        return response()->json([
            'data' => $clusters,
            'meta' => [],
            'errors' => [],
        ]);
    }
}
