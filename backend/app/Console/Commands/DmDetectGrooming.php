<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class DmDetectGrooming extends Command
{
    protected $signature = 'dm:detect-grooming';

    protected $description = 'Detect potential grooming: adults 25+ sending 5+ unanswered DMs to minors';

    public function handle(): int
    {
        $currentYear = (int) date('Y');

        // Find adults (25+) who sent 5+ unanswered DMs to minors (13-17) in the last 7 days
        $suspects = DB::select("
            SELECT
                dm.sender_user_id,
                sender.name as sender_name,
                dm.receiver_id,
                receiver.name as receiver_name,
                COUNT(*) as unanswered_count
            FROM direct_messages dm
            JOIN conversations c ON c.id = dm.conversation_id
            JOIN users sender ON sender.id = dm.sender_user_id
            JOIN users receiver ON receiver.id = CASE
                WHEN c.user_a_id = dm.sender_user_id THEN c.user_b_id
                ELSE c.user_a_id
            END
            WHERE dm.created_at > NOW() - INTERVAL '7 days'
              AND sender.birth_year IS NOT NULL
              AND (? - sender.birth_year) >= 25
              AND receiver.birth_year IS NOT NULL
              AND (? - receiver.birth_year) BETWEEN 13 AND 17
              AND NOT EXISTS (
                  SELECT 1 FROM direct_messages reply
                  WHERE reply.conversation_id = dm.conversation_id
                    AND reply.sender_user_id = receiver.id
                    AND reply.created_at > dm.created_at
              )
            GROUP BY dm.sender_user_id, sender.name, dm.receiver_id, receiver.name
            HAVING COUNT(*) >= 5
        ", [$currentYear, $currentYear]);

        $alertCount = 0;

        foreach ($suspects as $suspect) {
            // Create admin alert notification
            DB::table('notifications')->insert([
                'id' => \Illuminate\Support\Str::uuid()->toString(),
                'user_id' => $suspect->sender_user_id,
                'type' => 'grooming_alert',
                'title' => 'Alerte grooming detectee',
                'body' => "Utilisateur {$suspect->sender_name} (25+) a envoye {$suspect->unanswered_count} DM non-repondus au mineur {$suspect->receiver_name}",
                'data' => json_encode([
                    'sender_user_id' => $suspect->sender_user_id,
                    'receiver_user_id' => $suspect->receiver_id,
                    'unanswered_count' => $suspect->unanswered_count,
                    'alert_type' => 'grooming',
                ]),
                'created_at' => now(),
            ]);

            $alertCount++;
        }

        $this->info("Grooming detection: {$alertCount} alerts created");

        return self::SUCCESS;
    }
}
