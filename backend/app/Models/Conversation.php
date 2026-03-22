<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Conversation extends Model
{
    use HasUuids;

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'user_a_id',
        'user_b_id',
        'type',
        'last_message_at',
        'last_message_preview',
        'unread_count_a',
        'unread_count_b',
        'common_stamps_count',
    ];

    protected function casts(): array
    {
        return [
            'last_message_at' => 'datetime',
            'created_at' => 'datetime',
            'unread_count_a' => 'integer',
            'unread_count_b' => 'integer',
            'common_stamps_count' => 'integer',
        ];
    }

    public function userA(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_a_id');
    }

    public function userB(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_b_id');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(DirectMessage::class);
    }

    /**
     * Get the other user in the conversation.
     */
    public function otherUser(string $currentUserId): BelongsTo
    {
        $otherField = $this->user_a_id === $currentUserId ? 'user_b_id' : 'user_a_id';

        return $this->belongsTo(User::class, $otherField);
    }

    /**
     * Get the unread count for a specific user.
     */
    public function unreadCountFor(string $userId): int
    {
        return $this->user_a_id === $userId ? $this->unread_count_a : $this->unread_count_b;
    }

    /**
     * Find or create a conversation between two users (canonical order).
     */
    public static function findOrCreateBetween(string $userA, string $userB): self
    {
        [$first, $second] = strcmp($userA, $userB) < 0 ? [$userA, $userB] : [$userB, $userA];

        return static::firstOrCreate(
            ['user_a_id' => $first, 'user_b_id' => $second, 'type' => 'dm'],
            ['unread_count_a' => 0, 'unread_count_b' => 0]
        );
    }
}
