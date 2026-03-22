<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ActivityFeed;
use App\Models\Friendship;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FeedController extends Controller
{
    /**
     * GET /feed — Activity feed from friends (cursor pagination).
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        // Get friend IDs efficiently (both directions, single query)
        $friendIds = DB::table('friendships')
            ->where('status', 'accepted')
            ->where(function ($q) use ($user) {
                $q->where('user_id', $user->id)->orWhere('friend_id', $user->id);
            })
            ->selectRaw("CASE WHEN user_id = ? THEN friend_id ELSE user_id END as fid", [$user->id])
            ->pluck('fid');

        // Exclude blocked users from feed
        $blockedIds = $user->blockedIds();
        $filteredFriendIds = $friendIds->reject(fn ($fid) => in_array($fid, $blockedIds));

        $query = ActivityFeed::whereIn('user_id', $filteredFriendIds)
            ->with('user:id,name,username,avatar_url')
            ->orderByDesc('created_at');

        if ($request->has('cursor')) {
            $query->where('created_at', '<', $request->cursor);
        }

        $items = $query->limit(20)->get();

        return response()->json([
            'data' => $items,
            'meta' => [
                'has_more' => $items->count() === 20,
                'cursor' => $items->last()?->created_at?->toISOString(),
            ],
        ]);
    }
}
