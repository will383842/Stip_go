<?php

namespace App\Console\Commands;

use App\Models\ActivityFeed;
use App\Models\CronLog;
use App\Models\Friendship;
use App\Models\PushNotificationLog;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class FeedFriendStampNotif extends Command
{
    protected $signature = 'feed:friend-stamp-notif';

    protected $description = 'Notify friends about the most notable stamp of the day (18h)';

    public function handle(): int
    {
        $log = CronLog::start('FeedFriendStampNotif');
        $sent = 0;

        try {
            // Get today's most notable stamps (country stamps first, then city)
            $notableStamps = ActivityFeed::with('user')
                ->where('type', 'stamp')
                ->where('created_at', '>', now()->startOfDay())
                ->orderByRaw("CASE WHEN content->>'stamp_type' = 'country' THEN 1 WHEN content->>'stamp_type' = 'city' THEN 2 ELSE 3 END")
                ->limit(100)
                ->get();

            foreach ($notableStamps as $feedItem) {
                // Get this user's friends
                $friendIds = Friendship::where(function ($q) use ($feedItem) {
                    $q->where('user_id', $feedItem->user_id)->orWhere('friend_id', $feedItem->user_id);
                })->accepted()->get()->map(function ($f) use ($feedItem) {
                    return $f->user_id === $feedItem->user_id ? $f->friend_id : $f->user_id;
                });

                foreach ($friendIds as $friendId) {
                    if (! PushNotificationLog::canSendTo($friendId)) {
                        continue;
                    }

                    PushNotificationLog::create([
                        'user_id' => $friendId,
                        'notification_type' => 'friend_stamp',
                        'title' => '🗺️ Ton ami a stampé !',
                        'body' => "{$feedItem->user->name} a posé un stamp aujourd'hui.",
                        'deeplink' => 'stipme://feed',
                        'sent_at' => now(),
                    ]);

                    PushNotificationLog::incrementDailyCount($friendId);
                    $sent++;
                }
            }

            $log->finish($sent);
            $this->info("Sent {$sent} notifications.");

            return self::SUCCESS;
        } catch (\Throwable $e) {
            $log->fail($e->getMessage());
            $this->error($e->getMessage());

            return self::FAILURE;
        }
    }
}
