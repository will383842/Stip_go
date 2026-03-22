<?php

namespace App\Events;

use App\Models\SquadStamp;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SquadStampCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public SquadStamp $stamp,
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("squad.{$this->stamp->squad_id}"),
        ];
    }

    public function broadcastAs(): string
    {
        return 'stamp.created';
    }

    public function broadcastWith(): array
    {
        return [
            'stamp' => [
                'id' => $this->stamp->id,
                'squad_id' => $this->stamp->squad_id,
                'user_id' => $this->stamp->user_id,
                'user' => $this->stamp->user?->only('id', 'name', 'username', 'avatar_url'),
                'stamp_type' => $this->stamp->stamp_type,
                'caption' => $this->stamp->caption,
                'created_at' => $this->stamp->created_at?->toISOString(),
            ],
        ];
    }
}
