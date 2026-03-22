<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * @property Carbon $started_at
 * @property Carbon|null $finished_at
 */
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

    public static function start(string $name): self
    {
        /** @var self $log */
        $log = static::create([
            'cron_name' => $name,
            'started_at' => now(),
            'status' => 'running',
        ]);

        return $log;
    }

    public function finish(int $processed = 0): void
    {
        $startedAt = $this->started_at;

        $this->update([
            'finished_at' => now(),
            'status' => 'success',
            'records_processed' => $processed,
            'duration_ms' => (int) $startedAt->diffInMilliseconds(now()),
        ]);
    }

    public function fail(string $error): void
    {
        $startedAt = $this->started_at;

        $this->update([
            'finished_at' => now(),
            'status' => 'error',
            'error_message' => $error,
            'duration_ms' => (int) $startedAt->diffInMilliseconds(now()),
        ]);
    }
}
