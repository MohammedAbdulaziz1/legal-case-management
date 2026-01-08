<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ArchiveResource;
use App\Models\ArchiveLog;
use App\Services\ArchiveService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ArchiveController extends Controller
{
    protected ArchiveService $archiveService;

    public function __construct(ArchiveService $archiveService)
    {
        $this->archiveService = $archiveService;
    }

    /**
     * Display a listing of archive entries.
     */
    public function index(Request $request): JsonResponse
    {
        $query = ArchiveLog::with('user');

        // Filter by case type
        if ($request->has('case_type')) {
            $query->where('case_type', $request->case_type);
        }

        // Filter by action
        if ($request->has('action')) {
            $query->where('action', $request->action);
        }

        $perPage = $request->get('per_page', 20);
        $logs = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => ArchiveResource::collection($logs->items()),
            'meta' => [
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
                'per_page' => $logs->perPage(),
                'total' => $logs->total(),
            ],
        ]);
    }

    /**
     * Display the specified archive entry.
     */
    public function show(string $id): JsonResponse
    {
        $log = ArchiveLog::with('user')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => new ArchiveResource($log),
        ]);
    }

    /**
     * Get case history
     */
    public function caseHistory(string $caseType, string $caseId): JsonResponse
    {
        $history = $this->archiveService->getCaseHistory($caseType, $caseId);

        return response()->json([
            'success' => true,
            'entries' => ArchiveResource::collection($history),
        ]);
    }

    /**
     * Export archive
     */
    public function export(Request $request)
    {
        // This is a placeholder for export functionality
        // You can implement CSV/Excel export here
        return response()->json([
            'success' => true,
            'message' => 'Export functionality to be implemented',
        ]);
    }
}
