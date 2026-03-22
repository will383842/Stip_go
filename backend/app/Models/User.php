<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\HasApiTokens;

/**
 * @property string $id
 * @property string $name
 * @property string $username
 * @property string|null $email
 * @property string|null $phone
 * @property string|null $apple_id
 * @property string|null $google_id
 * @property string|null $avatar_url
 * @property string $locale
 * @property string|null $country_code
 * @property string|null $timezone
 * @property int|null $birth_year
 * @property int $onboarding_step
 * @property bool $is_premium
 * @property bool $is_beta_tester
 * @property bool $is_activator
 * @property int $level
 * @property int $miles_balance
 * @property string $ref_code
 * @property int $referral_count
 * @property int $encounters_count
 * @property int $sessions_count
 * @property int $total_stamps
 * @property array $top_stamps
 * @property array|null $motivation
 * @property string $passport_level_name
 * @property string|null $profile_mood
 * @property string $profile_color
 * @property array $pinned_countries
 * @property string|null $home_country_code
 * @property Carbon|null $username_changed_at
 * @property Carbon|null $referral_validated_at
 * @property Carbon|null $deleted_at
 * @property Carbon $created_at
 * @property Carbon $updated_at
 */
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

    // --- Sprint 3-4: Social relations ---

    public function friendships(): HasMany
    {
        return $this->hasMany(Friendship::class, 'user_id');
    }

    public function shouts(): HasMany
    {
        return $this->hasMany(Shout::class);
    }

    public function squads(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(Squad::class, 'squad_members')
            ->withPivot('color', 'role', 'weekly_stamps', 'total_stamps', 'joined_at');
    }

    public function pepites(): HasMany
    {
        return $this->hasMany(Pepite::class);
    }

    public function exploredTiles(): HasMany
    {
        return $this->hasMany(ExploredTile::class);
    }

    public function activityFeed(): HasMany
    {
        return $this->hasMany(ActivityFeed::class);
    }

    /**
     * Get accepted friends (both directions).
     */
    public function friends()
    {
        $sent = Friendship::where('user_id', $this->id)->accepted()->pluck('friend_id');
        $received = Friendship::where('friend_id', $this->id)->accepted()->pluck('user_id');

        return User::whereIn('id', $sent->merge($received));
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

    /**
     * Get IDs of all users this user has blocked OR who have blocked this user.
     * Used to filter out blocked users from Shouts, Pépites, Feed, Squad, etc.
     */
    public function blockedUserIds(): array
    {
        return DB::select(
            'SELECT blocked_user_id as uid FROM blocked_users WHERE blocker_user_id = ?
             UNION
             SELECT blocker_user_id as uid FROM blocked_users WHERE blocked_user_id = ?',
            [$this->id, $this->id]
        );
    }

    /**
     * Get flat array of blocked user IDs (for whereNotIn queries).
     */
    public function blockedIds(): array
    {
        return array_column($this->blockedUserIds(), 'uid');
    }

    public function getPassportLevel(): ?PassportLevel
    {
        return PassportLevel::where('min_stamps', '<=', $this->total_stamps)
            ->orderByDesc('min_stamps')
            ->first();
    }
}
