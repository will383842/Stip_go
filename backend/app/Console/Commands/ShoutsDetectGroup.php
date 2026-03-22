<?php

namespace App\Console\Commands;

use App\Models\CronLog;
use App\Models\Shout;
use App\Models\Squad;
use App\Models\SquadMember;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ShoutsDetectGroup extends Command
{
    protected $signature = 'shouts:detect-group';

    protected $description = 'Detect shouts with 3+ nearby participants and suggest Squad creation';

    public function handle(): int
    {
        $log = CronLog::start('ShoutsDetectGroup');
        $created = 0;

        try {
            // Find active shouts with 3+ participants where participants are within 200m of each other
            $shouts = Shout::active()
                ->where('participants_count', '>=', 3)
                ->where(function ($q) {
                    $q->where('is_minor', false)->orWhereNull('is_minor');
                })
                ->get();

            foreach ($shouts as $shout) {
                // Check if a temporary squad already exists for this shout
                $existingSquad = Squad::where('is_temporary', true)
                    ->where('created_at', '>', $shout->created_at)
                    ->whereHas('members', function ($q) use ($shout) {
                        $q->where('user_id', $shout->user_id);
                    })->exists();

                if ($existingSquad) {
                    continue;
                }

                // Check if participants have 5+ people (threshold for auto-squad)
                if ($shout->participants_count >= 5) {
                    $squad = Squad::create([
                        'name' => mb_substr($shout->message, 0, 30),
                        'emoji' => '🎉',
                        'creator_user_id' => $shout->user_id,
                        'is_temporary' => true,
                        'expires_at' => now()->addHours(48),
                        'member_count' => 0,
                    ]);

                    // Add all participants as squad members
                    $participants = $shout->participants()->pluck('user_id');
                    $colorIndex = 0;

                    foreach ($participants as $userId) {
                        SquadMember::create([
                            'squad_id' => $squad->id,
                            'user_id' => $userId,
                            'color' => SquadMember::COLORS[$colorIndex % count(SquadMember::COLORS)],
                            'role' => $userId === $shout->user_id ? 'creator' : 'member',
                            'joined_at' => now(),
                        ]);
                        $colorIndex++;
                    }

                    $squad->update(['member_count' => $participants->count()]);
                    $created++;
                }
            }

            $log->finish($created);
            $this->info("Created {$created} temporary squads.");

            return self::SUCCESS;
        } catch (\Throwable $e) {
            $log->fail($e->getMessage());
            $this->error($e->getMessage());

            return self::FAILURE;
        }
    }
}
