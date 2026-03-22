<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\BlockedUser;
use App\Models\PassportLevel;
use App\Models\PassportStamp;
use App\Models\User;
use App\Models\UserBadge;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PassportController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $stamps = PassportStamp::where('user_id', $user->id)
            ->orderByDesc('stamped_at')
            ->cursorPaginate(30);

        $countriesCount = PassportStamp::where('user_id', $user->id)->countries()->count();
        $citiesCount = PassportStamp::where('user_id', $user->id)->cities()->count();
        $regionsCount = PassportStamp::where('user_id', $user->id)->regions()->count();
        $spotsCount = PassportStamp::where('user_id', $user->id)->spots()->count();

        $badges = UserBadge::where('user_id', $user->id)->with('badge')->get();

        $level = PassportLevel::where('min_stamps', '<=', $user->total_stamps)
            ->orderByDesc('min_stamps')
            ->first();

        $nextLevel = PassportLevel::where('min_stamps', '>', $user->total_stamps)
            ->orderBy('min_stamps')
            ->first();

        $stampedCountries = PassportStamp::where('user_id', $user->id)
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
                    'countries' => $countriesCount,
                    'cities' => $citiesCount,
                    'regions' => $regionsCount,
                    'spots' => $spotsCount,
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

        // Check blocked
        $isBlocked = BlockedUser::where(function ($q) use ($authUser, $userId) {
            $q->where('blocker_user_id', $authUser->id)->where('blocked_user_id', $userId);
        })->orWhere(function ($q) use ($authUser, $userId) {
            $q->where('blocker_user_id', $userId)->where('blocked_user_id', $authUser->id);
        })->exists();

        if ($isBlocked) {
            return response()->json(['data' => null, 'errors' => [['code' => 'not_found', 'message' => 'Utilisateur non trouvé']]], 404);
        }

        $otherUser = User::findOrFail($userId);

        $myCountries = PassportStamp::where('user_id', $authUser->id)->countries()->pluck('country_code')->toArray();
        $theirCountries = PassportStamp::where('user_id', $userId)->countries()->pluck('country_code')->toArray();
        $commonCountries = array_values(array_intersect($myCountries, $theirCountries));

        $myCities = PassportStamp::where('user_id', $authUser->id)->cities()->pluck('city_name')->toArray();
        $theirCities = PassportStamp::where('user_id', $userId)->cities()->pluck('city_name')->toArray();
        $commonCities = array_values(array_intersect($myCities, $theirCities));

        return response()->json([
            'data' => [
                'me' => [
                    'total_stamps' => $authUser->total_stamps,
                    'countries_count' => count($myCountries),
                    'cities_count' => count($myCities),
                ],
                'other' => [
                    'id' => $otherUser->id,
                    'name' => $otherUser->name,
                    'username' => $otherUser->username,
                    'total_stamps' => $otherUser->total_stamps,
                    'countries_count' => count($theirCountries),
                    'cities_count' => count($theirCities),
                ],
                'common' => [
                    'countries' => $commonCountries,
                    'cities' => $commonCities,
                    'countries_count' => count($commonCountries),
                    'cities_count' => count($commonCities),
                ],
            ],
            'meta' => [],
            'errors' => [],
        ]);
    }
}
