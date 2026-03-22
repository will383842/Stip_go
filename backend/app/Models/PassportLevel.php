<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PassportLevel extends Model
{
    protected $fillable = ['level', 'name', 'min_stamps', 'icon_url'];

    protected function casts(): array
    {
        return [
            'name' => 'array',
            'min_stamps' => 'integer',
            'level' => 'integer',
        ];
    }
}
