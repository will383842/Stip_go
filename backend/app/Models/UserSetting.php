<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserSetting extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'visible_clusters',
        'visible_dating',
        'visible_family',
        'visible_parcours',
        'dark_mode',
        'notification_push',
        'notification_email',
        'notification_social',
        'notification_engagement',
        'notification_marketing',
        'text_size',
        'sounds_enabled',
        'haptic_enabled',
        'family_mode',
        'quiet_hours_start',
        'quiet_hours_end',
        'auto_share_stamps',
        'default_stamp_template',
        'notification_nearby_spots',
        'notification_friend_stamps',
        'night_visibility_hidden',
        'visibility_contacted_only',
    ];

    protected function casts(): array
    {
        return [
            'visible_clusters' => 'boolean',
            'visible_dating' => 'boolean',
            'visible_family' => 'boolean',
            'notification_push' => 'boolean',
            'notification_email' => 'boolean',
            'notification_social' => 'boolean',
            'notification_engagement' => 'boolean',
            'notification_marketing' => 'boolean',
            'sounds_enabled' => 'boolean',
            'haptic_enabled' => 'boolean',
            'family_mode' => 'boolean',
            'auto_share_stamps' => 'boolean',
            'notification_nearby_spots' => 'boolean',
            'notification_friend_stamps' => 'boolean',
            'night_visibility_hidden' => 'boolean',
            'visibility_contacted_only' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
