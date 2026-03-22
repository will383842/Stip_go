<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;

class Shout extends Model
{
    use HasUuids;

    protected $keyType = 'string';

    public $incrementing = false;

    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'location',
        'message',
        'radius_meters',
        'expires_at',
        'participants_count',
        'is_minor',
    ];

    protected function casts(): array
    {
        return [
            'radius_meters' => 'integer',
            'expires_at' => 'datetime',
            'participants_count' => 'integer',
            'is_minor' => 'boolean',
            'created_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function participants(): HasMany
    {
        return $this->hasMany(ShoutParticipant::class);
    }

    public function scopeActive($query)
    {
        return $query->where('expires_at', '>', now());
    }

    /**
     * Find shouts within radius (meters) of a point.
     */
    public function scopeNearby($query, float $lat, float $lng, int $radiusMeters = 2000)
    {
        return $query->whereRaw(
            'ST_DWithin(location, ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography, ?)',
            [$lng, $lat, $radiusMeters]
        );
    }

    /**
     * Get lat/lng from geography column.
     */
    public function getLatAttribute(): ?float
    {
        if (! $this->location) {
            return null;
        }

        return DB::selectOne('SELECT ST_Y(?::geometry) as lat', [$this->location])?->lat;
    }

    public function getLngAttribute(): ?float
    {
        if (! $this->location) {
            return null;
        }

        return DB::selectOne('SELECT ST_X(?::geometry) as lng', [$this->location])?->lng;
    }
}
