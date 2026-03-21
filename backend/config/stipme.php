<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Stip Me — Configuration
    |--------------------------------------------------------------------------
    */

    // Feature flags — toggle features on/off
    'features' => [
        'stamps' => true,
        'stamp_press' => true,
        'stamp_flash' => true,
        'invisible_borders' => true,
        'passport' => true,
        'dm' => true,
        'shouts' => true,
        'squad' => true,
        'exports' => true,
        'invitations' => true,
        'invisible_mode' => true,
        'audio_branding' => true,
        'waves' => true,
        'icebreakers' => true,
    ],

    // Animation durations (ms)
    'animations' => [
        'stamp_spot_ms' => 300,
        'stamp_city_ms' => 400,
        'stamp_region_ms' => 450,
        'stamp_country_ms' => 500,
        'border_crossing_ms' => 600,
        'wave_ms' => 200,
    ],

    // Stamp detection radius thresholds (meters)
    'stamp' => [
        'min_distance_meters' => 50,      // Ignore positions < 50m apart
        'spot_radius' => 200,             // Spot = 200m
        'city_radius' => 5000,            // City = 5km
        'region_radius' => 50000,         // Region = 50km
        'long_press_duration_ms' => 500,  // Stamp Press = 0.5s
    ],

    // Stamp Flash
    'stamp_flash' => [
        'window_minutes' => 5,            // 5 min capture window
        'bonus_miles' => 25,              // +25 Miles reward
    ],

    // Squad
    'squad' => [
        'min_members' => 2,
        'max_members' => 8,
        'streak_threshold' => 0.80,       // 80% must stamp
    ],

    // Passport levels (30 total)
    'passport_levels' => 30,

    // Push notifications
    'notifications' => [
        'max_per_day' => 3,
    ],

    // Moderation (Perspective API)
    'moderation' => [
        'flag_threshold' => 0.7,
        'block_threshold' => 0.9,
    ],

    // Shouts
    'shouts' => [
        'durations_hours' => [2, 12, 24],
        'radius_meters' => 500,
    ],

    // DM
    'dm' => [
        'max_message_length' => 2000,
    ],

    // Export
    'export' => [
        'image_width' => 1080,
        'image_height' => 1920,
        'video_duration_seconds' => [3, 7],
        'templates_count' => 5,
    ],

    // Invitation
    'invitation' => [
        'validation_hours' => 72,
        'triggers_count' => 7,
    ],

    // Security — Minors
    'minors' => [
        'min_age' => 13,
        'adult_age' => 18,
        'invisible_mode_forced' => true,  // COPPA + RGPD
    ],

    // Launch cities (tier 1)
    'launch_cities' => [
        'lisbon', 'barcelona', 'amsterdam', 'berlin', 'bangkok',
    ],

    // API pagination
    'pagination' => [
        'default_per_page' => 20,
        'max_per_page' => 100,
    ],

    // Redis persistent connection
    'redis_persistent' => [
        'host' => env('REDIS_PERSISTENT_HOST', '127.0.0.1'),
        'port' => env('REDIS_PERSISTENT_PORT', 6380),
        'password' => env('REDIS_PERSISTENT_PASSWORD'),
    ],
];
