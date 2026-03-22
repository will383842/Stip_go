<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SearchController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $request->validate(['q' => 'required|string|min:2|max:50']);

        // H2 fix: escape ILIKE wildcards to prevent enumeration
        $query = str_replace(['%', '_'], ['\%', '\_'], $request->q);
        $authUserId = $request->user()->id;

        // P6 fix: single query for blocked IDs (instead of 2 separate queries)
        $blockedIds = DB::table('blocked_users')
            ->where('blocker_user_id', $authUserId)
            ->orWhere('blocked_user_id', $authUserId)
            ->get()
            ->map(fn ($row) => $row->blocker_user_id === $authUserId ? $row->blocked_user_id : $row->blocker_user_id)
            ->unique()
            ->toArray();

        $users = User::whereNull('deleted_at')
            ->where('id', '!=', $authUserId)
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
