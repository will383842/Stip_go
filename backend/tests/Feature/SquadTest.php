<?php

use App\Models\Squad;
use App\Models\SquadMember;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
});

test('POST /squads crée un squad avec le créateur comme premier membre', function () {
    $response = $this->postJson('/api/v1/squads', [
        'name' => 'Explorateurs Paris',
        'emoji' => '🗼',
    ]);

    $response->assertCreated()
        ->assertJsonPath('data.name', 'Explorateurs Paris')
        ->assertJsonPath('data.member_count', 1);

    $squad = Squad::first();
    expect($squad->creator_user_id)->toBe($this->user->id);
    expect(SquadMember::where('squad_id', $squad->id)->where('user_id', $this->user->id)->exists())->toBeTrue();
});

test('GET /squads/join/{code} ajoute le membre avec la prochaine couleur', function () {
    $squad = Squad::create([
        'name' => 'Test Squad',
        'emoji' => '🌍',
        'creator_user_id' => $this->user->id,
        'member_count' => 1,
    ]);

    SquadMember::create([
        'squad_id' => $squad->id,
        'user_id' => $this->user->id,
        'color' => SquadMember::COLORS[0],
        'role' => 'creator',
        'joined_at' => now(),
    ]);

    $joiner = User::factory()->create();
    $this->actingAs($joiner);

    $response = $this->getJson("/api/v1/squads/join/{$squad->invite_code}");

    $response->assertOk();

    $member = SquadMember::where('squad_id', $squad->id)->where('user_id', $joiner->id)->first();
    expect($member)->not->toBeNull();
    expect($member->color)->toBe(SquadMember::COLORS[1]);
    expect($squad->fresh()->member_count)->toBe(2);
});

test('POST /squads/{id}/stamps crée un stamp squad', function () {
    $squad = Squad::create([
        'name' => 'Test',
        'emoji' => '🌍',
        'creator_user_id' => $this->user->id,
        'member_count' => 1,
    ]);

    SquadMember::create([
        'squad_id' => $squad->id,
        'user_id' => $this->user->id,
        'color' => '#FF6B6B',
        'role' => 'creator',
        'joined_at' => now(),
    ]);

    $response = $this->postJson("/api/v1/squads/{$squad->id}/stamps", [
        'stamp_type' => 'spot',
        'lat' => 48.8566,
        'lng' => 2.3522,
        'caption' => 'Tour Eiffel !',
    ]);

    $response->assertCreated();
    expect($squad->fresh()->total_stamps)->toBe(1);
});

test('Squad max 8 membres → 422 au 9ème', function () {
    $squad = Squad::create([
        'name' => 'Full Squad',
        'emoji' => '🎯',
        'creator_user_id' => $this->user->id,
        'member_count' => 8,
    ]);

    // Add 8 members
    for ($i = 0; $i < 8; $i++) {
        $member = User::factory()->create();
        SquadMember::create([
            'squad_id' => $squad->id,
            'user_id' => $member->id,
            'color' => SquadMember::COLORS[$i],
            'role' => $i === 0 ? 'creator' : 'member',
            'joined_at' => now(),
        ]);
    }

    $ninthUser = User::factory()->create();
    $this->actingAs($ninthUser);

    $response = $this->postJson("/api/v1/squads/{$squad->id}/join");

    $response->assertStatus(422)
        ->assertJsonPath('errors.0.code', 'squad_full');
});

test('Streak 80%: 7/8 stampent → streak maintenu', function () {
    $squad = Squad::create([
        'name' => 'Streak Test',
        'emoji' => '🔥',
        'creator_user_id' => $this->user->id,
        'member_count' => 8,
        'current_streak' => 5,
    ]);

    // Simulate 7/8 members having stamped today in Redis
    for ($i = 0; $i < 7; $i++) {
        Redis::sadd("squad:{$squad->id}:today_stamped", "user_{$i}");
    }

    // Run streak check
    $this->artisan('squads:check-streak')->assertSuccessful();

    expect($squad->fresh()->current_streak)->toBe(6); // 5 + 1
});

test('Streak 80%: 5/8 stampent → streak cassé', function () {
    $squad = Squad::create([
        'name' => 'Broken Streak',
        'emoji' => '💔',
        'creator_user_id' => $this->user->id,
        'member_count' => 8,
        'current_streak' => 10,
    ]);

    // Only 5/8 stamped (62.5% < 80%)
    for ($i = 0; $i < 5; $i++) {
        Redis::sadd("squad:{$squad->id}:today_stamped", "user_{$i}");
    }

    $this->artisan('squads:check-streak')->assertSuccessful();

    expect($squad->fresh()->current_streak)->toBe(0); // Reset!
});

test('Squad temporaire expiré est supprimé par le cron', function () {
    Squad::create([
        'name' => 'Temp Squad',
        'emoji' => '⏰',
        'creator_user_id' => $this->user->id,
        'member_count' => 3,
        'is_temporary' => true,
        'expires_at' => now()->subHour(),
    ]);

    $this->artisan('squads:convert-temporary')->assertSuccessful();

    expect(Squad::count())->toBe(0);
});
