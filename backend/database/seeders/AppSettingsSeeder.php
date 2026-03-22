<?php

namespace Database\Seeders;

use App\Models\AppSetting;
use Illuminate\Database\Seeder;

class AppSettingsSeeder extends Seeder
{
    public function run(): void
    {
        AppSetting::set('min_version', '1.0.0');
        AppSetting::set('latest_version', '1.0.0');
    }
}
