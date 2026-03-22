<?php

use App\Models\ExploredTile;
use App\Models\User;
use Illuminate\Support\Facades\Redis;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
});

test('Stamp crée un explored_tile H3 index', function () {
    ExploredTile::create([
        'user_id' => $this->user->id,
        'h3_index' => '8_48.857_2.352',
        'first_visited_at' => now(),
    ]);

    expect(ExploredTile::where('user_id', $this->user->id)->count())->toBe(1);
});

test('GET /exploration/coverage retourne le % correct', function () {
    // Add some explored tiles
    for ($i = 0; $i < 10; $i++) {
        ExploredTile::create([
            'user_id' => $this->user->id,
            'h3_index' => "8_48.85{$i}_2.352",
            'first_visited_at' => now(),
        ]);
    }

    $response = $this->getJson('/api/v1/exploration/coverage?city=paris');

    $response->assertOk()
        ->assertJsonStructure(['data' => ['city', 'coverage_percent', 'explored_tiles', 'total_tiles']]);

    expect($response->json('data.explored_tiles'))->toBe(10);
    expect($response->json('data.coverage_percent'))->toBeGreaterThan(0);
});

test('GET /exploration/tiles retourne les hexagons dans le bbox', function () {
    ExploredTile::create([
        'user_id' => $this->user->id,
        'h3_index' => '8_48.856_2.352',
        'first_visited_at' => now(),
    ]);

    $response = $this->getJson('/api/v1/exploration/tiles?bbox=48.85,2.35,48.86,2.36');

    $response->assertOk()
        ->assertJsonStructure(['data' => ['tiles', 'count']]);

    expect($response->json('data.count'))->toBeGreaterThan(0);
});
