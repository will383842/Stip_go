<?php

use App\Models\Pepite;
use App\Models\PepiteVote;
use App\Models\User;
use Illuminate\Support\Facades\DB;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
});

test('POST /pepites crée une pépite avec localisation', function () {
    $response = $this->postJson('/api/v1/pepites', [
        'lat' => 48.8566,
        'lng' => 2.3522,
        'photo_url' => 'https://r2.stip-me.com/pepites/cafe.jpg',
        'caption' => 'Le meilleur café du quartier !',
    ]);

    $response->assertCreated()
        ->assertJsonPath('data.caption', 'Le meilleur café du quartier !');

    expect(Pepite::count())->toBe(1);
});

test('POST /pepites/{id}/vote accepté si user a stampé < 200m', function () {
    // Create a pepite
    $pepite = Pepite::create([
        'user_id' => $this->user->id,
        'location' => DB::raw("ST_SetSRID(ST_MakePoint(2.3522, 48.8566), 4326)::geography"),
        'photo_url' => 'https://test.com/photo.jpg',
    ]);

    // Create a position within 200m for the voter
    $voter = User::factory()->create();
    DB::statement("
        INSERT INTO positions (id, user_id, location, accuracy, recorded_at)
        VALUES (gen_random_uuid(), ?, ST_SetSRID(ST_MakePoint(2.3523, 48.8567), 4326)::geography, 10, NOW())
    ", [$voter->id]);

    $this->actingAs($voter);

    $response = $this->postJson("/api/v1/pepites/{$pepite->id}/vote");

    $response->assertOk();
    expect($pepite->fresh()->votes_count)->toBe(1);
});

test('POST /pepites/{id}/vote rejeté si user n\'a PAS stampé < 200m → 403', function () {
    $pepite = Pepite::create([
        'user_id' => $this->user->id,
        'location' => DB::raw("ST_SetSRID(ST_MakePoint(2.3522, 48.8566), 4326)::geography"),
        'photo_url' => 'https://test.com/photo.jpg',
    ]);

    $farUser = User::factory()->create();
    // No stamp nearby
    $this->actingAs($farUser);

    $response = $this->postJson("/api/v1/pepites/{$pepite->id}/vote");

    $response->assertForbidden()
        ->assertJsonPath('errors.0.code', 'too_far');
});

test('GET /pepites retourne les pépites dans le rayon demandé', function () {
    // Create a nearby pepite
    DB::statement("
        INSERT INTO pepites (id, user_id, location, photo_url, votes_count, is_active, created_at)
        VALUES (gen_random_uuid(), ?, ST_SetSRID(ST_MakePoint(2.3522, 48.8566), 4326)::geography, 'https://test.com/photo.jpg', 0, true, NOW())
    ", [$this->user->id]);

    $response = $this->getJson('/api/v1/pepites?lat=48.8566&lng=2.3522&radius=5000');

    $response->assertOk()
        ->assertJsonCount(1, 'data');
});
