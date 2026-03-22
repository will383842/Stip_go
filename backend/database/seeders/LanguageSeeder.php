<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LanguageSeeder extends Seeder
{
    public function run(): void
    {
        $languages = [
            ['code' => 'fr', 'name' => 'Français', 'is_active' => true, 'is_rtl' => false],
            ['code' => 'en', 'name' => 'English', 'is_active' => true, 'is_rtl' => false],
            ['code' => 'de', 'name' => 'Deutsch', 'is_active' => true, 'is_rtl' => false],
            ['code' => 'ru', 'name' => 'Русский', 'is_active' => true, 'is_rtl' => false],
            ['code' => 'zh-CN', 'name' => '简体中文', 'is_active' => true, 'is_rtl' => false],
            ['code' => 'zh-TW', 'name' => '繁體中文', 'is_active' => true, 'is_rtl' => false],
            ['code' => 'es', 'name' => 'Español', 'is_active' => true, 'is_rtl' => false],
            ['code' => 'pt', 'name' => 'Português', 'is_active' => true, 'is_rtl' => false],
            ['code' => 'ar', 'name' => 'العربية', 'is_active' => true, 'is_rtl' => true],
            ['code' => 'hi', 'name' => 'हिन्दी', 'is_active' => true, 'is_rtl' => false],
        ];

        foreach ($languages as $lang) {
            DB::table('languages')->updateOrInsert(
                ['code' => $lang['code']],
                array_merge($lang, ['created_at' => now(), 'updated_at' => now()])
            );
        }
    }
}
