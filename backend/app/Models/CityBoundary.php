<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CityBoundary extends Model
{
    public $timestamps = false;

    protected $fillable = ['city_name', 'country_code', 'center', 'boundary', 'radius_km'];
}
