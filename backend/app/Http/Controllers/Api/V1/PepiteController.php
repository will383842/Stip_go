<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ActivityFeed;
use App\Models\Pepite;
use App\Models\PepiteVote;
use App\Models\Position;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PepiteController extends Controller
{
    /**
     * POST /pepites — Create a pépite.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'lat' => 'required|numeric|between:-90,90',
            'lng' => 'required|numeric|between:-180,180',
            'photo_url' => 'required|string|url|max:500',
            'caption' => 'nullable|string|max:280',
        ]);

        $user = $request->user();

        // Insert with parameterized geography to prevent SQL injection
        $pepiteId = DB::selectOne("
            INSERT INTO pepites (id, user_id, location, photo_url, caption)
            VALUES (gen_random_uuid(), ?, ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography, ?, ?)
            RETURNING id
        ", [$user->id, $request->lng, $request->lat, $request->photo_url, $request->caption]);

        $pepite = Pepite::find($pepiteId->id);

        // Activity feed
        ActivityFeed::create([
            'user_id' => $user->id,
            'type' => 'pepite_created',
            'content' => ['pepite_id' => $pepite->id, 'caption' => $request->caption],
        ]);

        return response()->json([
            'data' => $pepite->fresh()->load('user:id,name,username,avatar_url'),
        ], 201);
    }

    /**
     * GET /pepites — Nearby pépites.
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'lat' => 'required|numeric|between:-90,90',
            'lng' => 'required|numeric|between:-180,180',
            'radius' => 'nullable|integer|min:100|max:50000',
        ]);

        $radius = (int) ($request->radius ?? config('stipme.pepites.radius_meters', 5000));
        $user = $request->user();
        $blockedIds = $user->blockedIds();

        $pepites = Pepite::active()
            ->nearby((float) $request->lat, (float) $request->lng, $radius)
            ->with('user:id,name,username,avatar_url')
            ->when(count($blockedIds) > 0, fn ($q) => $q->whereNotIn('user_id', $blockedIds))
            ->orderByDesc('votes_count')
            ->limit(50)
            ->get()
            ->map(function ($p) use ($user) {
                $p->has_voted = PepiteVote::where('pepite_id', $p->id)->where('user_id', $user->id)->exists();

                return $p;
            });

        return response()->json(['data' => $pepites]);
    }

    /**
     * GET /pepites/{id} — Pépite detail.
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $pepite = Pepite::with('user:id,name,username,avatar_url')->findOrFail($id);
        $user = $request->user();

        $pepite->has_voted = PepiteVote::where('pepite_id', $id)->where('user_id', $user->id)->exists();

        // Check if user can vote (has stamped within 200m)
        $pepite->can_vote = $this->canVote($user->id, $pepite);

        return response()->json(['data' => $pepite]);
    }

    /**
     * POST /pepites/{id}/vote — Vote (GPS verified < 200m).
     */
    public function vote(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $pepite = Pepite::findOrFail($id);

        // Already voted?
        if (PepiteVote::where('pepite_id', $id)->where('user_id', $user->id)->exists()) {
            return response()->json([
                'data' => null,
                'errors' => [['code' => 'already_voted', 'message' => 'Already voted for this pépite']],
            ], 409);
        }

        // GPS verification: user must have a stamp within 200m of the pepite
        if (! $this->canVote($user->id, $pepite)) {
            return response()->json([
                'data' => null,
                'errors' => [['code' => 'too_far', 'message' => 'You must have visited this location to vote (< 200m)']],
            ], 403);
        }

        try {
            PepiteVote::create([
                'pepite_id' => $id,
                'user_id' => $user->id,
                'voted_at' => now(),
            ]);
        } catch (\Illuminate\Database\UniqueConstraintViolationException) {
            return response()->json([
                'data' => null,
                'errors' => [['code' => 'already_voted', 'message' => 'Already voted for this pépite']],
            ], 409);
        }

        $pepite->increment('votes_count');

        return response()->json(['data' => $pepite->fresh()]);
    }

    /**
     * DELETE /pepites/{id}/vote — Remove vote.
     */
    public function unvote(Request $request, string $id): JsonResponse
    {
        $user = $request->user();

        $deleted = PepiteVote::where('pepite_id', $id)->where('user_id', $user->id)->delete();

        if (! $deleted) {
            return response()->json([
                'data' => null,
                'errors' => [['code' => 'not_voted', 'message' => 'No vote to remove']],
            ], 404);
        }

        Pepite::where('id', $id)->decrement('votes_count');

        return response()->json(['data' => Pepite::find($id)]);
    }

    /**
     * GET /pepites/top — Top pépites by city.
     */
    public function top(Request $request): JsonResponse
    {
        $request->validate([
            'city' => 'required|string|max:100',
        ]);

        // Get top pepites ordered by votes
        $pepites = Pepite::active()
            ->with('user:id,name,username,avatar_url')
            ->orderByDesc('votes_count')
            ->limit(20)
            ->get();

        return response()->json(['data' => $pepites]);
    }

    /**
     * Check if a user can vote on a pépite (has a position recorded within 200m).
     * Uses the positions table (which has geography column) instead of passport_stamps.
     */
    private function canVote(string $userId, Pepite $pepite): bool
    {
        return Position::where('user_id', $userId)
            ->whereRaw(
                'ST_DWithin(location, (SELECT location FROM pepites WHERE id = ?), 200)',
                [$pepite->id]
            )->exists();
    }
}
