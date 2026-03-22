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

        // Stats with source breakdown for countries
        $stats = DB::selectOne("
            SELECT
                COUNT(*) FILTER (WHERE stamp_type = 'country') as countries,
                COUNT(*) FILTER (WHERE stamp_type = 'country' AND source IN ('gps', 'imported')) as verified_countries,
                COUNT(*) FILTER (WHERE stamp_type = 'country' AND source = 'declared') as declared_countries,
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
            ->select('country_code', 'source')
            ->get()
            ->toArray();

        return response()->json([
            'data' => [
                'stamps' => $stamps->items(),
                'stamped_countries' => $stampedCountries,
                'badges' => $badges,
                'stats' => [
                    'total_stamps' => $user->total_stamps,
                    'countries_visited' => (int) ($stats->countries ?? 0),
                    'verified_countries' => (int) ($stats->verified_countries ?? 0),
                    'declared_countries' => (int) ($stats->declared_countries ?? 0),
                    'cities_visited' => (int) ($stats->cities ?? 0),
                    'regions_visited' => (int) ($stats->regions ?? 0),
                    'spots_visited' => (int) ($stats->spots ?? 0),
                    'days_active' => (int) DB::selectOne(
                        "SELECT COUNT(DISTINCT DATE(recorded_at)) as days FROM positions WHERE user_id = ?",
                        [$userId]
                    )?->days ?? 0,
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

    public function declare(Request $request): JsonResponse
    {
        $request->validate([
            'country_codes' => 'required|array|min:1|max:100',
            'country_codes.*' => 'required|string|size:2',
        ]);

        $user = $request->user();
        $userId = $user->id;
        $countryCodes = array_unique($request->input('country_codes'));

        // Validate country codes exist
        $validCodes = DB::table('countries')
            ->whereIn('code', $countryCodes)
            ->pluck('code')
            ->toArray();

        // Check max 100 declared stamps total for this user
        $existingDeclaredCount = PassportStamp::where('user_id', $userId)
            ->where('source', 'declared')
            ->where('stamp_type', 'country')
            ->count();

        $maxAllowed = 100 - $existingDeclaredCount;
        if ($maxAllowed <= 0) {
            return response()->json([
                'data' => null,
                'errors' => [['code' => 'max_declared', 'message' => 'Maximum 100 pays déclarés atteint']],
            ], 422);
        }

        // Get already stamped countries (any source)
        $alreadyStamped = PassportStamp::where('user_id', $userId)
            ->where('stamp_type', 'country')
            ->whereIn('country_code', $validCodes)
            ->pluck('country_code')
            ->toArray();

        $declaredCount = 0;
        $ignoredCount = 0;

        foreach ($validCodes as $code) {
            if (in_array($code, $alreadyStamped)) {
                $ignoredCount++;
                continue;
            }

            if ($declaredCount >= $maxAllowed) {
                $ignoredCount++;
                continue;
            }

            PassportStamp::create([
                'user_id' => $userId,
                'stamp_type' => 'country',
                'country_code' => $code,
                'source' => 'declared',
                'stamped_at' => now(),
            ]);

            $declaredCount++;
        }

        $ignoredCount += count($countryCodes) - count($validCodes); // invalid codes

        // Total countries after insert
        $totalCountries = PassportStamp::where('user_id', $userId)
            ->where('stamp_type', 'country')
            ->count();

        return response()->json([
            'data' => [
                'declared_count' => $declaredCount,
                'ignored_count' => $ignoredCount,
                'total_countries' => $totalCountries,
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
