<?php

use App\Models\ActivityFeed;
use App\Models\Friendship;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->friend = User::factory()->create();
    $this->stranger = User::factory()->create();
    $this->actingAs($this->user);

    // Create accepted friendship
    Friendship::create([
        'user_id' => $this->user->id,
        'friend_id' => $this->friend->id,
        'status' => 'accepted',
    ]);
});

test('GET /feed retourne uniquement les activités des amis (friendship accepted)', function () {
    // Friend activity
    ActivityFeed::create([
        'user_id' => $this->friend->id,
        'type' => 'stamp',
        'content' => ['stamp_type' => 'city', 'city_name' => 'Paris'],
    ]);

    // Stranger activity (should NOT appear)
    ActivityFeed::create([
        'user_id' => $this->stranger->id,
        'type' => 'stamp',
        'content' => ['stamp_type' => 'city', 'city_name' => 'Berlin'],
    ]);

    $response = $this->getJson('/api/v1/feed');

    $response->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.user_id', $this->friend->id);
});

test('Activity feed inséré après stamp/badge/level_up', function () {
    ActivityFeed::create([
        'user_id' => $this->friend->id,
        'type' => 'level_up',
        'content' => ['new_level' => 5, 'level_name' => 'Explorateur'],
    ]);

    ActivityFeed::create([
        'user_id' => $this->friend->id,
        'type' => 'badge',
        'content' => ['badge_code' => 'five_countries', 'badge_name' => '5 Pays'],
    ]);

    $response = $this->getJson('/api/v1/feed');

    $response->assertOk()
        ->assertJsonCount(2, 'data');
});

test('Feed pagination avec cursor', function () {
    // Create 25 activities
    for ($i = 0; $i < 25; $i++) {
        ActivityFeed::create([
            'user_id' => $this->friend->id,
            'type' => 'stamp',
            'content' => ['stamp_type' => 'spot', 'index' => $i],
        ]);
    }

    $response = $this->getJson('/api/v1/feed');

    $response->assertOk()
        ->assertJsonCount(20, 'data') // Default limit 20
        ->assertJsonPath('meta.has_more', true);

    // Page 2 with cursor
    $cursor = $response->json('meta.cursor');
    $response2 = $this->getJson("/api/v1/feed?cursor={$cursor}");

    $response2->assertOk()
        ->assertJsonCount(5, 'data')
        ->assertJsonPath('meta.has_more', false);
});
