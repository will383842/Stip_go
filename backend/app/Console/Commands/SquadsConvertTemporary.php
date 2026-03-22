<?php

namespace App\Console\Commands;

use App\Models\CronLog;
use App\Models\Squad;
use Illuminate\Console\Command;

class SquadsConvertTemporary extends Command
{
    protected $signature = 'squads:convert-temporary';

    protected $description = 'Handle expired temporary squads — push "Keep this Squad?" notification';

    public function handle(): int
    {
        $log = CronLog::start('SquadsConvertTemporary');
        $processed = 0;

        try {
            $expired = Squad::where('is_temporary', true)
                ->where('expires_at', '<', now())
                ->get();

            foreach ($expired as $squad) {
                // For now, just delete expired temporary squads
                // In production: send push notification first, wait 24h, then delete
                $squad->delete();
                $processed++;
            }

            $log->finish($processed);
            $this->info("Processed {$processed} expired temporary squads.");

            return self::SUCCESS;
        } catch (\Throwable $e) {
            $log->fail($e->getMessage());
            $this->error($e->getMessage());

            return self::FAILURE;
        }
    }
}
