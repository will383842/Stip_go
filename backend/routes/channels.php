<?php

use App\Models\Conversation;
use App\Models\SquadMember;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return $user->id === $id;
});

// DM conversation — only participants
Broadcast::channel('dm.{conversationId}', function ($user, $conversationId) {
    $conversation = Conversation::find($conversationId);

    return $conversation && ($conversation->user_a_id === $user->id || $conversation->user_b_id === $user->id);
});

// Squad — only members
Broadcast::channel('squad.{squadId}', function ($user, $squadId) {
    return SquadMember::where('squad_id', $squadId)->where('user_id', $user->id)->exists();
});

// Personal notifications
Broadcast::channel('user.{userId}.notifications', function ($user, $userId) {
    return $user->id === $userId;
});
