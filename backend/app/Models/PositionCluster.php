<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PositionCluster extends Model
{
    public $timestamps = false;

    protected $fillable = ['zoom_level', 'center', 'count', 'bbox', 'updated_at'];

    protected function casts(): array
    {
        return [
            'zoom_level' => 'integer',
            'count' => 'integer',
            'updated_at' => 'datetime',
        ];
    }
}
