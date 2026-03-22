<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Position clusters (refreshed by cron every 5 min)
        DB::statement('
            CREATE TABLE position_clusters (
                id SERIAL PRIMARY KEY,
                zoom_level SMALLINT NOT NULL,
                center GEOGRAPHY(Point, 4326) NOT NULL,
                count INTEGER NOT NULL,
                bbox GEOMETRY(Polygon) NULL,
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        ');
        DB::statement('CREATE INDEX idx_clusters_zoom_center ON position_clusters USING GIST (center)');

        // Blocked users
        Schema::create('blocked_users', function (Blueprint $table) {
            $table->uuid('blocker_user_id');
            $table->uuid('blocked_user_id');
            $table->foreign('blocker_user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('blocked_user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->timestampTz('created_at')->useCurrent();
            $table->unique(['blocker_user_id', 'blocked_user_id']);
        });

        // Reports
        DB::statement("
            CREATE TABLE reports (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                reporter_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                reported_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                type VARCHAR(50) NOT NULL,
                description TEXT,
                status VARCHAR(20) NOT NULL DEFAULT 'pending',
                reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                reviewed_at TIMESTAMPTZ
            )
        ");

        // App settings (force update, feature flags)
        Schema::create('app_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key', 100)->unique();
            $table->jsonb('value');
            $table->timestampTz('updated_at')->useCurrent();
        });

        // Cron logs (monitoring)
        Schema::create('cron_logs', function (Blueprint $table) {
            $table->id();
            $table->string('cron_name', 100);
            $table->timestampTz('started_at')->useCurrent();
            $table->timestampTz('finished_at')->nullable();
            $table->string('status', 20)->default('running');
            $table->integer('records_processed')->default(0);
            $table->text('error_message')->nullable();
            $table->integer('duration_ms')->nullable();
            $table->index(['cron_name', 'started_at']);
        });

        // Notifications
        DB::statement('
            CREATE TABLE notifications (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                type VARCHAR(50) NOT NULL,
                title VARCHAR(255) NOT NULL,
                body TEXT,
                data JSONB,
                read_at TIMESTAMPTZ,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        ');
        DB::statement('CREATE INDEX idx_notifications_user ON notifications (user_id, created_at DESC)');
    }

    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS notifications CASCADE');
        Schema::dropIfExists('cron_logs');
        Schema::dropIfExists('app_settings');
        DB::statement('DROP TABLE IF EXISTS reports CASCADE');
        Schema::dropIfExists('blocked_users');
        DB::statement('DROP TABLE IF EXISTS position_clusters CASCADE');
    }
};
