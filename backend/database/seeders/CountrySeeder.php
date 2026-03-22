<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CountrySeeder extends Seeder
{
    public function run(): void
    {
        $countries = [
            ['AF','Afghanistan','Afghanistan','+93','AFN'],['AL','Albania','Albanie','+355','ALL'],['DZ','Algeria','Algérie','+213','DZD'],['AD','Andorra','Andorre','+376','EUR'],['AO','Angola','Angola','+244','AOA'],['AG','Antigua and Barbuda','Antigua-et-Barbuda','+1','XCD'],['AR','Argentina','Argentine','+54','ARS'],['AM','Armenia','Arménie','+374','AMD'],['AU','Australia','Australie','+61','AUD'],['AT','Austria','Autriche','+43','EUR'],
            ['AZ','Azerbaijan','Azerbaïdjan','+994','AZN'],['BS','Bahamas','Bahamas','+1','BSD'],['BH','Bahrain','Bahreïn','+973','BHD'],['BD','Bangladesh','Bangladesh','+880','BDT'],['BB','Barbados','Barbade','+1','BBD'],['BY','Belarus','Biélorussie','+375','BYN'],['BE','Belgium','Belgique','+32','EUR'],['BZ','Belize','Belize','+501','BZD'],['BJ','Benin','Bénin','+229','XOF'],['BT','Bhutan','Bhoutan','+975','BTN'],
            ['BO','Bolivia','Bolivie','+591','BOB'],['BA','Bosnia and Herzegovina','Bosnie-Herzégovine','+387','BAM'],['BW','Botswana','Botswana','+267','BWP'],['BR','Brazil','Brésil','+55','BRL'],['BN','Brunei','Brunei','+673','BND'],['BG','Bulgaria','Bulgarie','+359','BGN'],['BF','Burkina Faso','Burkina Faso','+226','XOF'],['BI','Burundi','Burundi','+257','BIF'],['CV','Cabo Verde','Cap-Vert','+238','CVE'],['KH','Cambodia','Cambodge','+855','KHR'],
            ['CM','Cameroon','Cameroun','+237','XAF'],['CA','Canada','Canada','+1','CAD'],['CF','Central African Republic','Centrafrique','+236','XAF'],['TD','Chad','Tchad','+235','XAF'],['CL','Chile','Chili','+56','CLP'],['CN','China','Chine','+86','CNY'],['CO','Colombia','Colombie','+57','COP'],['KM','Comoros','Comores','+269','KMF'],['CG','Congo','Congo','+242','XAF'],['CD','Congo (DRC)','RD Congo','+243','CDF'],
            ['CR','Costa Rica','Costa Rica','+506','CRC'],['CI','Côte d\'Ivoire','Côte d\'Ivoire','+225','XOF'],['HR','Croatia','Croatie','+385','EUR'],['CU','Cuba','Cuba','+53','CUP'],['CY','Cyprus','Chypre','+357','EUR'],['CZ','Czechia','Tchéquie','+420','CZK'],['DK','Denmark','Danemark','+45','DKK'],['DJ','Djibouti','Djibouti','+253','DJF'],['DM','Dominica','Dominique','+1','XCD'],['DO','Dominican Republic','Rép. Dominicaine','+1','DOP'],
            ['EC','Ecuador','Équateur','+593','USD'],['EG','Egypt','Égypte','+20','EGP'],['SV','El Salvador','El Salvador','+503','USD'],['GQ','Equatorial Guinea','Guinée Équatoriale','+240','XAF'],['ER','Eritrea','Érythrée','+291','ERN'],['EE','Estonia','Estonie','+372','EUR'],['SZ','Eswatini','Eswatini','+268','SZL'],['ET','Ethiopia','Éthiopie','+251','ETB'],['FJ','Fiji','Fidji','+679','FJD'],['FI','Finland','Finlande','+358','EUR'],
            ['FR','France','France','+33','EUR'],['GA','Gabon','Gabon','+241','XAF'],['GM','Gambia','Gambie','+220','GMD'],['GE','Georgia','Géorgie','+995','GEL'],['DE','Germany','Allemagne','+49','EUR'],['GH','Ghana','Ghana','+233','GHS'],['GR','Greece','Grèce','+30','EUR'],['GD','Grenada','Grenade','+1','XCD'],['GT','Guatemala','Guatemala','+502','GTQ'],['GN','Guinea','Guinée','+224','GNF'],
            ['GW','Guinea-Bissau','Guinée-Bissau','+245','XOF'],['GY','Guyana','Guyana','+592','GYD'],['HT','Haiti','Haïti','+509','HTG'],['HN','Honduras','Honduras','+504','HNL'],['HU','Hungary','Hongrie','+36','HUF'],['IS','Iceland','Islande','+354','ISK'],['IN','India','Inde','+91','INR'],['ID','Indonesia','Indonésie','+62','IDR'],['IR','Iran','Iran','+98','IRR'],['IQ','Iraq','Irak','+964','IQD'],
            ['IE','Ireland','Irlande','+353','EUR'],['IL','Israel','Israël','+972','ILS'],['IT','Italy','Italie','+39','EUR'],['JM','Jamaica','Jamaïque','+1','JMD'],['JP','Japan','Japon','+81','JPY'],['JO','Jordan','Jordanie','+962','JOD'],['KZ','Kazakhstan','Kazakhstan','+7','KZT'],['KE','Kenya','Kenya','+254','KES'],['KI','Kiribati','Kiribati','+686','AUD'],['KP','North Korea','Corée du Nord','+850','KPW'],
            ['KR','South Korea','Corée du Sud','+82','KRW'],['KW','Kuwait','Koweït','+965','KWD'],['KG','Kyrgyzstan','Kirghizistan','+996','KGS'],['LA','Laos','Laos','+856','LAK'],['LV','Latvia','Lettonie','+371','EUR'],['LB','Lebanon','Liban','+961','LBP'],['LS','Lesotho','Lesotho','+266','LSL'],['LR','Liberia','Libéria','+231','LRD'],['LY','Libya','Libye','+218','LYD'],['LI','Liechtenstein','Liechtenstein','+423','CHF'],
            ['LT','Lithuania','Lituanie','+370','EUR'],['LU','Luxembourg','Luxembourg','+352','EUR'],['MG','Madagascar','Madagascar','+261','MGA'],['MW','Malawi','Malawi','+265','MWK'],['MY','Malaysia','Malaisie','+60','MYR'],['MV','Maldives','Maldives','+960','MVR'],['ML','Mali','Mali','+223','XOF'],['MT','Malta','Malte','+356','EUR'],['MH','Marshall Islands','Îles Marshall','+692','USD'],['MR','Mauritania','Mauritanie','+222','MRU'],
            ['MU','Mauritius','Maurice','+230','MUR'],['MX','Mexico','Mexique','+52','MXN'],['FM','Micronesia','Micronésie','+691','USD'],['MD','Moldova','Moldavie','+373','MDL'],['MC','Monaco','Monaco','+377','EUR'],['MN','Mongolia','Mongolie','+976','MNT'],['ME','Montenegro','Monténégro','+382','EUR'],['MA','Morocco','Maroc','+212','MAD'],['MZ','Mozambique','Mozambique','+258','MZN'],['MM','Myanmar','Myanmar','+95','MMK'],
            ['NA','Namibia','Namibie','+264','NAD'],['NR','Nauru','Nauru','+674','AUD'],['NP','Nepal','Népal','+977','NPR'],['NL','Netherlands','Pays-Bas','+31','EUR'],['NZ','New Zealand','Nouvelle-Zélande','+64','NZD'],['NI','Nicaragua','Nicaragua','+505','NIO'],['NE','Niger','Niger','+227','XOF'],['NG','Nigeria','Nigéria','+234','NGN'],['MK','North Macedonia','Macédoine du Nord','+389','MKD'],['NO','Norway','Norvège','+47','NOK'],
            ['OM','Oman','Oman','+968','OMR'],['PK','Pakistan','Pakistan','+92','PKR'],['PW','Palau','Palaos','+680','USD'],['PS','Palestine','Palestine','+970','ILS'],['PA','Panama','Panama','+507','PAB'],['PG','Papua New Guinea','Papouasie-Nouvelle-Guinée','+675','PGK'],['PY','Paraguay','Paraguay','+595','PYG'],['PE','Peru','Pérou','+51','PEN'],['PH','Philippines','Philippines','+63','PHP'],['PL','Poland','Pologne','+48','PLN'],
            ['PT','Portugal','Portugal','+351','EUR'],['QA','Qatar','Qatar','+974','QAR'],['RO','Romania','Roumanie','+40','RON'],['RU','Russia','Russie','+7','RUB'],['RW','Rwanda','Rwanda','+250','RWF'],['KN','Saint Kitts and Nevis','Saint-Kitts-et-Nevis','+1','XCD'],['LC','Saint Lucia','Sainte-Lucie','+1','XCD'],['VC','Saint Vincent','Saint-Vincent','+1','XCD'],['WS','Samoa','Samoa','+685','WST'],['SM','San Marino','Saint-Marin','+378','EUR'],
            ['ST','São Tomé and Príncipe','São Tomé-et-Príncipe','+239','STN'],['SA','Saudi Arabia','Arabie Saoudite','+966','SAR'],['SN','Senegal','Sénégal','+221','XOF'],['RS','Serbia','Serbie','+381','RSD'],['SC','Seychelles','Seychelles','+248','SCR'],['SL','Sierra Leone','Sierra Leone','+232','SLE'],['SG','Singapore','Singapour','+65','SGD'],['SK','Slovakia','Slovaquie','+421','EUR'],['SI','Slovenia','Slovénie','+386','EUR'],['SB','Solomon Islands','Îles Salomon','+677','SBD'],
            ['SO','Somalia','Somalie','+252','SOS'],['ZA','South Africa','Afrique du Sud','+27','ZAR'],['SS','South Sudan','Soudan du Sud','+211','SSP'],['ES','Spain','Espagne','+34','EUR'],['LK','Sri Lanka','Sri Lanka','+94','LKR'],['SD','Sudan','Soudan','+249','SDG'],['SR','Suriname','Suriname','+597','SRD'],['SE','Sweden','Suède','+46','SEK'],['CH','Switzerland','Suisse','+41','CHF'],['SY','Syria','Syrie','+963','SYP'],
            ['TW','Taiwan','Taïwan','+886','TWD'],['TJ','Tajikistan','Tadjikistan','+992','TJS'],['TZ','Tanzania','Tanzanie','+255','TZS'],['TH','Thailand','Thaïlande','+66','THB'],['TL','Timor-Leste','Timor oriental','+670','USD'],['TG','Togo','Togo','+228','XOF'],['TO','Tonga','Tonga','+676','TOP'],['TT','Trinidad and Tobago','Trinité-et-Tobago','+1','TTD'],['TN','Tunisia','Tunisie','+216','TND'],['TR','Turkey','Turquie','+90','TRY'],
            ['TM','Turkmenistan','Turkménistan','+993','TMT'],['TV','Tuvalu','Tuvalu','+688','AUD'],['UG','Uganda','Ouganda','+256','UGX'],['UA','Ukraine','Ukraine','+380','UAH'],['AE','United Arab Emirates','Émirats Arabes Unis','+971','AED'],['GB','United Kingdom','Royaume-Uni','+44','GBP'],['US','United States','États-Unis','+1','USD'],['UY','Uruguay','Uruguay','+598','UYU'],['UZ','Uzbekistan','Ouzbékistan','+998','UZS'],['VU','Vanuatu','Vanuatu','+678','VUV'],
            ['VA','Vatican City','Vatican','+39','EUR'],['VE','Venezuela','Venezuela','+58','VES'],['VN','Vietnam','Viêt Nam','+84','VND'],['YE','Yemen','Yémen','+967','YER'],['ZM','Zambia','Zambie','+260','ZMW'],['ZW','Zimbabwe','Zimbabwe','+263','ZWL'],
        ];

        foreach (array_chunk($countries, 50) as $chunk) {
            $rows = [];
            foreach ($chunk as [$code, $en, $fr, $prefix, $currency]) {
                $rows[] = [
                    'code' => $code,
                    'name' => json_encode(['en' => $en, 'fr' => $fr]),
                    'is_active' => true,
                    'dating_enabled' => false,
                    'currency_code' => $currency,
                    'phone_prefix' => $prefix,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
            DB::table('countries')->insert($rows);
        }
    }
}
