<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Position extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'user_id',
        'location',
        'accuracy',
        'speed',
        'battery_level',
        'altitude',
        'is_mock',
        'is_suspicious',
        'recorded_at',
    ];

    protected function casts(): array
    {
        return [
            'accuracy' => 'float',
            'speed' => 'float',
            'altitude' => 'float',
            'battery_level' => 'integer',
            'is_mock' => 'boolean',
            'is_suspicious' => 'boolean',
            'recorded_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeRecent($query, int $minutes = 5)
    {
        return $query->where('recorded_at', '>', now()->subMinutes($minutes));
    }

    public function scopeForUser($query, string $userId)
    {
        return $query->where('user_id', $userId);
    }
}
