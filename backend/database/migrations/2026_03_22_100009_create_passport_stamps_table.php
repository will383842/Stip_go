<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("
            CREATE TABLE passport_stamps (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                stamp_type VARCHAR(10) NOT NULL CHECK (stamp_type IN ('spot','city','region','country')),
                country_code CHAR(2) NOT NULL,
                region_name VARCHAR(200),
                city_name VARCHAR(100),
                spot_name VARCHAR(200),
                spot_category VARCHAR(50),
                stamped_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                animation_seen BOOLEAN NOT NULL DEFAULT FALSE,
                shared BOOLEAN NOT NULL DEFAULT FALSE,
                is_golden BOOLEAN NOT NULL DEFAULT FALSE,
                visits_count INTEGER NOT NULL DEFAULT 0
            )
        ");

        DB::statement('CREATE INDEX idx_stamps_user_time ON passport_stamps (user_id, stamped_at DESC)');
        DB::statement('CREATE INDEX idx_stamps_user_type ON passport_stamps (user_id, stamp_type)');

        // Partial unique indexes — 1 stamp per country/region/city/spot per user
        DB::statement("CREATE UNIQUE INDEX idx_stamps_unique_country ON passport_stamps (user_id, stamp_type, country_code) WHERE stamp_type = 'country'");
        DB::statement("CREATE UNIQUE INDEX idx_stamps_unique_region ON passport_stamps (user_id, stamp_type, region_name, country_code) WHERE stamp_type = 'region'");
        DB::statement("CREATE UNIQUE INDEX idx_stamps_unique_city ON passport_stamps (user_id, stamp_type, city_name, country_code) WHERE stamp_type = 'city'");
        DB::statement("CREATE UNIQUE INDEX idx_stamps_unique_spot ON passport_stamps (user_id, stamp_type, spot_name, city_name) WHERE stamp_type = 'spot'");
    }

    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS passport_stamps CASCADE');
    }
};
