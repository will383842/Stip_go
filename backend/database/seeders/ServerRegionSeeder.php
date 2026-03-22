<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ServerRegionSeeder extends Seeder
{
    public function run(): void
    {
        $regions = [
            ['code' => 'eu-central', 'name' => 'Europe (Falkenstein)', 'is_active' => true, 'is_primary' => true],
            ['code' => 'ap-southeast', 'name' => 'Asia (Singapore)', 'is_active' => false, 'is_primary' => false],
            ['code' => 'us-east', 'name' => 'Americas (Ashburn)', 'is_active' => false, 'is_primary' => false],
            ['code' => 'sa-east', 'name' => 'South America (São Paulo)', 'is_active' => false, 'is_primary' => false],
            ['code' => 'oc-southeast', 'name' => 'Oceania (Sydney)', 'is_active' => false, 'is_primary' => false],
        ];

        foreach ($regions as $region) {
            DB::table('server_regions')->updateOrInsert(
                ['code' => $region['code']],
                array_merge($region, ['created_at' => now(), 'updated_at' => now()])
            );
        }
    }
}
