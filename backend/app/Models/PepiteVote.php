<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PepiteVote extends Model
{
    public $timestamps = false;

    public $incrementing = false;

    protected $primaryKey = null;

    protected $fillable = ['pepite_id', 'user_id', 'voted_at'];

    protected function casts(): array
    {
        return [
            'voted_at' => 'datetime',
        ];
    }

    public function pepite(): BelongsTo
    {
        return $this->belongsTo(Pepite::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
