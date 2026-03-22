<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;

class Pepite extends Model
{
    use HasUuids;

    protected $keyType = 'string';

    public $incrementing = false;

    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'location',
        'city',
        'spot_name',
        'description',
        'photo_url',
        'caption',
        'votes_count',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'votes_count' => 'integer',
            'is_active' => 'boolean',
            'created_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function votes(): HasMany
    {
        return $this->hasMany(PepiteVote::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeNearby($query, float $lat, float $lng, int $radiusMeters = 5000)
    {
        return $query->whereRaw(
            'ST_DWithin(location, ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography, ?)',
            [$lng, $lat, $radiusMeters]
        );
    }

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
