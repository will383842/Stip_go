<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Friendship extends Model
{
    use HasUuids;

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'user_id',
        'friend_id',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function friend(): BelongsTo
    {
        return $this->belongsTo(User::class, 'friend_id');
    }

    public function scopeAccepted($query)
    {
        return $query->where('status', 'accepted');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Check if two users are friends (either direction).
     */
    public static function areFriends(string $userA, string $userB): bool
    {
        return static::where('status', 'accepted')
            ->where(function ($q) use ($userA, $userB) {
                $q->where(function ($q2) use ($userA, $userB) {
                    $q2->where('user_id', $userA)->where('friend_id', $userB);
                })->orWhere(function ($q2) use ($userA, $userB) {
                    $q2->where('user_id', $userB)->where('friend_id', $userA);
                });
            })->exists();
    }
}
