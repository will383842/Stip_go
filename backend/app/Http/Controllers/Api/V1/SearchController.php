<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\BlockedUser;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $request->validate(['q' => 'required|string|min:2|max:50']);

        $query = $request->q;
        $authUser = $request->user();

        // Get blocked IDs to exclude
        $blockedIds = BlockedUser::where('blocker_user_id', $authUser->id)
            ->pluck('blocked_user_id')
            ->merge(
                BlockedUser::where('blocked_user_id', $authUser->id)->pluck('blocker_user_id')
            )
            ->unique()
            ->toArray();

        $users = User::whereNull('deleted_at')
            ->where('id', '!=', $authUser->id)
            ->whereNotIn('id', $blockedIds)
            ->where(function ($q) use ($query) {
                $q->where('username', 'ILIKE', "%{$query}%")
                    ->orWhere('name', 'ILIKE', "%{$query}%");
            })
            ->select('id', 'name', 'username', 'avatar_url', 'total_stamps', 'passport_level_name', 'country_code', 'top_stamps')
            ->limit(20)
            ->get();

        return response()->json([
            'data' => $users,
            'meta' => [],
            'errors' => [],
        ]);
    }
}
