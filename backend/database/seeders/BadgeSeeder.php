<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BadgeSeeder extends Seeder
{
    public function run(): void
    {
        $badges = [
            ['code' => 'first_stamp', 'name' => '{"en":"First Stamp","fr":"Premier Stamp"}', 'description' => '{"en":"Earn your first stamp","fr":"Obtiens ton premier stamp"}', 'category' => 'special', 'trigger_type' => 'auto'],
            ['code' => 'five_countries', 'name' => '{"en":"Globe-Trotter","fr":"Globe-Trotter"}', 'description' => '{"en":"Visit 5 countries","fr":"Visite 5 pays"}', 'category' => 'country', 'trigger_type' => 'auto'],
            ['code' => 'ten_countries', 'name' => '{"en":"World Explorer","fr":"Explorateur du Monde"}', 'description' => '{"en":"Visit 10 countries","fr":"Visite 10 pays"}', 'category' => 'country', 'trigger_type' => 'auto'],
            ['code' => 'twenty_five_countries', 'name' => '{"en":"World Citizen","fr":"Citoyen du Monde"}', 'description' => '{"en":"Visit 25 countries","fr":"Visite 25 pays"}', 'category' => 'country', 'trigger_type' => 'auto'],
            ['code' => 'ten_cities', 'name' => '{"en":"City Explorer","fr":"Citadin"}', 'description' => '{"en":"Visit 10 cities","fr":"Visite 10 villes"}', 'category' => 'city', 'trigger_type' => 'auto'],
            ['code' => 'fifty_cities', 'name' => '{"en":"Metropolitan","fr":"Métropolitain"}', 'description' => '{"en":"Visit 50 cities","fr":"Visite 50 villes"}', 'category' => 'city', 'trigger_type' => 'auto'],
            ['code' => 'ten_spots', 'name' => '{"en":"Curious","fr":"Curieux"}', 'description' => '{"en":"Visit 10 spots","fr":"Visite 10 spots"}', 'category' => 'spot', 'trigger_type' => 'auto'],
            ['code' => 'fifty_spots', 'name' => '{"en":"Adventurer","fr":"Aventurier"}', 'description' => '{"en":"Visit 50 spots","fr":"Visite 50 spots"}', 'category' => 'spot', 'trigger_type' => 'auto'],
            ['code' => 'hundred_spots', 'name' => '{"en":"Local Legend","fr":"Légende Locale"}', 'description' => '{"en":"Visit 100 spots","fr":"Visite 100 spots"}', 'category' => 'spot', 'trigger_type' => 'auto'],
            ['code' => 'five_regions', 'name' => '{"en":"Regional","fr":"Régional"}', 'description' => '{"en":"Visit 5 regions","fr":"Visite 5 régions"}', 'category' => 'region', 'trigger_type' => 'auto'],
            ['code' => 'first_export', 'name' => '{"en":"Storyteller","fr":"Conteur"}', 'description' => '{"en":"Share your first export","fr":"Partage ton premier export"}', 'category' => 'special', 'trigger_type' => 'auto'],
            ['code' => 'connector', 'name' => '{"en":"Connector","fr":"Connecteur"}', 'description' => '{"en":"Invite 1 friend","fr":"Invite 1 ami"}', 'category' => 'special', 'trigger_type' => 'auto'],
            ['code' => 'ambassador', 'name' => '{"en":"Ambassador","fr":"Ambassadeur"}', 'description' => '{"en":"Invite 5 friends","fr":"Invite 5 amis"}', 'category' => 'special', 'trigger_type' => 'auto'],
            ['code' => 'pioneer', 'name' => '{"en":"Pioneer","fr":"Pionnier"}', 'description' => '{"en":"Early adopter","fr":"Adopteur précoce"}', 'category' => 'special', 'trigger_type' => 'manual'],
            ['code' => 'founder', 'name' => '{"en":"Founder","fr":"Fondateur"}', 'description' => '{"en":"Founding team member","fr":"Membre de l\'équipe fondatrice"}', 'category' => 'special', 'trigger_type' => 'manual'],
        ];

        foreach ($badges as $badge) {
            DB::table('badges')->updateOrInsert(
                ['code' => $badge['code']],
                array_merge($badge, ['created_at' => now(), 'updated_at' => now()])
            );
        }
    }
}
