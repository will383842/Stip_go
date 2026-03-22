<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Region extends Model
{
    public $timestamps = false;

    protected $fillable = ['country_code', 'name', 'boundary', 'center'];

    protected function casts(): array
    {
        return [
            'name' => 'array',
        ];
    }
}
