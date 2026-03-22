<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PassportLevelSeeder extends Seeder
{
    public function run(): void
    {
        $levels = [
            [1, 'Tourist', 'Touriste', 0],
            [2, 'Curious', 'Curieux', 3],
            [3, 'Wanderer', 'Promeneur', 7],
            [4, 'Explorer', 'Explorateur', 12],
            [5, 'Adventurer', 'Aventurier', 20],
            [6, 'Traveler', 'Voyageur', 30],
            [7, 'Pathfinder', 'Éclaireur', 42],
            [8, 'Nomad', 'Nomade', 55],
            [9, 'Globetrotter', 'Globe-Trotter', 70],
            [10, 'Discoverer', 'Découvreur', 90],
            [11, 'Pioneer', 'Pionnier', 110],
            [12, 'Navigator', 'Navigateur', 135],
            [13, 'Elite Voyager', 'Voyageur d\'Élite', 160],
            [14, 'Surveyor', 'Arpenteur', 190],
            [15, 'Cartographer', 'Cartographe', 220],
            [16, 'Captain', 'Capitaine', 255],
            [17, 'Commander', 'Commandant', 290],
            [18, 'Champion', 'Champion', 330],
            [19, 'Master Explorer', 'Maître Explorateur', 370],
            [20, 'World Mapper', 'Cartographe du Monde', 415],
            [21, 'Elite', 'Élite', 460],
            [22, 'Virtuoso', 'Virtuose', 510],
            [23, 'Grand Explorer', 'Grand Explorateur', 565],
            [24, 'Sovereign', 'Souverain', 620],
            [25, 'Titan', 'Titan', 680],
            [26, 'Mythic', 'Mythique', 750],
            [27, 'Immortal', 'Immortel', 830],
            [28, 'Transcendent', 'Transcendant', 920],
            [29, 'Celestial', 'Céleste', 1020],
            [30, 'Legend', 'Légende', 1150],
        ];

        foreach ($levels as [$level, $en, $fr, $minStamps]) {
            DB::table('passport_levels')->updateOrInsert(
                ['level' => $level],
                [
                    'name' => json_encode(['en' => $en, 'fr' => $fr]),
                    'min_stamps' => $minStamps,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
    }
}
