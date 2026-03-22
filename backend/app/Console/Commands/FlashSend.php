<?php

namespace App\Console\Commands;

use App\Models\CronLog;
use App\Models\PushNotificationLog;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Redis;

class FlashSend extends Command
{
    protected $signature = 'flash:send';

    protected $description = 'Distribute Flash push notifications between 9h-21h local time';

    public function handle(): int
    {
        $log = CronLog::start('FlashSend');
        $sent = 0;

        try {
            // Get users who haven't received today's flash
            $users = User::whereNotNull('timezone')
                ->whereNull('deleted_at')
                ->get();

            foreach ($users as $user) {
                // Check if within 9h-21h local time
                $localHour = now($user->timezone)->hour;
                if ($localHour < 9 || $localHour >= 21) {
                    continue;
                }

                // Already sent today?
                if (Redis::get("user:{$user->id}:daily_flash_sent")) {
                    continue;
                }

                // Can we send more notifications today?
                if (! PushNotificationLog::canSendTo($user->id)) {
                    continue;
                }

                // Log the notification (actual push via FCM would be here)
                PushNotificationLog::create([
                    'user_id' => $user->id,
                    'notification_type' => 'stamp_flash',
                    'title' => '⚡ Stamp Flash !',
                    'body' => 'Un lieu mystère t\'attend ! Tu as 5 minutes pour le capturer.',
                    'deeplink' => 'stipme://flash',
                    'sent_at' => now(),
                ]);

                PushNotificationLog::incrementDailyCount($user->id);
                Redis::setex("user:{$user->id}:daily_flash_sent", 86400, '1');
                $sent++;
            }

            $log->finish($sent);
            $this->info("Sent {$sent} flash notifications.");

            return self::SUCCESS;
        } catch (\Throwable $e) {
            $log->fail($e->getMessage());
            $this->error($e->getMessage());

            return self::FAILURE;
        }
    }
}
