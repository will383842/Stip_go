<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ActivityFeed;
use App\Models\Squad;
use App\Models\SquadMember;
use App\Models\SquadMessage;
use App\Models\SquadStamp;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;

class SquadController extends Controller
{
    /**
     * POST /squads — Create a squad.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:30',
            'emoji' => 'required|string|max:4',
        ]);

        $user = $request->user();

        // Limit: max squads per user
        $userSquadCount = SquadMember::where('user_id', $user->id)->count();
        if ($userSquadCount >= config('stipme.squad_max_per_user', 10)) {
            return response()->json([
                'data' => null,
                'errors' => [['code' => 'max_squads', 'message' => 'Maximum squads reached']],
            ], 422);
        }

        $squad = Squad::create([
            'name' => $request->name,
            'emoji' => $request->emoji,
            'creator_user_id' => $user->id,
            'member_count' => 1,
        ]);

        // Add creator as first member
        SquadMember::create([
            'squad_id' => $squad->id,
            'user_id' => $user->id,
            'color' => SquadMember::COLORS[0],
            'role' => 'creator',
            'joined_at' => now(),
        ]);

        return response()->json([
            'data' => $squad->fresh()->load('members.user:id,name,username,avatar_url'),
        ], 201);
    }

    /**
     * GET /squads/me — My squads.
     */
    public function mySquads(Request $request): JsonResponse
    {
        $user = $request->user();

        $squadIds = SquadMember::where('user_id', $user->id)->pluck('squad_id');
        $squads = Squad::whereIn('id', $squadIds)
            ->with('members.user:id,name,username,avatar_url')
            ->get();

        return response()->json(['data' => $squads]);
    }

    /**
     * GET /squads/{id} — Squad detail.
     */
    public function show(string $id): JsonResponse
    {
        $squad = Squad::with('members.user:id,name,username,avatar_url')
            ->findOrFail($id);

        return response()->json(['data' => $squad]);
    }

    /**
     * PATCH /squads/{id} — Edit squad (creator only).
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'name' => 'sometimes|string|max:30',
            'emoji' => 'sometimes|string|max:4',
        ]);

        $squad = Squad::findOrFail($id);

        if ($squad->creator_user_id !== $request->user()->id) {
            return response()->json([
                'data' => null,
                'errors' => [['code' => 'forbidden', 'message' => 'Only the creator can edit the squad']],
            ], 403);
        }

        $squad->update($request->only('name', 'emoji'));

        return response()->json(['data' => $squad->fresh()]);
    }

    /**
     * DELETE /squads/{id} — Delete squad (creator only).
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $squad = Squad::findOrFail($id);

        if ($squad->creator_user_id !== $request->user()->id) {
            return response()->json([
                'data' => null,
                'errors' => [['code' => 'forbidden', 'message' => 'Only the creator can delete the squad']],
            ], 403);
        }

        $squad->delete();

        return response()->json(['data' => null]);
    }

    /**
     * GET /squads/join/{invite_code} — Join via invite code.
     */
    public function joinByCode(Request $request, string $inviteCode): JsonResponse
    {
        $squad = Squad::where('invite_code', $inviteCode)->first();

        if (! $squad) {
            return response()->json([
                'data' => null,
                'errors' => [['code' => 'invalid_code', 'message' => 'Invalid invite code']],
            ], 404);
        }

        return $this->addMember($request->user(), $squad);
    }

    /**
     * POST /squads/{id}/join — Join squad by ID.
     */
    public function join(Request $request, string $id): JsonResponse
    {
        $squad = Squad::findOrFail($id);

        return $this->addMember($request->user(), $squad);
    }

    /**
     * DELETE /squads/{id}/leave — Leave squad.
     */
    public function leave(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $squad = Squad::findOrFail($id);

        if ($squad->creator_user_id === $user->id) {
            return response()->json([
                'data' => null,
                'errors' => [['code' => 'creator_cannot_leave', 'message' => 'Creator cannot leave. Delete the squad instead.']],
            ], 422);
        }

        SquadMember::where('squad_id', $id)->where('user_id', $user->id)->delete();
        $squad->decrement('member_count');

        return response()->json(['data' => null]);
    }

    /**
     * DELETE /squads/{id}/members/{uid} — Kick member (creator only).
     */
    public function kick(Request $request, string $id, string $uid): JsonResponse
    {
        $squad = Squad::findOrFail($id);

        if ($squad->creator_user_id !== $request->user()->id) {
            return response()->json([
                'data' => null,
                'errors' => [['code' => 'forbidden', 'message' => 'Only the creator can kick members']],
            ], 403);
        }

        if ($uid === $squad->creator_user_id) {
            return response()->json([
                'data' => null,
                'errors' => [['code' => 'cannot_kick_creator', 'message' => 'Cannot kick the creator']],
            ], 422);
        }

        SquadMember::where('squad_id', $id)->where('user_id', $uid)->delete();
        $squad->decrement('member_count');

        return response()->json(['data' => null]);
    }

    /**
     * POST /squads/{id}/stamps — Create squad stamp.
     */
    public function createStamp(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'stamp_type' => 'required|string|in:spot,city,region,country,photo',
            'lat' => 'required|numeric|between:-90,90',
            'lng' => 'required|numeric|between:-180,180',
            'photo_url' => 'nullable|string|url|max:500',
            'caption' => 'nullable|string|max:280',
        ]);

        $user = $request->user();
        $squad = Squad::findOrFail($id);

        // Verify membership
        if (! SquadMember::where('squad_id', $id)->where('user_id', $user->id)->exists()) {
            return response()->json([
                'data' => null,
                'errors' => [['code' => 'not_member', 'message' => 'You are not a member of this squad']],
            ], 403);
        }

        // Insert with parameterized geography to prevent SQL injection
        $stampId = DB::selectOne("
            INSERT INTO squad_stamps (id, squad_id, user_id, stamp_type, location, photo_url, caption)
            VALUES (gen_random_uuid(), ?, ?, ?, ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography, ?, ?)
            RETURNING id
        ", [$id, $user->id, $request->stamp_type, $request->lng, $request->lat, $request->photo_url, $request->caption]);

        $stamp = SquadStamp::find($stampId->id);

        // Update counters
        $squad->increment('total_stamps');
        SquadMember::where('squad_id', $id)->where('user_id', $user->id)->update([
            'last_stamp_at' => now(),
            'weekly_stamps' => DB::raw('weekly_stamps + 1'),
            'total_stamps' => DB::raw('total_stamps + 1'),
        ]);

        // Track in Redis for streak
        Redis::sadd("squad:{$id}:today_stamped", $user->id);
        Redis::expireat("squad:{$id}:today_stamped", now()->endOfDay()->timestamp);

        // Update weekly ranking
        Redis::zincrby("squad:{$id}:weekly_ranking", 1, $user->id);

        return response()->json(['data' => $stamp->load('user:id,name,username,avatar_url')], 201);
    }

    /**
     * GET /squads/{id}/stamps — Squad stamps feed (cursor).
     */
    public function stamps(Request $request, string $id): JsonResponse
    {
        $query = SquadStamp::where('squad_id', $id)
            ->with('user:id,name,username,avatar_url')
            ->orderByDesc('created_at');

        if ($request->has('cursor')) {
            $query->where('created_at', '<', $request->cursor);
        }

        $stamps = $query->limit(20)->get();

        return response()->json([
            'data' => $stamps,
            'meta' => [
                'has_more' => $stamps->count() === 20,
                'cursor' => $stamps->last()?->created_at?->toISOString(),
            ],
        ]);
    }

    /**
     * POST /squads/{id}/messages — Send squad message.
     */
    public function sendMessage(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'content' => 'required|string|max:2000',
            'photo_url' => 'nullable|string|url|max:500',
            'audio_url' => 'nullable|string|url|max:500',
        ]);

        $user = $request->user();

        if (! SquadMember::where('squad_id', $id)->where('user_id', $user->id)->exists()) {
            return response()->json([
                'data' => null,
                'errors' => [['code' => 'not_member', 'message' => 'You are not a member of this squad']],
            ], 403);
        }

        $message = SquadMessage::create([
            'squad_id' => $id,
            'sender_user_id' => $user->id,
            'content' => $request->content,
            'photo_url' => $request->photo_url,
            'audio_url' => $request->audio_url,
        ]);

        return response()->json([
            'data' => $message->load('sender:id,name,username,avatar_url'),
        ], 201);
    }

    /**
     * GET /squads/{id}/messages — Squad messages (cursor).
     */
    public function messages(Request $request, string $id): JsonResponse
    {
        $query = SquadMessage::where('squad_id', $id)
            ->with('sender:id,name,username,avatar_url')
            ->orderByDesc('created_at');

        if ($request->has('cursor')) {
            $query->where('created_at', '<', $request->cursor);
        }

        $messages = $query->limit(30)->get();

        return response()->json([
            'data' => $messages,
            'meta' => [
                'has_more' => $messages->count() === 30,
                'cursor' => $messages->last()?->created_at?->toISOString(),
            ],
        ]);
    }

    /**
     * GET /squads/{id}/leaderboard — Weekly leaderboard.
     */
    public function leaderboard(string $id): JsonResponse
    {
        $members = SquadMember::where('squad_id', $id)
            ->with('user:id,name,username,avatar_url')
            ->orderByDesc('weekly_stamps')
            ->get();

        return response()->json(['data' => $members]);
    }

    /**
     * GET /squads/{id}/stats — Squad stats.
     */
    public function stats(string $id): JsonResponse
    {
        $squad = Squad::findOrFail($id);

        $todayStamped = Redis::scard("squad:{$id}:today_stamped") ?: 0;
        $streakThreshold = config('stipme.squad.streak_threshold', 0.80);
        $needed = ceil($squad->member_count * $streakThreshold);

        return response()->json([
            'data' => [
                'total_stamps' => $squad->total_stamps,
                'current_streak' => $squad->current_streak,
                'max_streak' => $squad->max_streak,
                'member_count' => $squad->member_count,
                'today_stamped' => (int) $todayStamped,
                'streak_needed' => (int) $needed,
                'streak_safe' => $todayStamped >= $needed,
            ],
        ]);
    }

    /**
     * Add a member to a squad (shared logic).
     */
    private function addMember($user, Squad $squad): JsonResponse
    {
        if ($squad->isFull()) {
            return response()->json([
                'data' => null,
                'errors' => [['code' => 'squad_full', 'message' => 'Squad is full (max 8 members)']],
            ], 422);
        }

        if (SquadMember::where('squad_id', $squad->id)->where('user_id', $user->id)->exists()) {
            return response()->json([
                'data' => null,
                'errors' => [['code' => 'already_member', 'message' => 'Already a member of this squad']],
            ], 409);
        }

        SquadMember::create([
            'squad_id' => $squad->id,
            'user_id' => $user->id,
            'color' => SquadMember::nextColor($squad->id),
            'role' => 'member',
            'joined_at' => now(),
        ]);

        $squad->increment('member_count');

        // Activity feed
        ActivityFeed::create([
            'user_id' => $user->id,
            'type' => 'squad_join',
            'content' => ['squad_id' => $squad->id, 'squad_name' => $squad->name, 'squad_emoji' => $squad->emoji],
        ]);

        return response()->json([
            'data' => $squad->fresh()->load('members.user:id,name,username,avatar_url'),
        ]);
    }
}
