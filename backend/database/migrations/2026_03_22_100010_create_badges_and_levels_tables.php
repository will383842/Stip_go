<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('badges', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique();
            $table->jsonb('name');
            $table->jsonb('description');
            $table->string('icon_url', 500)->nullable();
            $table->string('category', 20); // spot, city, region, country, special, manual
            $table->string('trigger_type', 10)->default('auto'); // auto, manual
            $table->timestamps();
        });

        Schema::create('user_badges', function (Blueprint $table) {
            $table->id();
            $table->uuid('user_id');
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreignId('badge_id')->constrained()->cascadeOnDelete();
            $table->timestampTz('earned_at')->useCurrent();
            $table->boolean('is_pinned')->default(false);
            $table->unique(['user_id', 'badge_id']);
        });

        Schema::create('passport_levels', function (Blueprint $table) {
            $table->id();
            $table->smallInteger('level')->unique();
            $table->jsonb('name');
            $table->integer('min_stamps');
            $table->string('icon_url', 500)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('passport_levels');
        Schema::dropIfExists('user_badges');
        Schema::dropIfExists('badges');
    }
};
