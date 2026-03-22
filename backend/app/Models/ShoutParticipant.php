<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ShoutParticipant extends Model
{
    public $timestamps = false;

    public $incrementing = false;

    // Composite PK via UNIQUE constraint — no single PK for Eloquent
    protected $primaryKey = null;

    protected $fillable = ['shout_id', 'user_id', 'joined_at'];

    protected function casts(): array
    {
        return [
            'joined_at' => 'datetime',
        ];
    }

    public function shout(): BelongsTo
    {
        return $this->belongsTo(Shout::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
