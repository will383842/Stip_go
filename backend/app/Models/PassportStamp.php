<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PassportStamp extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'user_id',
        'stamp_type',
        'country_code',
        'region_name',
        'city_name',
        'spot_name',
        'spot_category',
        'source',
        'stamped_at',
        'animation_seen',
        'shared',
        'is_golden',
    ];

    protected function casts(): array
    {
        return [
            'stamped_at' => 'datetime',
            'animation_seen' => 'boolean',
            'shared' => 'boolean',
            'is_golden' => 'boolean',
            'visits_count' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('stamp_type', $type);
    }

    public function scopeCountries($query)
    {
        return $query->where('stamp_type', 'country');
    }

    public function scopeCities($query)
    {
        return $query->where('stamp_type', 'city');
    }

    public function scopeRegions($query)
    {
        return $query->where('stamp_type', 'region');
    }

    public function scopeSpots($query)
    {
        return $query->where('stamp_type', 'spot');
    }

    public function scopeVerified($query)
    {
        return $query->whereIn('source', ['gps', 'imported']);
    }

    public function scopeDeclared($query)
    {
        return $query->where('source', 'declared');
    }
}
