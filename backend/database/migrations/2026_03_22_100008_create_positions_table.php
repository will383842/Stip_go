<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Partitioned table for positions (by month)
        DB::statement("
            CREATE TABLE positions (
                id UUID DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                location GEOGRAPHY(Point, 4326) NOT NULL,
                accuracy REAL,
                speed REAL,
                battery_level SMALLINT,
                altitude REAL,
                is_mock BOOLEAN NOT NULL DEFAULT FALSE,
                is_suspicious BOOLEAN NOT NULL DEFAULT FALSE,
                recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                PRIMARY KEY (id, recorded_at)
            ) PARTITION BY RANGE (recorded_at)
        ");

        // Create monthly partitions for 2026
        $months = [
            ['2026-03-01', '2026-04-01', 'positions_2026_03'],
            ['2026-04-01', '2026-05-01', 'positions_2026_04'],
            ['2026-05-01', '2026-06-01', 'positions_2026_05'],
            ['2026-06-01', '2026-07-01', 'positions_2026_06'],
            ['2026-07-01', '2026-08-01', 'positions_2026_07'],
            ['2026-08-01', '2026-09-01', 'positions_2026_08'],
            ['2026-09-01', '2026-10-01', 'positions_2026_09'],
            ['2026-10-01', '2026-11-01', 'positions_2026_10'],
            ['2026-11-01', '2026-12-01', 'positions_2026_11'],
            ['2026-12-01', '2027-01-01', 'positions_2026_12'],
        ];

        foreach ($months as [$from, $to, $name]) {
            DB::statement("CREATE TABLE {$name} PARTITION OF positions FOR VALUES FROM ('{$from}') TO ('{$to}')");
        }

        // Indexes (inherited by partitions)
        DB::statement('CREATE INDEX idx_positions_location ON positions USING GIST (location)');
        DB::statement('CREATE INDEX idx_positions_recorded ON positions USING BRIN (recorded_at)');
        DB::statement('CREATE INDEX idx_positions_user_time ON positions (user_id, recorded_at DESC)');
    }

    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS positions CASCADE');
    }
};
