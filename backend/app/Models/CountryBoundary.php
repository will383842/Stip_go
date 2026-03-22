<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CountryBoundary extends Model
{
    public $timestamps = false;

    protected $fillable = ['country_code', 'boundary'];
}
