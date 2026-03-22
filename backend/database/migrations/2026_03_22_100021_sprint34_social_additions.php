<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Sprint 3-4: Add missing columns/tables to align models with database.
 * The base tables were created in 2026_03_22_100020 with a minimal schema.
 * This migration adds the full Sprint 3-4 social feature columns.
 */
return new class extends Migration
{
    public function up(): void
    {
        // === FRIENDSHIPS: rename columns to match model (user_id, friend_id) ===
        // Drop existing table and recreate with correct column names + UUID PK
        Schema::dropIfExists('friendships');
        DB::statement("
            CREATE TABLE friendships (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                friend_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                status VARCHAR(10) NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'accepted', 'blocked')),
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                UNIQUE(user_id, friend_id),
                CHECK (user_id != friend_id)
            )
        ");
        DB::statement('CREATE INDEX idx_friendships_user ON friendships(user_id, status)');
        DB::statement('CREATE INDEX idx_friendships_friend ON friendships(friend_id, status)');

        // === SHOUTS: add is_minor column ===
        DB::statement('ALTER TABLE shouts ADD COLUMN is_minor BOOLEAN NOT NULL DEFAULT FALSE');

        // === SQUADS: add missing columns ===
        DB::statement('ALTER TABLE squads ADD COLUMN emoji VARCHAR(4) NOT NULL DEFAULT \'🎒\'');
        DB::statement('ALTER TABLE squads ADD COLUMN invite_code VARCHAR(20) UNIQUE');
        DB::statement('ALTER TABLE squads ADD COLUMN total_stamps INTEGER NOT NULL DEFAULT 0');
        DB::statement('ALTER TABLE squads ADD COLUMN streak_last_checked TIMESTAMPTZ');
        DB::statement('ALTER TABLE squads ADD COLUMN is_temporary BOOLEAN NOT NULL DEFAULT FALSE');
        DB::statement('ALTER TABLE squads ADD COLUMN expires_at TIMESTAMPTZ');
        // Rename owner_id → creator_user_id, members_count → member_count
        DB::statement('ALTER TABLE squads RENAME COLUMN owner_id TO creator_user_id');
        DB::statement('ALTER TABLE squads RENAME COLUMN members_count TO member_count');

        // === SQUAD_MEMBERS: add missing columns ===
        DB::statement("ALTER TABLE squad_members ADD COLUMN color VARCHAR(7) NOT NULL DEFAULT '#FF6B6B'");
        DB::statement('ALTER TABLE squad_members ADD COLUMN weekly_stamps INTEGER NOT NULL DEFAULT 0');
        DB::statement('ALTER TABLE squad_members ADD COLUMN total_stamps INTEGER NOT NULL DEFAULT 0');
        DB::statement('ALTER TABLE squad_members ADD COLUMN last_stamp_at TIMESTAMPTZ');

        // === SQUAD_STAMPS: create table (was missing) ===
        DB::statement("
            CREATE TABLE squad_stamps (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                squad_id UUID NOT NULL REFERENCES squads(id) ON DELETE CASCADE,
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                stamp_type VARCHAR(20) NOT NULL
                    CHECK (stamp_type IN ('spot', 'city', 'region', 'country', 'photo')),
                location GEOGRAPHY(Point, 4326),
                photo_url VARCHAR(500),
                caption VARCHAR(280),
                is_together BOOLEAN NOT NULL DEFAULT FALSE,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        ");

        // === SQUAD_MESSAGES: create table (was missing) ===
        DB::statement('
            CREATE TABLE squad_messages (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                squad_id UUID NOT NULL REFERENCES squads(id) ON DELETE CASCADE,
                sender_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                content TEXT NOT NULL,
                photo_url VARCHAR(500),
                audio_url VARCHAR(500),
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        ');
        DB::statement('CREATE INDEX idx_squad_messages ON squad_messages(squad_id, created_at DESC)');

        // === PEPITES: add missing columns ===
        // Make city and spot_name nullable (they're NOT NULL but we create pepites with lat/lng, not city)
        DB::statement('ALTER TABLE pepites ALTER COLUMN city DROP NOT NULL');
        DB::statement('ALTER TABLE pepites ALTER COLUMN spot_name DROP NOT NULL');
        DB::statement("ALTER TABLE pepites ADD COLUMN caption VARCHAR(280)");
        DB::statement('ALTER TABLE pepites ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE');
        DB::statement('CREATE INDEX idx_pepites_votes ON pepites(votes_count DESC) WHERE is_active = TRUE');

        // === ACTIVITY_FEED: rename column to match model ===
        DB::statement('ALTER TABLE activity_feed RENAME COLUMN action_type TO type');
        // Add content column (model uses 'content', migration had 'data')
        // Keep 'data' as alias via rename
        DB::statement('ALTER TABLE activity_feed RENAME COLUMN data TO content');
        // Change PK to UUID
        DB::statement('ALTER TABLE activity_feed DROP CONSTRAINT IF EXISTS activity_feed_pkey');
        DB::statement('ALTER TABLE activity_feed DROP COLUMN IF EXISTS id');
        DB::statement('ALTER TABLE activity_feed ADD COLUMN id UUID PRIMARY KEY DEFAULT gen_random_uuid()');
        // Add type CHECK constraint
        DB::statement("ALTER TABLE activity_feed ADD CONSTRAINT activity_feed_type_check
            CHECK (type IN ('stamp', 'level_up', 'badge', 'squad_join', 'flash_capture', 'country', 'pepite_created', 'milestone'))");
        DB::statement('CREATE INDEX idx_feed_user ON activity_feed(user_id, created_at DESC)');

        // === EXPLORED_TILES: create table (was missing) ===
        DB::statement('
            CREATE TABLE explored_tiles (
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                h3_index VARCHAR(15) NOT NULL,
                first_visited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                PRIMARY KEY (user_id, h3_index)
            )
        ');
        DB::statement('CREATE INDEX idx_explored_user ON explored_tiles(user_id)');

        // === PUSH_NOTIFICATION_LOGS: create table (was missing) ===
        DB::statement('
            CREATE TABLE push_notification_logs (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                notification_type VARCHAR(30) NOT NULL,
                title VARCHAR(100),
                body VARCHAR(500),
                deeplink VARCHAR(500),
                sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                received_at TIMESTAMPTZ,
                opened_at TIMESTAMPTZ
            )
        ');
        DB::statement('CREATE INDEX idx_notif_user ON push_notification_logs(user_id, sent_at DESC)');

        // === Add direct_messages index ===
        DB::statement('CREATE INDEX idx_dm_conversation ON direct_messages(conversation_id, created_at)');
    }

    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS push_notification_logs CASCADE');
        DB::statement('DROP TABLE IF EXISTS explored_tiles CASCADE');
        DB::statement('DROP TABLE IF EXISTS squad_messages CASCADE');
        DB::statement('DROP TABLE IF EXISTS squad_stamps CASCADE');

        // Revert activity_feed changes
        DB::statement('ALTER TABLE activity_feed DROP CONSTRAINT IF EXISTS activity_feed_type_check');
        DB::statement('DROP INDEX IF EXISTS idx_feed_user');

        // Revert pepites
        DB::statement('ALTER TABLE pepites DROP COLUMN IF EXISTS caption');
        DB::statement('ALTER TABLE pepites DROP COLUMN IF EXISTS is_active');
        DB::statement('DROP INDEX IF EXISTS idx_pepites_votes');

        // Revert squad_members
        DB::statement('ALTER TABLE squad_members DROP COLUMN IF EXISTS color');
        DB::statement('ALTER TABLE squad_members DROP COLUMN IF EXISTS weekly_stamps');
        DB::statement('ALTER TABLE squad_members DROP COLUMN IF EXISTS total_stamps');
        DB::statement('ALTER TABLE squad_members DROP COLUMN IF EXISTS last_stamp_at');

        // Revert squads
        DB::statement('ALTER TABLE squads DROP COLUMN IF EXISTS emoji');
        DB::statement('ALTER TABLE squads DROP COLUMN IF EXISTS invite_code');
        DB::statement('ALTER TABLE squads DROP COLUMN IF EXISTS total_stamps');
        DB::statement('ALTER TABLE squads DROP COLUMN IF EXISTS streak_last_checked');
        DB::statement('ALTER TABLE squads DROP COLUMN IF EXISTS is_temporary');
        DB::statement('ALTER TABLE squads DROP COLUMN IF EXISTS expires_at');
        DB::statement('ALTER TABLE squads RENAME COLUMN creator_user_id TO owner_id');
        DB::statement('ALTER TABLE squads RENAME COLUMN member_count TO members_count');

        // Revert shouts
        DB::statement('ALTER TABLE shouts DROP COLUMN IF EXISTS is_minor');

        // Revert friendships to original
        Schema::dropIfExists('friendships');
        Schema::create('friendships', function ($table) {
            $table->uuid('user_a_id');
            $table->uuid('user_b_id');
            $table->foreign('user_a_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('user_b_id')->references('id')->on('users')->cascadeOnDelete();
            $table->string('status', 20)->default('pending');
            $table->timestampTz('created_at')->useCurrent();
            $table->unique(['user_a_id', 'user_b_id']);
        });

        DB::statement('DROP INDEX IF EXISTS idx_dm_conversation');
    }
};
