<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\BlockedUser;
use App\Models\Friendship;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FriendshipController extends Controller
{
    /**
     * GET /friends — My accepted friends.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $friends = $user->friends()
            ->select('id', 'name', 'username', 'avatar_url', 'profile_color', 'total_stamps')
            ->get();

        return response()->json(['data' => $friends]);
    }

    /**
     * GET /friends/requests — Pending requests received.
     */
    public function requests(Request $request): JsonResponse
    {
        $user = $request->user();

        $requests = Friendship::where('friend_id', $user->id)
            ->pending()
            ->with('user:id,name,username,avatar_url,profile_color')
            ->latest()
            ->get();

        return response()->json(['data' => $requests]);
    }

    /**
     * POST /friends/{id}/request — Send friend request.
     */
    public function sendRequest(Request $request, string $id): JsonResponse
    {
        $user = $request->user();

        if ($user->id === $id) {
            return response()->json([
                'data' => null,
                'errors' => [['code' => 'self_request', 'message' => 'Cannot send friend request to yourself']],
            ], 422);
        }

        $target = User::find($id);
        if (! $target) {
            return response()->json([
                'data' => null,
                'errors' => [['code' => 'user_not_found', 'message' => 'User not found']],
            ], 404);
        }

        // Check block
        $isBlocked = BlockedUser::where(function ($q) use ($user, $id) {
            $q->where('blocker_user_id', $user->id)->where('blocked_user_id', $id);
        })->orWhere(function ($q) use ($user, $id) {
            $q->where('blocker_user_id', $id)->where('blocked_user_id', $user->id);
        })->exists();

        if ($isBlocked) {
            return response()->json([
                'data' => null,
                'errors' => [['code' => 'blocked', 'message' => 'Cannot send friend request']],
            ], 403);
        }

        // Check existing friendship (either direction)
        $existing = Friendship::where(function ($q) use ($user, $id) {
            $q->where('user_id', $user->id)->where('friend_id', $id);
        })->orWhere(function ($q) use ($user, $id) {
            $q->where('user_id', $id)->where('friend_id', $user->id);
        })->first();

        if ($existing) {
            return response()->json([
                'data' => null,
                'errors' => [['code' => 'already_exists', 'message' => 'Friendship already exists', 'field' => 'status', 'value' => $existing->status]],
            ], 409);
        }

        $friendship = Friendship::create([
            'user_id' => $user->id,
            'friend_id' => $id,
            'status' => 'pending',
        ]);

        return response()->json(['data' => $friendship->load('friend:id,name,username,avatar_url')], 201);
    }

    /**
     * POST /friends/{id}/accept — Accept friend request.
     */
    public function accept(Request $request, string $id): JsonResponse
    {
        $user = $request->user();

        $friendship = Friendship::where('user_id', $id)
            ->where('friend_id', $user->id)
            ->pending()
            ->first();

        if (! $friendship) {
            return response()->json([
                'data' => null,
                'errors' => [['code' => 'not_found', 'message' => 'No pending friend request from this user']],
            ], 404);
        }

        $friendship->update(['status' => 'accepted']);

        // Load both user and friend for frontend consistency
        return response()->json(['data' => $friendship->load(['user:id,name,username,avatar_url', 'friend:id,name,username,avatar_url'])]);
    }

    /**
     * DELETE /friends/{id} — Remove friendship (any direction).
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $user = $request->user();

        $deleted = Friendship::where(function ($q) use ($user, $id) {
            $q->where('user_id', $user->id)->where('friend_id', $id);
        })->orWhere(function ($q) use ($user, $id) {
            $q->where('user_id', $id)->where('friend_id', $user->id);
        })->delete();

        if (! $deleted) {
            return response()->json([
                'data' => null,
                'errors' => [['code' => 'not_found', 'message' => 'Friendship not found']],
            ], 404);
        }

        return response()->json(['data' => null], 200);
    }
}
