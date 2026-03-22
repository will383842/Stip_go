<?php

namespace App\Console\Commands;

use App\Models\ActivityFeed;
use App\Models\CronLog;
use App\Models\ExploredTile;
use App\Models\PassportStamp;
use App\Models\UserBadge;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;

class GeoProcess extends Command
{
    protected $signature = 'geo:process';

    protected $description = 'Detect country/region/city changes and create stamps automatically';

    public function handle(): int
    {
        $log = CronLog::start('GeoProcessing');
        $processed = 0;

        try {
            // Get latest position per user from last 5 minutes
            $positions = DB::select("
                SELECT DISTINCT ON (user_id)
                    user_id,
                    ST_Y(location::geometry) as lat,
                    ST_X(location::geometry) as lng,
                    recorded_at
                FROM positions
                WHERE recorded_at > NOW() - INTERVAL '5 minutes'
                  AND is_mock = FALSE
                  AND is_suspicious = FALSE
                ORDER BY user_id, recorded_at DESC
            ");

            foreach ($positions as $pos) {
                try {
                    $this->processUserPosition($pos);
                    $this->computeH3Tile($pos);
                    $processed++;
                } catch (\Exception $e) {
                    // Don't let one user's error stop the batch
                    report($e);
                }
            }

            $log->finish($processed);
            $this->info("GeoProcessing: {$processed} users processed");

            return self::SUCCESS;
        } catch (\Exception $e) {
            $log->fail($e->getMessage());
            $this->error("GeoProcessing failed: {$e->getMessage()}");

            return self::FAILURE;
        }
    }

    private function processUserPosition(object $pos): void
    {
        $userId = $pos->user_id;
        $lat = $pos->lat;
        $lng = $pos->lng;

        // 1. Country detection
        $country = DB::selectOne(
            'SELECT country_code FROM country_boundaries
             WHERE ST_Contains(boundary, ST_SetSRID(ST_MakePoint(?, ?), 4326))',
            [$lng, $lat]
        );

        if ($country) {
            $cachedCountry = Redis::get("user:{$userId}:current_country");

            if ($country->country_code !== $cachedCountry) {
                $this->createStamp($userId, 'country', $country->country_code);
                Redis::setex("user:{$userId}:current_country", 600, $country->country_code);
            }
        }

        // 2. Region detection
        $region = DB::selectOne(
            'SELECT id, name, country_code FROM regions
             WHERE ST_Contains(boundary, ST_SetSRID(ST_MakePoint(?, ?), 4326))
             LIMIT 1',
            [$lng, $lat]
        );

        if ($region) {
            $cachedRegion = Redis::get("user:{$userId}:current_region");

            if ((string) $region->id !== $cachedRegion) {
                $regionName = json_decode($region->name, true);
                $displayName = $regionName['en'] ?? $regionName['fr'] ?? array_values($regionName)[0] ?? 'Unknown';

                $this->createStamp($userId, 'region', $region->country_code, $displayName);
                Redis::setex("user:{$userId}:current_region", 600, (string) $region->id);
            }
        }

        // 3. City detection (with 30-min debounce)
        $city = DB::selectOne(
            'SELECT id, city_name, country_code FROM city_boundaries
             WHERE ST_Contains(boundary, ST_SetSRID(ST_MakePoint(?, ?), 4326))
             LIMIT 1',
            [$lng, $lat]
        );

        // Fallback: radius-based detection if no boundary match
        if (! $city) {
            $city = DB::selectOne(
                'SELECT id, city_name, country_code FROM city_boundaries
                 WHERE ST_DWithin(center, ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography, radius_km * 1000)
                 ORDER BY ST_Distance(center, ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography)
                 LIMIT 1',
                [$lng, $lat, $lng, $lat]
            );
        }

        if ($city) {
            $cachedCity = Redis::get("user:{$userId}:current_city");
            $lastCityStamp = Redis::get("user:{$userId}:last_city_stamp_at");

            if ((string) $city->id !== $cachedCity && ! $lastCityStamp) {
                $this->createStamp($userId, 'city', $city->country_code, null, $city->city_name);
                Redis::setex("user:{$userId}:current_city", 600, (string) $city->id);
                Redis::setex("user:{$userId}:last_city_stamp_at", 1800, now()->toIso8601String());
            }
        }
    }

    private function createStamp(string $userId, string $type, string $countryCode, ?string $regionName = null, ?string $cityName = null): void
    {
        // Check if stamp already exists (partial unique indexes handle this, but check first to avoid exceptions)
        $existing = PassportStamp::where('user_id', $userId)
            ->where('stamp_type', $type)
            ->where('country_code', $countryCode);

        if ($type === 'region' && $regionName) {
            $existing->where('region_name', $regionName);
        }
        if ($type === 'city' && $cityName) {
            $existing->where('city_name', $cityName);
        }

        $existingStamp = $existing->first();

        if ($existingStamp) {
            // If a 'declared' stamp exists for this country, verify it → upgrade to 'gps'
            if ($type === 'country' && $existingStamp->source === 'declared') {
                try {
                    DB::transaction(function () use ($existingStamp, $userId, $countryCode) {
                        $existingStamp->update(['source' => 'gps', 'stamped_at' => now()]);

                        DB::table('notifications')->insert([
                            'id' => \Illuminate\Support\Str::uuid()->toString(),
                            'user_id' => $userId,
                            'type' => 'stamp_verified',
                            'title' => 'Stamp vérifié !',
                            'body' => "Ton stamp {$countryCode} est maintenant officiel !",
                            'data' => json_encode([
                                'country_code' => $countryCode,
                                'stamp_id' => $existingStamp->id,
                            ]),
                            'created_at' => now(),
                        ]);
                    });
                } catch (\Exception $e) {
                    report($e);
                }
            }

            return;
        }

        PassportStamp::create([
            'user_id' => $userId,
            'stamp_type' => $type,
            'country_code' => $countryCode,
            'region_name' => $regionName,
            'city_name' => $cityName,
            'source' => 'gps',
            'stamped_at' => now(),
        ]);

        // Increment total_stamps
        DB::statement('UPDATE users SET total_stamps = total_stamps + 1 WHERE id = ?', [$userId]);

        // Activity feed entry
        ActivityFeed::create([
            'user_id' => $userId,
            'type' => $type === 'country' ? 'country' : 'stamp',
            'content' => [
                'stamp_type' => $type,
                'country_code' => $countryCode,
                'region_name' => $regionName,
                'city_name' => $cityName,
            ],
        ]);

        // Check badge auto-unlock
        $this->checkBadges($userId);
    }

    /**
     * Compute H3 tile for Terra Incognita and insert into explored_tiles.
     */
    private function computeH3Tile(object $pos): void
    {
        $userId = $pos->user_id;

        // H3 index at resolution 8 (~0.74 km² hexagon)
        // Uses PostgreSQL h3 extension if available, otherwise approximate with lat/lng rounding
        try {
            $h3 = DB::selectOne(
                "SELECT h3_lat_lng_to_cell(ST_MakePoint(?, ?)::point, 8)::text as h3_index",
                [$pos->lng, $pos->lat]
            );

            if ($h3 && $h3->h3_index) {
                ExploredTile::firstOrCreate(
                    ['user_id' => $userId, 'h3_index' => $h3->h3_index],
                    ['first_visited_at' => now()]
                );

                // Invalidate cache
                Redis::del("user:{$userId}:explored_tiles");
                Redis::del("user:{$userId}:coverage:" . Redis::get("user:{$userId}:current_city"));
            }
        } catch (\Throwable $e) {
            // H3 extension not installed — use fallback approximation
            // Resolution 8 ≈ 0.46 km edge → round to ~3 decimal places
            report($e);
            $approxH3 = sprintf('8_%s_%s', round($pos->lat, 3), round($pos->lng, 3));

            ExploredTile::firstOrCreate(
                ['user_id' => $userId, 'h3_index' => $approxH3],
                ['first_visited_at' => now()]
            );

            Redis::del("user:{$userId}:explored_tiles");
        }
    }

    private function checkBadges(string $userId): void
    {
        // Only count verified stamps (GPS + imported) for badges/levels — declared stamps excluded
        $stats = DB::selectOne("
            SELECT
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE stamp_type = 'country') as countries,
                COUNT(*) FILTER (WHERE stamp_type = 'city') as cities,
                COUNT(*) FILTER (WHERE stamp_type = 'region') as regions,
                COUNT(*) FILTER (WHERE stamp_type = 'spot') as spots
            FROM passport_stamps WHERE user_id = ? AND source IN ('gps', 'imported')
        ", [$userId]);

        $total = (int) ($stats->total ?? 0);
        $countries = (int) ($stats->countries ?? 0);
        $cities = (int) ($stats->cities ?? 0);
        $regions = (int) ($stats->regions ?? 0);
        $spots = (int) ($stats->spots ?? 0);

        $checks = [
            ['first_stamp', $total >= 1],
            ['five_countries', $countries >= 5],
            ['ten_countries', $countries >= 10],
            ['twenty_five_countries', $countries >= 25],
            ['ten_cities', $cities >= 10],
            ['fifty_cities', $cities >= 50],
            ['ten_spots', $spots >= 10],
            ['fifty_spots', $spots >= 50],
            ['hundred_spots', $spots >= 100],
            ['five_regions', $regions >= 5],
        ];

        // P5 fix: batch badge lookup (1 query instead of 10)
        $earnedCodes = [];
        foreach ($checks as [$code, $earned]) {
            if ($earned) {
                $earnedCodes[] = $code;
            }
        }

        if (! empty($earnedCodes)) {
            $placeholders = implode(',', array_fill(0, count($earnedCodes), '?'));
            $badges = DB::select("SELECT id, code FROM badges WHERE code IN ({$placeholders})", $earnedCodes);
            $existingBadgeIds = UserBadge::where('user_id', $userId)->pluck('badge_id')->toArray();

            foreach ($badges as $badge) {
                if (! in_array($badge->id, $existingBadgeIds)) {
                    UserBadge::create([
                        'user_id' => $userId,
                        'badge_id' => $badge->id,
                        'earned_at' => now(),
                    ]);
                }
            }
        }

        // Update passport level name
        $level = DB::selectOne('SELECT name FROM passport_levels WHERE min_stamps <= ? ORDER BY min_stamps DESC LIMIT 1', [$total]);
        if ($level) {
            /** @var array<string, string> $levelName */
            $levelName = json_decode($level->name, true);
            DB::statement('UPDATE users SET passport_level_name = ? WHERE id = ?', [$levelName['fr'] ?? $levelName['en'] ?? 'Touriste', $userId]);
        }
    }
}
