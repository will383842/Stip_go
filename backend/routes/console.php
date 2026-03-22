<?php

use Illuminate\Support\Facades\Schedule;

/*
|--------------------------------------------------------------------------
| Console Routes — Cron Schedules
|--------------------------------------------------------------------------
*/

// GeoProcessing: detect country/region/city changes every 5 minutes
Schedule::command('geo:process')
    ->everyFiveMinutes()
    ->withoutOverlapping()
    ->runInBackground();

// Clusters: refresh position clusters for the map every 5 minutes
// Schedule::command('clusters:refresh')
//     ->everyFiveMinutes()
//     ->withoutOverlapping()
//     ->runInBackground();

// Positions: create next month's partition on the 1st at midnight
// Schedule::command('positions:create-partition')
//     ->monthlyOn(1, '00:00')
//     ->withoutOverlapping();

// --- Sprint 3-4: Social crons ---

// Shouts: purge expired every hour
Schedule::command('shouts:purge')
    ->hourly()
    ->withoutOverlapping();

// Shouts: detect groups (3+ participants nearby) every 5 minutes
Schedule::command('shouts:detect-group')
    ->everyFiveMinutes()
    ->withoutOverlapping()
    ->runInBackground();

// Squads: check streak daily at midnight UTC
Schedule::command('squads:check-streak')
    ->dailyAt('00:00')
    ->withoutOverlapping();

// Squads: handle expired temporary squads daily at midnight
Schedule::command('squads:convert-temporary')
    ->dailyAt('00:00')
    ->withoutOverlapping();

// Flash: select daily POIs at midnight
Schedule::command('flash:select-daily')
    ->dailyAt('00:00')
    ->withoutOverlapping();

// Flash: distribute push notifications every 30 minutes (9h-21h per user timezone)
Schedule::command('flash:send')
    ->everyThirtyMinutes()
    ->withoutOverlapping()
    ->runInBackground();

// Feed: notify friends of notable stamps at 18h UTC
Schedule::command('feed:friend-stamp-notif')
    ->dailyAt('18:00')
    ->withoutOverlapping();

// Notifications: purge old logs daily at 3h
Schedule::command('notifications:purge-logs')
    ->dailyAt('03:00')
    ->withoutOverlapping();
