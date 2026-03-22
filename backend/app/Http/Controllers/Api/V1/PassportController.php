<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\PassportLevel;
use App\Models\PassportStamp;
use App\Models\User;
use App\Models\UserBadge;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PassportController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $userId = $user->id;

        $stamps = PassportStamp::where('user_id', $userId)
            ->orderByDesc('stamped_at')
            ->cursorPaginate(30);

        // P1 fix: single GROUP BY query instead of 4 separate COUNTs
        $stats = DB::selectOne("
            SELECT
                COUNT(*) FILTER (WHERE stamp_type = 'country') as countries,
                COUNT(*) FILTER (WHERE stamp_type = 'city') as cities,
                COUNT(*) FILTER (WHERE stamp_type = 'region') as regions,
                COUNT(*) FILTER (WHERE stamp_type = 'spot') as spots
            FROM passport_stamps WHERE user_id = ?
        ", [$userId]);

        $badges = UserBadge::where('user_id', $userId)->with('badge')->get();

        $level = PassportLevel::where('min_stamps', '<=', $user->total_stamps)
            ->orderByDesc('min_stamps')
            ->first();

        $nextLevel = PassportLevel::where('min_stamps', '>', $user->total_stamps)
            ->orderBy('min_stamps')
            ->first();

        $stampedCountries = PassportStamp::where('user_id', $userId)
            ->countries()
            ->pluck('country_code')
            ->toArray();

        return response()->json([
            'data' => [
                'stamps' => $stamps->items(),
                'stamped_countries' => $stampedCountries,
                'badges' => $badges,
                'stats' => [
                    'total_stamps' => $user->total_stamps,
                    'countries' => (int) ($stats->countries ?? 0),
                    'cities' => (int) ($stats->cities ?? 0),
                    'regions' => (int) ($stats->regions ?? 0),
                    'spots' => (int) ($stats->spots ?? 0),
                ],
                'level' => $level,
                'next_level' => $nextLevel,
            ],
            'meta' => [
                'pagination' => [
                    'cursor' => $stamps->nextCursor()?->encode(),
                    'has_more' => $stamps->hasMorePages(),
                ],
            ],
            'errors' => [],
        ]);
    }

    public function compare(Request $request, string $userId): JsonResponse
    {
        $authUser = $request->user();

        // Check blocked (reusable helper)
        if ($this->isBlocked($authUser->id, $userId)) {
            return response()->json(['data' => null, 'errors' => [['code' => 'not_found', 'message' => 'Utilisateur non trouvé']]], 404);
        }

        $otherUser = User::where('id', $userId)->whereNull('deleted_at')->first();
        if (! $otherUser) {
            return response()->json(['data' => null, 'errors' => [['code' => 'not_found', 'message' => 'Utilisateur non trouvé']]], 404);
        }

        // P2 fix: SQL INTERSECT instead of PHP array_intersect
        $commonCountries = DB::select("
            SELECT country_code FROM passport_stamps
            WHERE user_id = ? AND stamp_type = 'country'
            INTERSECT
            SELECT country_code FROM passport_stamps
            WHERE user_id = ? AND stamp_type = 'country'
        ", [$authUser->id, $userId]);

        $commonCities = DB::select("
            SELECT city_name FROM passport_stamps
            WHERE user_id = ? AND stamp_type = 'city' AND city_name IS NOT NULL
            INTERSECT
            SELECT city_name FROM passport_stamps
            WHERE user_id = ? AND stamp_type = 'city' AND city_name IS NOT NULL
        ", [$authUser->id, $userId]);

        // Stats via single query per user
        $myStats = DB::selectOne("
            SELECT
                COUNT(*) FILTER (WHERE stamp_type = 'country') as countries,
                COUNT(*) FILTER (WHERE stamp_type = 'city') as cities
            FROM passport_stamps WHERE user_id = ?
        ", [$authUser->id]);

        $theirStats = DB::selectOne("
            SELECT
                COUNT(*) FILTER (WHERE stamp_type = 'country') as countries,
                COUNT(*) FILTER (WHERE stamp_type = 'city') as cities
            FROM passport_stamps WHERE user_id = ?
        ", [$userId]);

        return response()->json([
            'data' => [
                'me' => [
                    'total_stamps' => $authUser->total_stamps,
                    'countries_count' => (int) ($myStats->countries ?? 0),
                    'cities_count' => (int) ($myStats->cities ?? 0),
                ],
                'other' => [
                    'id' => $otherUser->id,
                    'name' => $otherUser->name,
                    'username' => $otherUser->username,
                    'total_stamps' => $otherUser->total_stamps,
                    'countries_count' => (int) ($theirStats->countries ?? 0),
                    'cities_count' => (int) ($theirStats->cities ?? 0),
                ],
                'common' => [
                    'countries' => array_column($commonCountries, 'country_code'),
                    'cities' => array_column($commonCities, 'city_name'),
                    'countries_count' => count($commonCountries),
                    'cities_count' => count($commonCities),
                ],
            ],
            'meta' => [],
            'errors' => [],
        ]);
    }

    private function isBlocked(string $userA, string $userB): bool
    {
        return DB::selectOne(
            'SELECT EXISTS(
                SELECT 1 FROM blocked_users
                WHERE (blocker_user_id = ? AND blocked_user_id = ?)
                   OR (blocker_user_id = ? AND blocked_user_id = ?)
            ) as blocked',
            [$userA, $userB, $userB, $userA]
        )->blocked ?? false;
    }
}
