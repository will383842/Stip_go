<?php

use App\Models\Friendship;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->friend = User::factory()->create();
    $this->actingAs($this->user);
});

test('POST /friends/{id}/request crée une friendship pending', function () {
    $response = $this->postJson("/api/v1/friends/{$this->friend->id}/request");

    $response->assertCreated()
        ->assertJsonPath('data.status', 'pending');

    $this->assertDatabaseHas('friendships', [
        'user_id' => $this->user->id,
        'friend_id' => $this->friend->id,
        'status' => 'pending',
    ]);
});

test('POST /friends/{id}/accept passe la friendship à accepted', function () {
    Friendship::create([
        'user_id' => $this->friend->id,
        'friend_id' => $this->user->id,
        'status' => 'pending',
    ]);

    $response = $this->postJson("/api/v1/friends/{$this->friend->id}/accept");

    $response->assertOk()
        ->assertJsonPath('data.status', 'accepted');
});

test('DELETE /friends/{id} supprime la friendship', function () {
    Friendship::create([
        'user_id' => $this->user->id,
        'friend_id' => $this->friend->id,
        'status' => 'accepted',
    ]);

    $response = $this->deleteJson("/api/v1/friends/{$this->friend->id}");

    $response->assertOk();
    $this->assertDatabaseMissing('friendships', [
        'user_id' => $this->user->id,
        'friend_id' => $this->friend->id,
    ]);
});

test('cannot send friend request to self', function () {
    $response = $this->postJson("/api/v1/friends/{$this->user->id}/request");

    $response->assertStatus(422)
        ->assertJsonPath('errors.0.code', 'self_request');
});

test('duplicate friend request returns 409', function () {
    Friendship::create([
        'user_id' => $this->user->id,
        'friend_id' => $this->friend->id,
        'status' => 'pending',
    ]);

    $response = $this->postJson("/api/v1/friends/{$this->friend->id}/request");

    $response->assertStatus(409)
        ->assertJsonPath('errors.0.code', 'already_exists');
});

test('Mineur ne peut pas envoyer de DM à un non-ami → 403', function () {
    $minor = User::factory()->create(['birth_year' => (int) date('Y') - 15]);
    $stranger = User::factory()->create();

    $this->actingAs($minor);

    $response = $this->postJson('/api/v1/dm', [
        'receiver_user_id' => $stranger->id,
        'content' => 'Hello!',
    ]);

    $response->assertForbidden()
        ->assertJsonPath('errors.0.code', 'minor_friends_only');
});
