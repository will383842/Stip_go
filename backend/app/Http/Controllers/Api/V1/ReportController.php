<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Report;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'reported_user_id' => 'required|uuid|exists:users,id',
            'type' => 'required|string|max:50',
            'description' => 'nullable|string|max:1000',
        ]);

        Report::create([
            'reporter_user_id' => $request->user()->id,
            'reported_user_id' => $request->reported_user_id,
            'type' => $request->type,
            'description' => $request->description,
        ]);

        return response()->json([
            'data' => ['message' => 'Signalement envoyé'],
            'meta' => [],
            'errors' => [],
        ], 201);
    }
}
