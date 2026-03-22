<?php

namespace App\Events;

use App\Models\Squad;
use App\Models\User;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SquadMemberJoined implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Squad $squad,
        public User $user,
        public string $color,
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("squad.{$this->squad->id}"),
        ];
    }

    public function broadcastAs(): string
    {
        return 'member.joined';
    }

    public function broadcastWith(): array
    {
        return [
            'squad_id' => $this->squad->id,
            'user' => $this->user->only('id', 'name', 'username', 'avatar_url'),
            'color' => $this->color,
            'member_count' => $this->squad->member_count,
        ];
    }
}
