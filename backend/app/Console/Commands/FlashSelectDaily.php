<?php

namespace App\Console\Commands;

use App\Models\CronLog;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Str;

class FlashSelectDaily extends Command
{
    protected $signature = 'flash:select-daily';

    protected $description = 'Select a POI per zone for the daily Stamp Flash';

    public function handle(): int
    {
        $log = CronLog::start('FlashSelectDaily');

        try {
            // Get active zones based on user activity (last 24h)
            $zones = DB::select("
                SELECT
                    ROUND(ST_Y(location::geometry)::numeric, 2) as lat,
                    ROUND(ST_X(location::geometry)::numeric, 2) as lng,
                    COUNT(DISTINCT user_id) as user_count
                FROM positions
                WHERE recorded_at > NOW() - INTERVAL '24 hours'
                GROUP BY lat, lng
                HAVING COUNT(DISTINCT user_id) >= 1
                ORDER BY user_count DESC
                LIMIT 100
            ");

            $selected = 0;

            foreach ($zones as $zone) {
                $flashData = [
                    'id' => Str::uuid()->toString(),
                    'location' => ['lat' => (float) $zone->lat, 'lng' => (float) $zone->lng],
                    'name' => "Flash Zone {$zone->lat},{$zone->lng}",
                    'expires_at' => now()->endOfDay()->toISOString(),
                ];

                $cacheKey = "daily_stamp:{$zone->lat}:{$zone->lng}";
                Redis::setex($cacheKey, 86400, json_encode($flashData));
                $selected++;
            }

            $log->finish($selected);
            $this->info("Selected {$selected} flash POIs.");

            return self::SUCCESS;
        } catch (\Throwable $e) {
            $log->fail($e->getMessage());
            $this->error($e->getMessage());

            return self::FAILURE;
        }
    }
}
