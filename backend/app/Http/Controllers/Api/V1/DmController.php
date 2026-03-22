<?php

namespace App\Http\Controllers\Api\V1;

use App\Events\MessageSent;
use App\Http\Controllers\Controller;
use App\Models\BlockedUser;
use App\Models\Conversation;
use App\Models\DirectMessage;
use App\Models\Friendship;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redis;

class DmController extends Controller
{
    /**
     * GET /dm — My conversations.
     */
    public function conversations(Request $request): JsonResponse
    {
        $user = $request->user();

        $conversations = Conversation::where('user_a_id', $user->id)
            ->orWhere('user_b_id', $user->id)
            ->orderByDesc('last_message_at')
            ->get()
            ->map(function ($conv) use ($user) {
                $otherId = $conv->user_a_id === $user->id ? $conv->user_b_id : $conv->user_a_id;
                $conv->other_user = \App\Models\User::select('id', 'name', 'username', 'avatar_url', 'profile_color')
                    ->find($otherId);
                $conv->unread_count = $conv->unreadCountFor($user->id);

                return $conv;
            });

        return response()->json(['data' => $conversations]);
    }

    /**
     * POST /dm — Send message.
     */
    public function send(Request $request): JsonResponse
    {
        $request->validate([
            'receiver_user_id' => 'required|uuid|exists:users,id',
            'content' => 'required|string|max:'.config('stipme.dm.max_message_length', 2000),
            'photo_url' => 'nullable|string|url|max:500',
            'audio_url' => 'nullable|string|url|max:500',
            'audio_duration_sec' => 'nullable|integer|min:1|max:'.config('stipme.dm.vocal_max_seconds', 60),
        ]);

        $user = $request->user();
        $receiverId = $request->receiver_user_id;

        if ($user->id === $receiverId) {
            return response()->json([
                'data' => null,
                'errors' => [['code' => 'self_message', 'message' => 'Cannot message yourself']],
            ], 422);
        }

        // Block check
        $isBlocked = BlockedUser::where(function ($q) use ($user, $receiverId) {
            $q->where('blocker_user_id', $user->id)->where('blocked_user_id', $receiverId);
        })->orWhere(function ($q) use ($user, $receiverId) {
            $q->where('blocker_user_id', $receiverId)->where('blocked_user_id', $user->id);
        })->exists();

        if ($isBlocked) {
            return response()->json([
                'data' => null,
                'errors' => [['code' => 'blocked', 'message' => 'Cannot send message']],
            ], 403);
        }

        // Minor protection: minors can only DM accepted friends
        if ($user->isMinor()) {
            if (! Friendship::areFriends($user->id, $receiverId)) {
                return response()->json([
                    'data' => null,
                    'errors' => [['code' => 'minor_friends_only', 'message' => 'Minors can only message accepted friends']],
                ], 403);
            }
        }

        // Find or create conversation
        $conversation = Conversation::findOrCreateBetween($user->id, $receiverId);

        // Create message
        $message = DirectMessage::create([
            'conversation_id' => $conversation->id,
            'sender_user_id' => $user->id,
            'content' => $request->content,
            'photo_url' => $request->photo_url,
            'audio_url' => $request->audio_url,
            'audio_duration_sec' => $request->audio_duration_sec,
            'reactions' => [],
        ]);

        // Update conversation metadata
        $preview = mb_substr($request->content, 0, 100);
        $unreadField = $conversation->user_a_id === $receiverId ? 'unread_count_a' : 'unread_count_b';

        $conversation->update([
            'last_message_at' => now(),
            'last_message_preview' => $preview,
            $unreadField => $conversation->$unreadField + 1,
        ]);

        // Update Redis unread count
        Redis::incr("user:{$receiverId}:unread_dm_count");
        Redis::expire("user:{$receiverId}:unread_dm_count", 86400);

        // Broadcast via WebSocket
        broadcast(new MessageSent($message->load('sender:id,name,username,avatar_url'), $conversation->id))->toOthers();

        return response()->json([
            'data' => [
                'message' => $message->load('sender:id,name,username,avatar_url'),
                'conversation_id' => $conversation->id,
            ],
        ], 201);
    }

    /**
     * GET /dm/{conversation_id} — Messages in a conversation (cursor pagination).
     */
    public function messages(Request $request, string $conversationId): JsonResponse
    {
        $user = $request->user();

        $conversation = Conversation::where('id', $conversationId)
            ->where(function ($q) use ($user) {
                $q->where('user_a_id', $user->id)->orWhere('user_b_id', $user->id);
            })->firstOrFail();

        // Filter soft-deleted messages at SQL level for correct pagination
        $query = DirectMessage::where('conversation_id', $conversation->id)
            ->where(function ($q) use ($user) {
                $q->where(function ($q2) use ($user) {
                    // Not deleted by sender (if I'm the sender)
                    $q2->where('sender_user_id', $user->id)->where('deleted_by_sender', false);
                })->orWhere(function ($q2) use ($user) {
                    // Not deleted by receiver (if I'm the receiver)
                    $q2->where('sender_user_id', '!=', $user->id)->where('deleted_by_receiver', false);
                });
            })
            ->orderByDesc('created_at');

        if ($request->has('cursor')) {
            $query->where('created_at', '<', $request->cursor);
        }

        $messages = $query->limit(30)->with('sender:id,name,username,avatar_url')->get();

        return response()->json([
            'data' => $messages,
            'meta' => [
                'has_more' => $messages->count() === 30,
                'cursor' => $messages->last()?->created_at?->toISOString(),
            ],
        ]);
    }

    /**
     * POST /dm/{conversation_id}/react — React to a message.
     */
    public function react(Request $request, string $conversationId): JsonResponse
    {
        $request->validate([
            'message_id' => 'required|uuid',
            'emoji' => 'required|string|max:4',
        ]);

        $user = $request->user();

        $message = DirectMessage::where('id', $request->message_id)
            ->where('conversation_id', $conversationId)
            ->firstOrFail();

        $reactions = $message->reactions ?? [];

        // Remove existing reaction from this user
        $reactions = array_filter($reactions, fn ($r) => $r['user_id'] !== $user->id);

        // Add new reaction
        $reactions[] = ['user_id' => $user->id, 'emoji' => $request->emoji];

        $message->update(['reactions' => array_values($reactions)]);

        return response()->json(['data' => $message->fresh()]);
    }

    /**
     * POST /dm/{conversation_id}/read — Mark conversation as read.
     */
    public function markRead(Request $request, string $conversationId): JsonResponse
    {
        $user = $request->user();

        $conversation = Conversation::where('id', $conversationId)
            ->where(function ($q) use ($user) {
                $q->where('user_a_id', $user->id)->orWhere('user_b_id', $user->id);
            })->firstOrFail();

        // Reset unread count
        $unreadField = $conversation->user_a_id === $user->id ? 'unread_count_a' : 'unread_count_b';
        $conversation->update([$unreadField => 0]);

        // Mark all unread messages as read
        DirectMessage::where('conversation_id', $conversation->id)
            ->where('sender_user_id', '!=', $user->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        // Reset Redis counter
        Redis::del("user:{$user->id}:unread_dm_count");

        return response()->json(['data' => null]);
    }
}
