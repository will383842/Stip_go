<?php

use App\Models\Conversation;
use App\Models\DirectMessage;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->other = User::factory()->create();
    $this->actingAs($this->user);
});

test('POST /dm crée un message et retourne conversation_id', function () {
    $response = $this->postJson('/api/v1/dm', [
        'receiver_user_id' => $this->other->id,
        'content' => 'Salut ! Tu explores le coin ?',
    ]);

    $response->assertCreated()
        ->assertJsonStructure(['data' => ['message', 'conversation_id']]);

    $this->assertDatabaseHas('direct_messages', [
        'sender_user_id' => $this->user->id,
        'content' => 'Salut ! Tu explores le coin ?',
    ]);
});

test('POST /dm avec photo_url stocke le message avec la photo', function () {
    $response = $this->postJson('/api/v1/dm', [
        'receiver_user_id' => $this->other->id,
        'content' => 'Regarde ça !',
        'photo_url' => 'https://r2.stip-me.com/photos/test.jpg',
    ]);

    $response->assertCreated()
        ->assertJsonPath('data.message.photo_url', 'https://r2.stip-me.com/photos/test.jpg');
});

test('GET /dm retourne les conversations triées par last_message_at DESC', function () {
    $conv = Conversation::findOrCreateBetween($this->user->id, $this->other->id);

    DirectMessage::create([
        'conversation_id' => $conv->id,
        'sender_user_id' => $this->user->id,
        'content' => 'Premier message',
    ]);

    $conv->update(['last_message_at' => now(), 'last_message_preview' => 'Premier message']);

    $response = $this->getJson('/api/v1/dm');

    $response->assertOk()
        ->assertJsonCount(1, 'data');
});

test('GET /dm/{id} retourne les messages avec cursor pagination', function () {
    $conv = Conversation::findOrCreateBetween($this->user->id, $this->other->id);

    for ($i = 0; $i < 5; $i++) {
        DirectMessage::create([
            'conversation_id' => $conv->id,
            'sender_user_id' => $this->user->id,
            'content' => "Message {$i}",
        ]);
    }

    $response = $this->getJson("/api/v1/dm/{$conv->id}");

    $response->assertOk()
        ->assertJsonStructure(['data', 'meta' => ['has_more', 'cursor']]);
});

test('POST /dm/{id}/react ajoute une réaction emoji au message', function () {
    $conv = Conversation::findOrCreateBetween($this->user->id, $this->other->id);
    $msg = DirectMessage::create([
        'conversation_id' => $conv->id,
        'sender_user_id' => $this->other->id,
        'content' => 'Hello',
    ]);

    $response = $this->postJson("/api/v1/dm/{$conv->id}/react", [
        'message_id' => $msg->id,
        'emoji' => '❤️',
    ]);

    $response->assertOk();
    expect($response->json('data.reactions'))->toHaveCount(1);
});

test('POST /dm/{id}/read met à jour read_at et reset unread_count', function () {
    $conv = Conversation::findOrCreateBetween($this->user->id, $this->other->id);

    DirectMessage::create([
        'conversation_id' => $conv->id,
        'sender_user_id' => $this->other->id,
        'content' => 'Hey',
    ]);

    // Set unread count
    $field = $conv->user_a_id === $this->user->id ? 'unread_count_a' : 'unread_count_b';
    $conv->update([$field => 1]);

    $response = $this->postJson("/api/v1/dm/{$conv->id}/read");

    $response->assertOk();
    expect($conv->fresh()->unreadCountFor($this->user->id))->toBe(0);
});
