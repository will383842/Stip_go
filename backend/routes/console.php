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
