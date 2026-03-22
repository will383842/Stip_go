<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
    public function social(Request $request): JsonResponse
    {
        $request->validate([
            'provider' => 'required|in:apple,google',
            'token' => 'required|string',
        ]);

        try {
            $socialUser = Socialite::driver($request->provider)
                ->stateless()
                ->userFromToken($request->token);
        } catch (\Exception $e) {
            return response()->json([
                'data' => null,
                'errors' => [['code' => 'invalid_token', 'message' => 'Invalid social token']],
            ], 401);
        }

        $providerIdColumn = $request->provider === 'apple' ? 'apple_id' : 'google_id';

        $user = User::where($providerIdColumn, $socialUser->getId())->first();

        if (! $user) {
            $user = User::where('email', $socialUser->getEmail())->first();

            if ($user) {
                $user->update([$providerIdColumn => $socialUser->getId()]);
            } else {
                $user = $this->createUser([
                    'name' => $socialUser->getName() ?? $socialUser->getNickname() ?? 'Voyageur',
                    'email' => $socialUser->getEmail(),
                    $providerIdColumn => $socialUser->getId(),
                    'avatar_url' => $socialUser->getAvatar(),
                ]);
            }
        }

        $token = $user->createToken('auth', ['*'], now()->addDays(7))->plainTextToken;

        return response()->json([
            'data' => [
                'user' => $user->load('settings'),
                'token' => $token,
                'token_type' => 'Bearer',
            ],
            'meta' => [],
            'errors' => [],
        ], 200);
    }

    public function sendOtp(Request $request): JsonResponse
    {
        $request->validate(['email' => 'required|email']);

        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        Cache::put("otp:{$request->email}", $code, now()->addMinutes(10));

        Mail::raw("Ton code Stip Me : {$code}", function ($message) use ($request) {
            $message->to($request->email)->subject('Code de connexion Stip Me');
        });

        return response()->json([
            'data' => ['message' => 'OTP sent'],
            'meta' => [],
            'errors' => [],
        ]);
    }

    public function verifyOtp(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|string|size:6',
        ]);

        $cached = Cache::get("otp:{$request->email}");

        if (! $cached || $cached !== $request->code) {
            return response()->json([
                'data' => null,
                'errors' => [['code' => 'invalid_otp', 'message' => 'Code invalide ou expiré']],
            ], 422);
        }

        Cache::forget("otp:{$request->email}");

        $user = User::where('email', $request->email)->first();

        if (! $user) {
            $user = $this->createUser(['email' => $request->email, 'name' => 'Voyageur']);
        }

        $token = $user->createToken('auth', ['*'], now()->addDays(7))->plainTextToken;

        return response()->json([
            'data' => [
                'user' => $user->load('settings'),
                'token' => $token,
                'token_type' => 'Bearer',
            ],
            'meta' => [],
            'errors' => [],
        ]);
    }

    public function sendMagicLink(Request $request): JsonResponse
    {
        $request->validate(['email' => 'required|email']);

        $token = Str::random(64);
        Cache::put("magic:{$token}", $request->email, now()->addMinutes(10));

        $link = "stipme://auth/verify?token={$token}";

        Mail::raw("Connecte-toi à Stip Me : {$link}", function ($message) use ($request) {
            $message->to($request->email)->subject('Connexion Stip Me');
        });

        return response()->json([
            'data' => ['message' => 'Magic link sent'],
            'meta' => [],
            'errors' => [],
        ]);
    }

    public function verifyMagicLink(Request $request): JsonResponse
    {
        $request->validate(['token' => 'required|string']);

        $email = Cache::get("magic:{$request->token}");

        if (! $email) {
            return response()->json([
                'data' => null,
                'errors' => [['code' => 'invalid_link', 'message' => 'Lien invalide ou expiré']],
            ], 422);
        }

        Cache::forget("magic:{$request->token}");

        $user = User::where('email', $email)->first();
        if (! $user) {
            $user = $this->createUser(['email' => $email, 'name' => 'Voyageur']);
        }

        $token = $user->createToken('auth', ['*'], now()->addDays(7))->plainTextToken;

        return response()->json([
            'data' => [
                'user' => $user->load('settings'),
                'token' => $token,
                'token_type' => 'Bearer',
            ],
            'meta' => [],
            'errors' => [],
        ]);
    }

    public function checkUsername(Request $request): JsonResponse
    {
        $request->validate(['q' => 'required|string|regex:/^[a-z0-9_]{3,30}$/']);

        $available = ! User::where('username', $request->q)->exists();

        return response()->json([
            'data' => ['available' => $available],
            'meta' => [],
            'errors' => [],
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load(['settings', 'userBadges.badge']);

        $passportLevel = $user->getPassportLevel();
        if ($passportLevel) {
            $user->passport_level_name = $passportLevel->name[$user->locale] ?? $passportLevel->name['en'] ?? $user->passport_level_name;
            $user->save();
        }

        return response()->json([
            'data' => $user,
            'meta' => [],
            'errors' => [],
        ]);
    }

    private function createUser(array $data): User
    {
        $baseName = Str::lower(Str::ascii($data['name'] ?? 'voyageur'));
        $baseName = preg_replace('/[^a-z0-9_]/', '_', $baseName);
        $baseName = substr($baseName, 0, 25);

        do {
            $username = $baseName . '_' . random_int(1000, 9999);
        } while (User::where('username', $username)->exists());

        do {
            $refCode = Str::upper(Str::random(8));
        } while (User::where('ref_code', $refCode)->exists());

        $user = User::create(array_merge($data, [
            'username' => $username,
            'ref_code' => $refCode,
            'onboarding_step' => 2,
        ]));

        UserSetting::create(['user_id' => $user->id]);

        return $user;
    }
}
