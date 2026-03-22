<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\BlockedUser;
use App\Models\User;
use App\Models\UserSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function update(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'birth_year' => 'sometimes|integer|min:1950|max:' . ((int) date('Y') - 13),
            'username' => 'sometimes|string|regex:/^[a-z0-9_]{3,30}$/',
            'onboarding_step' => 'sometimes|integer|min:1|max:5',
            'avatar_url' => 'sometimes|string|url|max:500',
            'country_code' => 'sometimes|string|size:2',
            'profile_mood' => 'sometimes|nullable|string|max:30',
            'profile_color' => 'sometimes|string|max:7',
            'locale' => 'sometimes|string|max:5',
        ]);

        $user = $request->user();

        // Validate username cooldown (1 change per 30 days)
        if ($request->has('username') && $request->username !== $user->username) {
            if ($user->username_changed_at && $user->username_changed_at->diffInDays(now()) < 30) {
                return response()->json([
                    'data' => null,
                    'errors' => [['code' => 'username_cooldown', 'message' => 'Tu peux changer ton @username une fois par 30 jours', 'field' => 'username']],
                ], 422);
            }

            if (User::where('username', $request->username)->where('id', '!=', $user->id)->exists()) {
                return response()->json([
                    'data' => null,
                    'errors' => [['code' => 'username_taken', 'message' => 'Ce @username est déjà pris', 'field' => 'username']],
                ], 422);
            }

            $user->username_changed_at = now();
        }

        $user->fill($request->only([
            'name', 'birth_year', 'username', 'onboarding_step', 'avatar_url',
            'country_code', 'profile_mood', 'profile_color', 'locale',
        ]));

        // Minor protection: auto-configure restrictive settings for 13-17
        if ($request->has('birth_year') && $user->isMinor()) {
            $user->settings()->update([
                'visible_clusters' => false,
                'visible_dating' => false,
                'night_visibility_hidden' => true,
                'visibility_contacted_only' => true,
            ]);
        }

        $user->save();

        return response()->json([
            'data' => $user->load('settings'),
            'meta' => [],
            'errors' => [],
        ]);
    }

    public function updateSettings(Request $request): JsonResponse
    {
        $request->validate([
            'dark_mode' => 'sometimes|in:system,dark,light',
            'sounds_enabled' => 'sometimes|boolean',
            'haptic_enabled' => 'sometimes|boolean',
            'notification_push' => 'sometimes|boolean',
            'notification_email' => 'sometimes|boolean',
            'text_size' => 'sometimes|in:normal,large,xlarge',
            'locale' => 'sometimes|string|max:5',
            'auto_share_stamps' => 'sometimes|boolean',
            'family_mode' => 'sometimes|boolean',
            'night_visibility_hidden' => 'sometimes|boolean',
            'visibility_contacted_only' => 'sometimes|boolean',
        ]);

        $user = $request->user();
        $settings = $user->settings ?? UserSetting::create(['user_id' => $user->id]);

        // Minors cannot disable invisible mode
        if ($user->isMinor()) {
            $request->merge([
                'visibility_contacted_only' => true,
                'night_visibility_hidden' => true,
            ]);
        }

        $settings->fill($request->only([
            'dark_mode', 'sounds_enabled', 'haptic_enabled', 'notification_push',
            'notification_email', 'text_size', 'auto_share_stamps', 'family_mode',
            'night_visibility_hidden', 'visibility_contacted_only',
        ]));
        $settings->save();

        return response()->json([
            'data' => $settings,
            'meta' => [],
            'errors' => [],
        ]);
    }

    public function destroy(Request $request): JsonResponse
    {
        $request->user()->delete(); // soft delete

        return response()->json(null, 204);
    }

    public function export(Request $request): JsonResponse
    {
        // TODO: Dispatch export job
        return response()->json([
            'data' => ['message' => 'Export en cours, tu recevras un email'],
            'meta' => [],
            'errors' => [],
        ], 202);
    }

    public function show(string $id): JsonResponse
    {
        $authUser = auth()->user();

        // Check blocked
        if ($authUser) {
            $isBlocked = BlockedUser::where(function ($q) use ($authUser, $id) {
                $q->where('blocker_user_id', $authUser->id)->where('blocked_user_id', $id);
            })->orWhere(function ($q) use ($authUser, $id) {
                $q->where('blocker_user_id', $id)->where('blocked_user_id', $authUser->id);
            })->exists();

            if ($isBlocked) {
                return response()->json(['data' => null, 'errors' => [['code' => 'not_found', 'message' => 'Utilisateur non trouvé']]], 404);
            }
        }

        $user = User::where('id', $id)->whereNull('deleted_at')->firstOrFail();

        return response()->json([
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'avatar_url' => $user->avatar_url,
                'total_stamps' => $user->total_stamps,
                'passport_level_name' => $user->passport_level_name,
                'top_stamps' => $user->top_stamps,
                'profile_mood' => $user->profile_mood,
                'profile_color' => $user->profile_color,
                'pinned_countries' => $user->pinned_countries,
                'country_code' => $user->country_code,
            ],
            'meta' => [],
            'errors' => [],
        ]);
    }

    public function block(Request $request, string $id): JsonResponse
    {
        BlockedUser::firstOrCreate([
            'blocker_user_id' => $request->user()->id,
            'blocked_user_id' => $id,
        ]);

        return response()->json(['data' => ['message' => 'Utilisateur bloqué']], 201);
    }

    public function unblock(Request $request, string $id): JsonResponse
    {
        BlockedUser::where('blocker_user_id', $request->user()->id)
            ->where('blocked_user_id', $id)
            ->delete();

        return response()->json(null, 204);
    }
}
