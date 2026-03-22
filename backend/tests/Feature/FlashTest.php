<?php

use App\Models\User;
use Illuminate\Support\Facades\Redis;

beforeEach(function () {
    $this->user = User::factory()->create(['miles_balance' => 100]);
    $this->actingAs($this->user);
});

test('GET /stamps/flash/today retourne le POI du jour pour la zone', function () {
    // Seed a flash in Redis
    $flashData = json_encode([
        'id' => 'test-flash-id',
        'location' => ['lat' => 48.86, 'lng' => 2.35],
        'name' => 'Flash Test',
        'expires_at' => now()->endOfDay()->toISOString(),
    ]);

    Redis::setex('daily_stamp:48.86:2.35', 86400, $flashData);

    $response = $this->getJson('/api/v1/stamps/flash/today?lat=48.8566&lng=2.3522');

    $response->assertOk()
        ->assertJsonPath('data.name', 'Flash Test')
        ->assertJsonPath('data.captured', false)
        ->assertJsonPath('data.miles_bonus', 25);
});

test('POST /stamps/flash/capture accorde +25 Miles et marque captured', function () {
    $response = $this->postJson('/api/v1/stamps/flash/capture');

    $response->assertOk()
        ->assertJsonPath('data.captured', true)
        ->assertJsonPath('data.miles_bonus', 25)
        ->assertJsonPath('data.new_miles_balance', 125);

    expect($this->user->fresh()->miles_balance)->toBe(125);
    expect(Redis::get("user:{$this->user->id}:daily_flash_captured"))->toBe('1');
});

test('POST /stamps/flash/capture une 2ème fois → 409 déjà capturé', function () {
    Redis::setex("user:{$this->user->id}:daily_flash_captured", 86400, '1');

    $response = $this->postJson('/api/v1/stamps/flash/capture');

    $response->assertStatus(409)
        ->assertJsonPath('errors.0.code', 'already_captured');
});
