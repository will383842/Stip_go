<?php

namespace App\Console\Commands;

use App\Models\CronLog;
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

        if ($existing->exists()) {
            return;
        }

        PassportStamp::create([
            'user_id' => $userId,
            'stamp_type' => $type,
            'country_code' => $countryCode,
            'region_name' => $regionName,
            'city_name' => $cityName,
            'stamped_at' => now(),
        ]);

        // Increment total_stamps
        DB::statement('UPDATE users SET total_stamps = total_stamps + 1 WHERE id = ?', [$userId]);

        // Check badge auto-unlock
        $this->checkBadges($userId);
    }

    private function checkBadges(string $userId): void
    {
        $totalStamps = DB::selectOne('SELECT total_stamps FROM users WHERE id = ?', [$userId])?->total_stamps ?? 0;
        $countriesCount = PassportStamp::where('user_id', $userId)->countries()->count();
        $citiesCount = PassportStamp::where('user_id', $userId)->cities()->count();
        $spotsCount = PassportStamp::where('user_id', $userId)->spots()->count();
        $regionsCount = PassportStamp::where('user_id', $userId)->regions()->count();

        $checks = [
            ['first_stamp', $totalStamps >= 1],
            ['five_countries', $countriesCount >= 5],
            ['ten_countries', $countriesCount >= 10],
            ['twenty_five_countries', $countriesCount >= 25],
            ['ten_cities', $citiesCount >= 10],
            ['fifty_cities', $citiesCount >= 50],
            ['ten_spots', $spotsCount >= 10],
            ['fifty_spots', $spotsCount >= 50],
            ['hundred_spots', $spotsCount >= 100],
            ['five_regions', $regionsCount >= 5],
        ];

        foreach ($checks as [$badgeCode, $earned]) {
            if ($earned) {
                $badge = DB::selectOne('SELECT id FROM badges WHERE code = ?', [$badgeCode]);
                if ($badge && ! UserBadge::where('user_id', $userId)->where('badge_id', $badge->id)->exists()) {
                    UserBadge::create([
                        'user_id' => $userId,
                        'badge_id' => $badge->id,
                        'earned_at' => now(),
                    ]);
                }
            }
        }

        // Update passport level name
        $level = DB::selectOne('SELECT name FROM passport_levels WHERE min_stamps <= ? ORDER BY min_stamps DESC LIMIT 1', [$totalStamps]);
        if ($level) {
            $levelName = json_decode($level->name, true);
            DB::statement('UPDATE users SET passport_level_name = ? WHERE id = ?', [$levelName['fr'] ?? $levelName['en'] ?? 'Touriste', $userId]);
        }
    }
}
