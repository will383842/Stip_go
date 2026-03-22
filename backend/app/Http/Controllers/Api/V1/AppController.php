<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use Illuminate\Http\JsonResponse;

class AppController extends Controller
{
    public function version(): JsonResponse
    {
        return response()->json([
            'data' => [
                'min_version' => AppSetting::get('min_version', '1.0.0'),
                'latest_version' => AppSetting::get('latest_version', '1.0.0'),
                'update_url' => 'https://play.google.com/store/apps/details?id=com.stipme.app',
            ],
            'meta' => [],
            'errors' => [],
        ]);
    }

    public function health(): JsonResponse
    {
        return response()->json([
            'data' => [
                'status' => 'ok',
                'app' => config('app.name'),
                'version' => '1.0.0',
                'timestamp' => now()->toIso8601String(),
            ],
            'meta' => [],
            'errors' => [],
        ]);
    }
}
