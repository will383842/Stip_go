<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Drop the default Laravel users table (no data yet)
        Schema::dropIfExists('users');

        DB::statement("
            CREATE TABLE users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(255) NOT NULL,
                username VARCHAR(30) UNIQUE NOT NULL,
                email VARCHAR(255) UNIQUE,
                phone VARCHAR(20) UNIQUE,
                apple_id VARCHAR(255),
                google_id VARCHAR(255),
                firebase_uid VARCHAR(255) UNIQUE,
                avatar_url VARCHAR(500),
                locale VARCHAR(5) NOT NULL DEFAULT 'en',
                country_code CHAR(2),
                timezone VARCHAR(50),
                birth_year SMALLINT,
                onboarding_step SMALLINT NOT NULL DEFAULT 1 CHECK (onboarding_step BETWEEN 1 AND 5),
                is_premium BOOLEAN NOT NULL DEFAULT FALSE,
                premium_expires_at TIMESTAMPTZ,
                is_beta_tester BOOLEAN NOT NULL DEFAULT FALSE,
                beta_granted_at TIMESTAMPTZ,
                subscription_tier VARCHAR(10) CHECK (subscription_tier IN ('explorer','nomad','legend')),
                subscription_currency CHAR(3),
                level SMALLINT NOT NULL DEFAULT 1,
                miles_balance INTEGER NOT NULL DEFAULT 0,
                ref_code VARCHAR(20) UNIQUE NOT NULL,
                referral_count INTEGER NOT NULL DEFAULT 0,
                encounters_count INTEGER NOT NULL DEFAULT 0,
                sessions_count INTEGER NOT NULL DEFAULT 0,
                referred_by UUID REFERENCES users(id) ON DELETE SET NULL,
                referral_validated_at TIMESTAMPTZ,
                username_changed_at TIMESTAMPTZ,
                is_activator BOOLEAN NOT NULL DEFAULT FALSE,
                activator_level VARCHAR(15) DEFAULT 'bronze' CHECK (activator_level IN ('probation','bronze','silver','gold','platinum','diamond')),
                activator_city VARCHAR(100),
                activator_granted_at TIMESTAMPTZ,
                activator_points INTEGER NOT NULL DEFAULT 0,
                total_stamps INTEGER NOT NULL DEFAULT 0,
                top_stamps JSONB NOT NULL DEFAULT '[]',
                motivation JSONB,
                passport_level_name VARCHAR(30) NOT NULL DEFAULT 'Touriste',
                profile_mood VARCHAR(30),
                profile_color VARCHAR(7) NOT NULL DEFAULT '#F5C518',
                pinned_countries JSONB NOT NULL DEFAULT '[]',
                home_city_id INTEGER,
                home_country_code CHAR(2),
                remember_token VARCHAR(100),
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                deleted_at TIMESTAMPTZ
            )
        ");
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
