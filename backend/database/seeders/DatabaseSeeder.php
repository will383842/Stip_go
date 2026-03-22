<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            CountrySeeder::class,
            LanguageSeeder::class,
            BadgeSeeder::class,
            PassportLevelSeeder::class,
            ServerRegionSeeder::class,
            AppSettingsSeeder::class,
        ]);

        // NOTE: Geo boundaries (country_boundaries, city_boundaries, regions)
        // are imported via ogr2ogr shell commands, NOT PHP seeders.
        // See: prompts/implementation-app/05-SPRINT-1-2-BACKEND-FRONTEND-CORE.md
    }
}
