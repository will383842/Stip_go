<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SquadMember extends Model
{
    public $timestamps = false;

    public $incrementing = false;

    protected $primaryKey = null;

    protected $fillable = [
        'squad_id',
        'user_id',
        'color',
        'role',
        'weekly_stamps',
        'total_stamps',
        'last_stamp_at',
        'joined_at',
    ];

    protected function casts(): array
    {
        return [
            'weekly_stamps' => 'integer',
            'total_stamps' => 'integer',
            'last_stamp_at' => 'datetime',
            'joined_at' => 'datetime',
        ];
    }

    public function squad(): BelongsTo
    {
        return $this->belongsTo(Squad::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Squad member colors (8 max).
     */
    public const COLORS = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
        '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
    ];

    /**
     * Get the next available color for a squad.
     */
    public static function nextColor(string $squadId): string
    {
        $usedColors = static::where('squad_id', $squadId)->pluck('color')->toArray();

        foreach (self::COLORS as $color) {
            if (! in_array($color, $usedColors)) {
                return $color;
            }
        }

        return self::COLORS[0];
    }
}
