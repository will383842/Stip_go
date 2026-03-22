<?php

namespace App\Console\Commands;

use App\Models\CronLog;
use App\Models\PushNotificationLog;
use Illuminate\Console\Command;

class NotificationsPurgeLogs extends Command
{
    protected $signature = 'notifications:purge-logs';

    protected $description = 'Delete push notification logs older than 90 days';

    public function handle(): int
    {
        $log = CronLog::start('NotificationsPurgeLogs');

        try {
            $count = PushNotificationLog::where('sent_at', '<', now()->subDays(90))->delete();

            $log->finish($count);
            $this->info("Purged {$count} old logs.");

            return self::SUCCESS;
        } catch (\Throwable $e) {
            $log->fail($e->getMessage());
            $this->error($e->getMessage());

            return self::FAILURE;
        }
    }
}
