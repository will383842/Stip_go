<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Squad extends Model
{
    use HasUuids;

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'name',
        'emoji',
        'creator_user_id',
        'invite_code',
        'total_stamps',
        'current_streak',
        'max_streak',
        'streak_last_checked',
        'member_count',
        'is_temporary',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'total_stamps' => 'integer',
            'current_streak' => 'integer',
            'max_streak' => 'integer',
            'member_count' => 'integer',
            'is_temporary' => 'boolean',
            'streak_last_checked' => 'datetime',
            'expires_at' => 'datetime',
            'created_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Squad $squad) {
            if (! $squad->invite_code) {
                $squad->invite_code = Str::upper(Str::random(8));
            }
        });
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'creator_user_id');
    }

    public function members(): HasMany
    {
        return $this->hasMany(SquadMember::class);
    }

    public function stamps(): HasMany
    {
        return $this->hasMany(SquadStamp::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(SquadMessage::class);
    }

    public function isFull(): bool
    {
        return $this->member_count >= config('stipme.squad.max_members', 8);
    }
}
