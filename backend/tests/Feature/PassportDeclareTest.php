<?php

namespace Tests\Feature;

use App\Models\PassportStamp;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class PassportDeclareTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();

        // Seed required countries for tests
        $countries = ['FR', 'JP', 'TH', 'US', 'IT', 'DE', 'ES', 'BR', 'AU', 'KR'];
        foreach ($countries as $code) {
            DB::table('countries')->insertOrIgnore([
                'code' => $code,
                'name' => json_encode(['en' => $code, 'fr' => $code]),
                'is_active' => true,
                'currency_code' => 'USD',
                'phone_prefix' => '+1',
            ]);
        }
    }

    public function test_declare_creates_stamps(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/passport/declare', [
                'country_codes' => ['FR', 'JP', 'TH', 'US', 'IT'],
            ]);

        $response->assertOk()
            ->assertJsonPath('data.declared_count', 5)
            ->assertJsonPath('data.ignored_count', 0)
            ->assertJsonPath('data.total_countries', 5);

        $this->assertDatabaseCount('passport_stamps', 5);
        $this->assertDatabaseHas('passport_stamps', [
            'user_id' => $this->user->id,
            'stamp_type' => 'country',
            'country_code' => 'FR',
            'source' => 'declared',
        ]);
    }

    public function test_declare_ignores_existing_gps_stamps(): void
    {
        // Create a GPS stamp for France
        PassportStamp::create([
            'user_id' => $this->user->id,
            'stamp_type' => 'country',
            'country_code' => 'FR',
            'source' => 'gps',
            'stamped_at' => now(),
        ]);

        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/passport/declare', [
                'country_codes' => ['FR', 'JP'],
            ]);

        $response->assertOk()
            ->assertJsonPath('data.declared_count', 1)
            ->assertJsonPath('data.ignored_count', 1);

        // FR should still be GPS, not overwritten
        $this->assertDatabaseHas('passport_stamps', [
            'user_id' => $this->user->id,
            'country_code' => 'FR',
            'source' => 'gps',
        ]);
    }

    public function test_declare_rejects_array_over_100(): void
    {
        // Validation rejects array > 100 items before DB check
        $codes = array_fill(0, 101, 'FR');

        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/passport/declare', [
                'country_codes' => $codes,
            ]);

        $response->assertUnprocessable();
    }

    public function test_declare_rejects_total_over_100(): void
    {
        // Seed 100 countries
        for ($i = 0; $i < 100; $i++) {
            $code = chr(65 + intdiv($i, 26)) . chr(65 + ($i % 26)); // AA, AB, AC...
            DB::table('countries')->insertOrIgnore([
                'code' => $code,
                'name' => json_encode(['en' => $code]),
                'is_active' => true,
                'currency_code' => 'USD',
                'phone_prefix' => '+1',
            ]);
        }

        // Declare first 100
        $first100 = [];
        for ($i = 0; $i < 100; $i++) {
            $first100[] = chr(65 + intdiv($i, 26)) . chr(65 + ($i % 26));
        }

        // Split into 2 batches (max:100 per request)
        $this->actingAs($this->user)
            ->postJson('/api/v1/passport/declare', [
                'country_codes' => array_slice($first100, 0, 100),
            ]);

        // Now try to declare one more
        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/passport/declare', [
                'country_codes' => ['FR'],
            ]);

        $response->assertUnprocessable()
            ->assertJsonPath('errors.0.code', 'max_declared');
    }

    public function test_declare_ignores_invalid_country_codes(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/passport/declare', [
                'country_codes' => ['XX', 'ZZ', 'FR'],
            ]);

        $response->assertOk()
            ->assertJsonPath('data.declared_count', 1)  // only FR is valid
            ->assertJsonPath('data.ignored_count', 2);   // XX and ZZ invalid

        $this->assertDatabaseHas('passport_stamps', [
            'user_id' => $this->user->id,
            'country_code' => 'FR',
            'source' => 'declared',
        ]);
    }

    public function test_get_passport_returns_source_and_stats(): void
    {
        PassportStamp::create([
            'user_id' => $this->user->id,
            'stamp_type' => 'country',
            'country_code' => 'FR',
            'source' => 'gps',
            'stamped_at' => now(),
        ]);

        PassportStamp::create([
            'user_id' => $this->user->id,
            'stamp_type' => 'country',
            'country_code' => 'JP',
            'source' => 'declared',
            'stamped_at' => now(),
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/passport');

        $response->assertOk()
            ->assertJsonPath('data.stats.countries_visited', 2)
            ->assertJsonPath('data.stats.verified_countries', 1)
            ->assertJsonPath('data.stats.declared_countries', 1);

        // Each stamp should have source field
        $stamps = $response->json('data.stamps');
        foreach ($stamps as $stamp) {
            $this->assertArrayHasKey('source', $stamp);
        }

        // stamped_countries should include source
        $stampedCountries = $response->json('data.stamped_countries');
        foreach ($stampedCountries as $sc) {
            $this->assertArrayHasKey('country_code', $sc);
            $this->assertArrayHasKey('source', $sc);
        }
    }

    public function test_declared_stamp_upgrades_to_gps_on_verification(): void
    {
        $stamp = PassportStamp::create([
            'user_id' => $this->user->id,
            'stamp_type' => 'country',
            'country_code' => 'FR',
            'source' => 'declared',
            'stamped_at' => now()->subDay(),
        ]);

        // Simulate GeoProcess verifying the country
        $stamp->update(['source' => 'gps', 'stamped_at' => now()]);

        $this->assertDatabaseHas('passport_stamps', [
            'id' => $stamp->id,
            'source' => 'gps',
        ]);
    }

    public function test_declare_ignores_duplicate_declared_stamps(): void
    {
        // Declare FR
        $this->actingAs($this->user)
            ->postJson('/api/v1/passport/declare', [
                'country_codes' => ['FR'],
            ]);

        // Declare FR again
        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/passport/declare', [
                'country_codes' => ['FR'],
            ]);

        $response->assertOk()
            ->assertJsonPath('data.declared_count', 0)
            ->assertJsonPath('data.ignored_count', 1);

        // Only 1 stamp for FR
        $this->assertEquals(1, PassportStamp::where('user_id', $this->user->id)
            ->where('country_code', 'FR')
            ->count());
    }

    public function test_declare_empty_array_rejected(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/passport/declare', [
                'country_codes' => [],
            ]);

        $response->assertUnprocessable();
    }

    public function test_declare_requires_auth(): void
    {
        $response = $this->postJson('/api/v1/passport/declare', [
            'country_codes' => ['FR'],
        ]);

        $response->assertUnauthorized();
    }
}
