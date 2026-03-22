<?php

namespace App\Console\Commands;

use App\Models\CronLog;
use App\Models\Squad;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Redis;

class SquadsCheckStreak extends Command
{
    protected $signature = 'squads:check-streak';

    protected $description = 'Check all squads for streak maintenance (80% must have stamped)';

    public function handle(): int
    {
        $log = CronLog::start('SquadsCheckStreak');
        $maintained = 0;
        $broken = 0;

        try {
            $threshold = config('stipme.squad.streak_threshold', 0.80);

            $squads = Squad::where('member_count', '>=', 2)
                ->where('is_temporary', false)
                ->get();

            foreach ($squads as $squad) {
                $todayStamped = Redis::scard("squad:{$squad->id}:today_stamped") ?: 0;
                $needed = ceil($squad->member_count * $threshold);

                if ($todayStamped >= $needed) {
                    // Streak maintained
                    $squad->increment('current_streak');

                    if ($squad->current_streak > $squad->max_streak) {
                        $squad->update(['max_streak' => $squad->current_streak]);
                    }

                    $maintained++;
                } else {
                    // Streak broken
                    if ($squad->current_streak > 0) {
                        $squad->update(['current_streak' => 0]);
                        $broken++;
                    }
                }

                $squad->update(['streak_last_checked' => now()]);

                // Clean up today's set (will naturally expire but clean for next day)
                Redis::del("squad:{$squad->id}:today_stamped");
            }

            $log->finish($maintained + $broken);
            $this->info("Streaks: {$maintained} maintained, {$broken} broken.");

            return self::SUCCESS;
        } catch (\Throwable $e) {
            $log->fail($e->getMessage());
            $this->error($e->getMessage());

            return self::FAILURE;
        }
    }
}
