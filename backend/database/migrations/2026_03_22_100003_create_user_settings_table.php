<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_settings', function (Blueprint $table) {
            $table->id();
            $table->uuid('user_id')->unique();
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->boolean('visible_clusters')->default(false);
            $table->boolean('visible_dating')->default(false);
            $table->boolean('visible_family')->default(false);
            $table->string('visible_parcours', 10)->default('private');
            $table->string('dark_mode', 10)->default('dark');
            $table->boolean('notification_push')->default(true);
            $table->boolean('notification_email')->default(true);
            $table->boolean('notification_social')->default(true);
            $table->boolean('notification_engagement')->default(true);
            $table->boolean('notification_marketing')->default(false);
            $table->string('text_size', 10)->default('normal');
            $table->boolean('sounds_enabled')->default(true);
            $table->boolean('haptic_enabled')->default(true);
            $table->boolean('family_mode')->default(false);
            $table->time('quiet_hours_start')->default('22:00');
            $table->time('quiet_hours_end')->default('08:00');
            $table->boolean('auto_share_stamps')->default(false);
            $table->string('default_stamp_template', 20)->default('minimal');
            $table->boolean('notification_nearby_spots')->default(true);
            $table->boolean('notification_friend_stamps')->default(true);
            $table->boolean('night_visibility_hidden')->default(false);
            $table->boolean('visibility_contacted_only')->default(false);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_settings');
    }
};
