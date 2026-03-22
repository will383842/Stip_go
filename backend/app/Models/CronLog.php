<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CronLog extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'cron_name',
        'started_at',
        'finished_at',
        'status',
        'records_processed',
        'error_message',
        'duration_ms',
    ];

    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'finished_at' => 'datetime',
        ];
    }

    public static function start(string $name): static
    {
        return static::create([
            'cron_name' => $name,
            'started_at' => now(),
            'status' => 'running',
        ]);
    }

    public function finish(int $processed = 0): void
    {
        $this->update([
            'finished_at' => now(),
            'status' => 'success',
            'records_processed' => $processed,
            'duration_ms' => (int) $this->started_at->diffInMilliseconds(now()),
        ]);
    }

    public function fail(string $error): void
    {
        $this->update([
            'finished_at' => now(),
            'status' => 'error',
            'error_message' => $error,
            'duration_ms' => (int) $this->started_at->diffInMilliseconds(now()),
        ]);
    }
}
