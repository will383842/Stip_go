<?php

use App\Models\Friendship;
use App\Models\Position;
use App\Models\Shout;
use App\Models\ShoutParticipant;
use App\Models\User;
use Illuminate\Support\Facades\DB;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);

    // Give user a position
    DB::statement("
        INSERT INTO positions (id, user_id, location, accuracy, recorded_at)
        VALUES (gen_random_uuid(), ?, ST_SetSRID(ST_MakePoint(2.3522, 48.8566), 4326)::geography, 10, NOW())
    ", [$this->user->id]);
});

test('POST /shouts crée un shout avec expires_at = +2h', function () {
    $response = $this->postJson('/api/v1/shouts', [
        'message' => 'Qui veut un café ?',
    ]);

    $response->assertCreated()
        ->assertJsonPath('data.message', 'Qui veut un café ?');

    $shout = Shout::first();
    expect($shout->expires_at)->toBeGreaterThan(now()->addMinutes(119));
    expect($shout->participants_count)->toBe(1); // Creator auto-joined
});

test('GET /shouts retourne les shouts non-expirés dans un rayon de 2km', function () {
    // Create a nearby shout
    DB::statement("
        INSERT INTO shouts (id, user_id, location, message, radius_meters, expires_at, participants_count, is_minor, created_at)
        VALUES (gen_random_uuid(), ?, ST_SetSRID(ST_MakePoint(2.3522, 48.8566), 4326)::geography, 'Test shout', 2000, NOW() + interval '2 hours', 0, false, NOW())
    ", [$this->user->id]);

    $response = $this->getJson('/api/v1/shouts?lat=48.8566&lng=2.3522');

    $response->assertOk()
        ->assertJsonCount(1, 'data');
});

test('POST /shouts/{id}/join incrémente participants_count', function () {
    $shout = Shout::create([
        'user_id' => $this->user->id,
        'location' => DB::raw("ST_SetSRID(ST_MakePoint(2.3522, 48.8566), 4326)::geography"),
        'message' => 'Test',
        'radius_meters' => 2000,
        'expires_at' => now()->addHours(2),
        'participants_count' => 0,
    ]);

    $other = User::factory()->create();
    $this->actingAs($other);

    $response = $this->postJson("/api/v1/shouts/{$shout->id}/join");

    $response->assertOk();
    expect($shout->fresh()->participants_count)->toBe(1);
});

test('Shout expiré non retourné par GET /shouts', function () {
    DB::statement("
        INSERT INTO shouts (id, user_id, location, message, radius_meters, expires_at, participants_count, is_minor, created_at)
        VALUES (gen_random_uuid(), ?, ST_SetSRID(ST_MakePoint(2.3522, 48.8566), 4326)::geography, 'Expired', 2000, NOW() - interval '1 hour', 0, false, NOW())
    ", [$this->user->id]);

    $response = $this->getJson('/api/v1/shouts?lat=48.8566&lng=2.3522');

    $response->assertOk()
        ->assertJsonCount(0, 'data');
});

test('Mineur: shouts visibles uniquement par les amis', function () {
    $minor = User::factory()->create(['birth_year' => (int) date('Y') - 15]);
    $stranger = User::factory()->create();

    // Stranger creates a shout
    DB::statement("
        INSERT INTO shouts (id, user_id, location, message, radius_meters, expires_at, participants_count, is_minor, created_at)
        VALUES (gen_random_uuid(), ?, ST_SetSRID(ST_MakePoint(2.3522, 48.8566), 4326)::geography, 'Not for minors', 2000, NOW() + interval '2 hours', 0, false, NOW())
    ", [$stranger->id]);

    $this->actingAs($minor);

    $response = $this->getJson('/api/v1/shouts?lat=48.8566&lng=2.3522');

    // Minor should not see stranger's shouts (no friendship)
    $response->assertOk()
        ->assertJsonCount(0, 'data');
});
