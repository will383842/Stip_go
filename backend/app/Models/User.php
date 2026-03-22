<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, HasUuids, SoftDeletes;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'name',
        'username',
        'email',
        'phone',
        'apple_id',
        'google_id',
        'firebase_uid',
        'avatar_url',
        'locale',
        'country_code',
        'timezone',
        'birth_year',
        'onboarding_step',
        'is_premium',
        'level',
        'miles_balance',
        'ref_code',
        'referral_count',
        'encounters_count',
        'sessions_count',
        'referred_by',
        'referral_validated_at',
        'username_changed_at',
        'total_stamps',
        'top_stamps',
        'motivation',
        'passport_level_name',
        'profile_mood',
        'profile_color',
        'pinned_countries',
        'home_city_id',
        'home_country_code',
    ];

    protected $hidden = [
        'remember_token',
        'apple_id',
        'google_id',
        'firebase_uid',
        'deleted_at',
    ];

    protected function casts(): array
    {
        return [
            'top_stamps' => 'array',
            'motivation' => 'array',
            'pinned_countries' => 'array',
            'birth_year' => 'integer',
            'onboarding_step' => 'integer',
            'is_premium' => 'boolean',
            'is_beta_tester' => 'boolean',
            'is_activator' => 'boolean',
            'total_stamps' => 'integer',
            'miles_balance' => 'integer',
            'referral_count' => 'integer',
            'premium_expires_at' => 'datetime',
            'username_changed_at' => 'datetime',
            'referral_validated_at' => 'datetime',
            'deleted_at' => 'datetime',
        ];
    }

    public function settings(): HasOne
    {
        return $this->hasOne(UserSetting::class);
    }

    public function devices(): HasMany
    {
        return $this->hasMany(UserDevice::class);
    }

    public function stamps(): HasMany
    {
        return $this->hasMany(PassportStamp::class);
    }

    public function positions(): HasMany
    {
        return $this->hasMany(Position::class);
    }

    public function userBadges(): HasMany
    {
        return $this->hasMany(UserBadge::class);
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }

    public function isMinor(): bool
    {
        if (! $this->birth_year) {
            return false;
        }

        $age = (int) date('Y') - $this->birth_year;

        return $age >= 13 && $age < 18;
    }

    public function isUnderage(): bool
    {
        if (! $this->birth_year) {
            return false;
        }

        return ((int) date('Y') - $this->birth_year) < 13;
    }

    public function getPassportLevel(): ?PassportLevel
    {
        return PassportLevel::where('min_stamps', '<=', $this->total_stamps)
            ->orderByDesc('min_stamps')
            ->first();
    }
}
