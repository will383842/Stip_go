<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Country boundaries (197 countries, seeded from Natural Earth GeoJSON)
        DB::statement('
            CREATE TABLE country_boundaries (
                id SERIAL PRIMARY KEY,
                country_code CHAR(2) UNIQUE NOT NULL,
                boundary GEOMETRY(MultiPolygon, 4326) NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        ');
        DB::statement('CREATE INDEX idx_country_boundaries_geom ON country_boundaries USING GIST (boundary)');

        // City boundaries (~1000 cities, seeded from OpenStreetMap)
        DB::statement('
            CREATE TABLE city_boundaries (
                id SERIAL PRIMARY KEY,
                city_name VARCHAR(100) NOT NULL,
                country_code CHAR(2) NOT NULL,
                center GEOGRAPHY(Point, 4326) NOT NULL,
                boundary GEOMETRY(MultiPolygon, 4326),
                radius_km INTEGER NOT NULL DEFAULT 20,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        ');
        DB::statement('CREATE INDEX idx_city_boundaries_geom ON city_boundaries USING GIST (boundary)');
        DB::statement('CREATE INDEX idx_city_boundaries_center ON city_boundaries USING GIST (center)');

        // Regions (~3000-5000 admin regions, seeded from OpenStreetMap)
        DB::statement('
            CREATE TABLE regions (
                id SERIAL PRIMARY KEY,
                country_code CHAR(2) NOT NULL,
                name JSONB NOT NULL,
                boundary GEOMETRY(MultiPolygon, 4326) NOT NULL,
                center GEOGRAPHY(Point, 4326) NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        ');
        DB::statement('CREATE INDEX idx_regions_geom ON regions USING GIST (boundary)');
    }

    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS regions CASCADE');
        DB::statement('DROP TABLE IF EXISTS city_boundaries CASCADE');
        DB::statement('DROP TABLE IF EXISTS country_boundaries CASCADE');
    }
};
