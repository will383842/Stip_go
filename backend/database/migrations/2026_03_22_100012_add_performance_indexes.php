<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Performance indexes identified by audit:
 * P6: blocked_users single-column indexes for OR queries
 * P7: positions partial index for valid (non-mock, non-suspicious) positions
 */
return new class extends Migration
{
    public function up(): void
    {
        // P6: blocked_users needs individual column indexes for OR queries
        // The UNIQUE(blocker, blocked) index only helps when both columns are in the query
        DB::statement('CREATE INDEX idx_blocked_blocker ON blocked_users (blocker_user_id)');
        DB::statement('CREATE INDEX idx_blocked_blocked ON blocked_users (blocked_user_id)');

        // P7: GeoProcess filters by is_mock=false AND is_suspicious=false
        // Partial index avoids scanning mock/suspicious positions
        DB::statement('
            CREATE INDEX idx_positions_valid_recent
            ON positions (user_id, recorded_at DESC)
            WHERE is_mock = FALSE AND is_suspicious = FALSE
        ');
    }

    public function down(): void
    {
        DB::statement('DROP INDEX IF EXISTS idx_positions_valid_recent');
        DB::statement('DROP INDEX IF EXISTS idx_blocked_blocked');
        DB::statement('DROP INDEX IF EXISTS idx_blocked_blocker');
    }
};
