<?php

namespace App\Console\Commands;

use App\Models\CronLog;
use App\Models\Shout;
use Illuminate\Console\Command;

class ShoutsPurge extends Command
{
    protected $signature = 'shouts:purge';

    protected $description = 'Delete expired shouts and their participants';

    public function handle(): int
    {
        $log = CronLog::start('ShoutsPurge');

        try {
            $count = Shout::where('expires_at', '<', now())->delete();

            $log->finish($count);
            $this->info("Purged {$count} expired shouts.");

            return self::SUCCESS;
        } catch (\Throwable $e) {
            $log->fail($e->getMessage());
            $this->error($e->getMessage());

            return self::FAILURE;
        }
    }
}
