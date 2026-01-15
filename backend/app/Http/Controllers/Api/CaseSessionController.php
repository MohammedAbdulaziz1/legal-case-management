<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreCaseSessionRequest;
use App\Http\Requests\Api\UpdateCaseSessionRequest;
use App\Http\Resources\CaseSessionResource;
use App\Models\CaseSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CaseSessionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = CaseSession::query();

        if ($request->has('case_type')) {
            $query->where('case_type', $request->get('case_type'));
        }

        if ($request->has('case_number')) {
            $query->where('case_number', (int) $request->get('case_number'));
        }

        $perPage = $request->get('per_page', 20);
        $sessions = $query->orderBy('session_date', 'desc')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => CaseSessionResource::collection($sessions->items()),
            'meta' => [
                'current_page' => $sessions->currentPage(),
                'last_page' => $sessions->lastPage(),
                'per_page' => $sessions->perPage(),
                'total' => $sessions->total(),
            ],
        ]);
    }

    public function store(StoreCaseSessionRequest $request): JsonResponse
    {
        // Block viewers from creating sessions
        if ($request->user()->role === 'viewer') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Viewers cannot create sessions.',
            ], 403);
        }

        $session = CaseSession::create($request->validated());

        return response()->json([
            'success' => true,
            'data' => new CaseSessionResource($session),
        ], 201);
    }

    public function show(string $id): JsonResponse
    {
        $session = CaseSession::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => new CaseSessionResource($session),
        ]);
    }

    public function update(UpdateCaseSessionRequest $request, string $id): JsonResponse
    {
        // Block viewers from updating sessions
        if ($request->user()->role === 'viewer') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Viewers cannot update sessions.',
            ], 403);
        }

        $session = CaseSession::findOrFail($id);
        $session->update($request->validated());

        return response()->json([
            'success' => true,
            'data' => new CaseSessionResource($session),
        ]);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        // Block viewers from deleting sessions
        if ($request->user()->role === 'viewer') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Viewers cannot delete sessions.',
            ], 403);
        }

        $session = CaseSession::findOrFail($id);
        $session->delete();

        return response()->json([
            'success' => true,
            'message' => 'Session deleted successfully',
        ]);
    }
}
