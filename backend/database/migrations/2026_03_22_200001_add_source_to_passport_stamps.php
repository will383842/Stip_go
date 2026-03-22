<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Add source column — non-destructive, existing stamps default to 'gps'
        DB::statement("
            ALTER TABLE passport_stamps
            ADD COLUMN source VARCHAR(10) NOT NULL DEFAULT 'gps'
            CHECK (source IN ('gps', 'imported', 'declared'))
        ");

        // Index for quickly finding declared stamps per user (used in verification)
        DB::statement("CREATE INDEX idx_stamps_user_source ON passport_stamps (user_id, source) WHERE source = 'declared'");
    }

    public function down(): void
    {
        DB::statement('DROP INDEX IF EXISTS idx_stamps_user_source');
        DB::statement('ALTER TABLE passport_stamps DROP COLUMN IF EXISTS source');
    }
};
