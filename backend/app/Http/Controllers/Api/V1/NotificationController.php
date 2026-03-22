<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $notifications = Notification::where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->cursorPaginate(20);

        return response()->json([
            'data' => $notifications->items(),
            'meta' => [
                'pagination' => [
                    'cursor' => $notifications->nextCursor()?->encode(),
                    'has_more' => $notifications->hasMorePages(),
                ],
            ],
            'errors' => [],
        ]);
    }

    public function markRead(Request $request, string $notificationId): JsonResponse
    {
        // H4 fix: graceful 404 instead of exception leak
        $notification = Notification::where('user_id', $request->user()->id)
            ->where('id', $notificationId)
            ->first();

        if (! $notification) {
            return response()->json([
                'data' => null,
                'errors' => [['code' => 'not_found', 'message' => 'Notification non trouvée']],
            ], 404);
        }

        $notification->update(['read_at' => now()]);

        return response()->json([
            'data' => $notification,
            'meta' => [],
            'errors' => [],
        ]);
    }
}
