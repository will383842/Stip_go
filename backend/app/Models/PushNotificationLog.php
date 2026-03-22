<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Cache;

class PushNotificationLog extends Model
{
    use HasUuids;

    protected $keyType = 'string';

    public $incrementing = false;

    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'notification_type',
        'title',
        'body',
        'deeplink',
        'sent_at',
        'received_at',
        'opened_at',
    ];

    protected function casts(): array
    {
        return [
            'sent_at' => 'datetime',
            'received_at' => 'datetime',
            'opened_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Check if user has reached daily push limit.
     */
    public static function canSendTo(string $userId): bool
    {
        $key = "user:{$userId}:daily_notification_count";
        $count = (int) Cache::get($key, 0);

        return $count < config('stipme.notifications.max_per_day', 5);
    }

    /**
     * Increment daily push count.
     */
    public static function incrementDailyCount(string $userId): void
    {
        $key = "user:{$userId}:daily_notification_count";
        $current = (int) Cache::get($key, 0);
        Cache::put($key, $current + 1, 86400); // 24h TTL
    }
}
