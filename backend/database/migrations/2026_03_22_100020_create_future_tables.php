<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Future tables — Sprint 3-4+
 * Migrations created now to avoid ALTER TABLE later.
 * NO application code uses these tables in Sprint 1-2.
 */
return new class extends Migration
{
    public function up(): void
    {
        // Conversations (Sprint 3-4 DM)
        DB::statement("
            CREATE TABLE conversations (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_a_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                user_b_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                type VARCHAR(20) NOT NULL DEFAULT 'dm',
                last_message_at TIMESTAMPTZ,
                last_message_preview VARCHAR(255),
                unread_count_a INTEGER NOT NULL DEFAULT 0,
                unread_count_b INTEGER NOT NULL DEFAULT 0,
                common_stamps_count INTEGER NOT NULL DEFAULT 0,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                UNIQUE(user_a_id, user_b_id, type)
            )
        ");

        // Direct messages (Sprint 3-4)
        DB::statement("
            CREATE TABLE direct_messages (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
                sender_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                content TEXT,
                photo_url VARCHAR(500),
                audio_url VARCHAR(500),
                audio_duration_sec SMALLINT,
                reactions JSONB,
                read_at TIMESTAMPTZ,
                deleted_by_sender BOOLEAN NOT NULL DEFAULT FALSE,
                deleted_by_receiver BOOLEAN NOT NULL DEFAULT FALSE,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        ");

        // Shouts (Sprint 3-4)
        DB::statement("
            CREATE TABLE shouts (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                location GEOGRAPHY(Point, 4326) NOT NULL,
                message TEXT NOT NULL,
                radius_meters INTEGER NOT NULL DEFAULT 2000,
                expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '2 hours'),
                participants_count INTEGER NOT NULL DEFAULT 0,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        ");
        DB::statement('CREATE INDEX idx_shouts_location ON shouts USING GIST (location)');
        DB::statement('CREATE INDEX idx_shouts_expires ON shouts (expires_at)');

        Schema::create('shout_participants', function (Blueprint $table) {
            $table->uuid('shout_id');
            $table->uuid('user_id');
            $table->foreign('shout_id')->references('id')->on('shouts')->cascadeOnDelete();
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->timestampTz('joined_at')->useCurrent();
            $table->unique(['shout_id', 'user_id']);
        });

        // Squads (Sprint 3-4)
        DB::statement("
            CREATE TABLE squads (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(100) NOT NULL,
                owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                avatar_url VARCHAR(500),
                description VARCHAR(500),
                members_count INTEGER NOT NULL DEFAULT 1,
                is_family BOOLEAN NOT NULL DEFAULT FALSE,
                is_private BOOLEAN NOT NULL DEFAULT FALSE,
                current_streak INTEGER NOT NULL DEFAULT 0,
                max_streak INTEGER NOT NULL DEFAULT 0,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        ");

        Schema::create('squad_members', function (Blueprint $table) {
            $table->uuid('squad_id');
            $table->uuid('user_id');
            $table->foreign('squad_id')->references('id')->on('squads')->cascadeOnDelete();
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->string('role', 20)->default('member');
            $table->timestampTz('joined_at')->useCurrent();
            $table->unique(['squad_id', 'user_id']);
        });

        // Travel media (Sprint 3-4)
        DB::statement("
            CREATE TABLE travel_media (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                location GEOGRAPHY(Point, 4326) NOT NULL,
                media_url VARCHAR(500) NOT NULL,
                media_type VARCHAR(10) NOT NULL DEFAULT 'photo',
                thumbnail_url VARCHAR(500),
                duration_seconds SMALLINT,
                caption VARCHAR(280),
                visibility VARCHAR(10) NOT NULL DEFAULT 'public',
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        ");
        DB::statement('CREATE INDEX idx_travel_media_location ON travel_media USING GIST (location)');

        // User statuses - stamp d'humeur (Sprint 3-4)
        DB::statement("
            CREATE TABLE user_statuses (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                emoji VARCHAR(10) NOT NULL,
                text VARCHAR(100),
                expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '4 hours'),
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        ");

        // Position shares - Proches (Sprint 3-4)
        DB::statement("
            CREATE TABLE position_shares (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                token VARCHAR(64) UNIQUE NOT NULL,
                type VARCHAR(15) NOT NULL DEFAULT 'family',
                label VARCHAR(100),
                duration_hours INTEGER NOT NULL DEFAULT 168,
                auto_renew BOOLEAN NOT NULL DEFAULT FALSE,
                expires_at TIMESTAMPTZ NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        ");

        // Geofence zones (Sprint 3-4)
        DB::statement("
            CREATE TABLE geofence_zones (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                name VARCHAR(100) NOT NULL,
                center GEOGRAPHY(Point, 4326) NOT NULL,
                radius_meters INTEGER NOT NULL DEFAULT 500,
                is_active BOOLEAN NOT NULL DEFAULT TRUE,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        ");

        // Activity feed (Sprint 3-4)
        Schema::create('activity_feed', function (Blueprint $table) {
            $table->id();
            $table->uuid('user_id');
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->string('action_type', 50);
            $table->uuid('actor_user_id')->nullable();
            $table->uuid('stamp_id')->nullable();
            $table->jsonb('data')->nullable();
            $table->timestampTz('created_at')->useCurrent();
        });

        // Daily quests (Sprint 3-4)
        DB::statement("
            CREATE TABLE daily_quests_progress (
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                quest_date DATE NOT NULL DEFAULT CURRENT_DATE,
                stamp_done BOOLEAN NOT NULL DEFAULT FALSE,
                share_done BOOLEAN NOT NULL DEFAULT FALSE,
                interact_done BOOLEAN NOT NULL DEFAULT FALSE,
                bonus_claimed BOOLEAN NOT NULL DEFAULT FALSE,
                PRIMARY KEY (user_id, quest_date)
            )
        ");

        // Friendships (Sprint 3-4)
        Schema::create('friendships', function (Blueprint $table) {
            $table->uuid('user_a_id');
            $table->uuid('user_b_id');
            $table->foreign('user_a_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('user_b_id')->references('id')->on('users')->cascadeOnDelete();
            $table->string('status', 20)->default('pending');
            $table->timestampTz('created_at')->useCurrent();
            $table->unique(['user_a_id', 'user_b_id']);
        });

        // Pepites (Sprint 3-4)
        DB::statement("
            CREATE TABLE pepites (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                city VARCHAR(100) NOT NULL,
                spot_name VARCHAR(200) NOT NULL,
                description TEXT,
                photo_url VARCHAR(500),
                location GEOGRAPHY(Point, 4326) NOT NULL,
                votes_count INTEGER NOT NULL DEFAULT 0,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        ");
        DB::statement('CREATE INDEX idx_pepites_location ON pepites USING GIST (location)');

        Schema::create('pepite_votes', function (Blueprint $table) {
            $table->uuid('pepite_id');
            $table->uuid('user_id');
            $table->foreign('pepite_id')->references('id')->on('pepites')->cascadeOnDelete();
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->timestampTz('created_at')->useCurrent();
            $table->unique(['pepite_id', 'user_id']);
        });

        // Server regions (multi-region prep)
        DB::statement("
            CREATE TABLE server_regions (
                id SERIAL PRIMARY KEY,
                code VARCHAR(10) UNIQUE NOT NULL,
                name VARCHAR(100) NOT NULL,
                is_active BOOLEAN NOT NULL DEFAULT FALSE,
                is_primary BOOLEAN NOT NULL DEFAULT FALSE,
                app_host VARCHAR(255),
                db_host VARCHAR(255),
                cache_host VARCHAR(255),
                latency_ms_avg INTEGER,
                users_count INTEGER NOT NULL DEFAULT 0,
                bbox GEOMETRY(Polygon),
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        ");
    }

    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS server_regions CASCADE');
        Schema::dropIfExists('pepite_votes');
        DB::statement('DROP TABLE IF EXISTS pepites CASCADE');
        Schema::dropIfExists('friendships');
        DB::statement('DROP TABLE IF EXISTS daily_quests_progress CASCADE');
        Schema::dropIfExists('activity_feed');
        DB::statement('DROP TABLE IF EXISTS geofence_zones CASCADE');
        DB::statement('DROP TABLE IF EXISTS position_shares CASCADE');
        DB::statement('DROP TABLE IF EXISTS user_statuses CASCADE');
        DB::statement('DROP TABLE IF EXISTS travel_media CASCADE');
        Schema::dropIfExists('squad_members');
        DB::statement('DROP TABLE IF EXISTS squads CASCADE');
        Schema::dropIfExists('shout_participants');
        DB::statement('DROP TABLE IF EXISTS shouts CASCADE');
        DB::statement('DROP TABLE IF EXISTS direct_messages CASCADE');
        DB::statement('DROP TABLE IF EXISTS conversations CASCADE');
    }
};
