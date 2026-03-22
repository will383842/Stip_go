<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActivityFeed extends Model
{
    use HasUuids;

    protected $table = 'activity_feed';

    protected $keyType = 'string';

    public $incrementing = false;

    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'type',
        'actor_user_id',
        'stamp_id',
        'content',
    ];

    protected function casts(): array
    {
        return [
            'content' => 'array',
            'created_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public const TYPES = [
        'stamp', 'level_up', 'badge', 'squad_join',
        'flash_capture', 'country', 'pepite_created', 'milestone',
    ];
}
