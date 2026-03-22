<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Country extends Model
{
    protected $fillable = ['code', 'name', 'is_active', 'dating_enabled', 'currency_code', 'phone_prefix'];

    protected function casts(): array
    {
        return [
            'name' => 'array',
            'is_active' => 'boolean',
            'dating_enabled' => 'boolean',
        ];
    }
}
