<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DirectMessage extends Model
{
    use HasUuids;

    protected $keyType = 'string';

    public $incrementing = false;

    public $timestamps = false;

    protected $fillable = [
        'conversation_id',
        'sender_user_id',
        'content',
        'photo_url',
        'audio_url',
        'audio_duration_sec',
        'reactions',
        'read_at',
        'deleted_by_sender',
        'deleted_by_receiver',
    ];

    protected function casts(): array
    {
        return [
            'reactions' => 'array',
            'audio_duration_sec' => 'integer',
            'read_at' => 'datetime',
            'deleted_by_sender' => 'boolean',
            'deleted_by_receiver' => 'boolean',
            'created_at' => 'datetime',
        ];
    }

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_user_id');
    }
}
