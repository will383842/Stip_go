<?php

namespace App\Events;

use App\Models\DirectMessage;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public DirectMessage $message,
        public string $conversationId,
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("dm.{$this->conversationId}"),
        ];
    }

    public function broadcastAs(): string
    {
        return 'message.sent';
    }

    public function broadcastWith(): array
    {
        return [
            'message' => [
                'id' => $this->message->id,
                'conversation_id' => $this->conversationId,
                'sender_user_id' => $this->message->sender_user_id,
                'sender' => $this->message->sender?->only('id', 'name', 'username', 'avatar_url'),
                'content' => $this->message->content,
                'photo_url' => $this->message->photo_url,
                'audio_url' => $this->message->audio_url,
                'audio_duration_sec' => $this->message->audio_duration_sec,
                'created_at' => $this->message->created_at?->toISOString(),
            ],
        ];
    }
}
