<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreSupremeCourtRequest;
use App\Http\Requests\Api\UpdateSupremeCourtRequest;
use App\Http\Resources\SupremeCourtResource;
use App\Models\SupremeCourt;
use App\Services\ArchiveService;
use App\Services\DocumentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class SupremeCourtController extends Controller
{
    protected ArchiveService $archiveService;
    protected DocumentService $documentService;

    public function __construct(ArchiveService $archiveService, DocumentService $documentService)
    {
        $this->archiveService = $archiveService;
        $this->documentService = $documentService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = SupremeCourt::query();

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where('supreme_case_number', 'like', "%{$search}%");
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Sorting
        $allowedSorts = ['supreme_case_number', 'supreme_date', 'sessionDate', 'created_at', 'appealed_by'];
        $sortBy = $request->get('sort_by', 'created_at');
        if (!in_array($sortBy, $allowedSorts)) {
            $sortBy = 'created_at';
        }
        $order = strtolower($request->get('order', 'asc')) === 'asc' ? 'asc' : 'desc';

        $perPage = $request->get('per_page', 10);
        $cases = $query->orderBy($sortBy, $order)->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => SupremeCourtResource::collection($cases->items()),
            'meta' => [
                'current_page' => $cases->currentPage(),
                'last_page' => $cases->lastPage(),
                'per_page' => $cases->perPage(),
                'total' => $cases->total(),
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreSupremeCourtRequest $request): JsonResponse
    {
        // Block viewers from creating cases
        if ($request->user()->role === 'viewer') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Viewers cannot create cases.',
            ], 403);
        }

        $case = SupremeCourt::create($request->validated());

        // Copy documents from linked appeal case to this supreme court case
        if ($case->appeal_request_id) {
            try {
                $this->documentService->copyFromAppealToSupreme(
                    $case->appeal_request_id,
                    $case->supreme_request_id
                );
            } catch (\Exception $e) {
                // Log error but don't fail the supreme court case creation
                Log::error('Failed to copy documents from appeal to supreme court case', [
                    'appeal_case_id' => $case->appeal_request_id,
                    'supreme_case_id' => $case->supreme_request_id,
                    'error' => $e->getMessage()
                ]);
            }
        }

        // Log to archive
        $this->archiveService->logCaseChange(
            'supreme',
            $case->supreme_request_id,
            'created',
            null,
            $case->toArray()
        );

        return response()->json([
            'success' => true,
            'data' => new SupremeCourtResource($case),
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        $case = SupremeCourt::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => new SupremeCourtResource($case),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateSupremeCourtRequest $request, string $id): JsonResponse
    {
        // Block viewers from updating cases
        if ($request->user()->role === 'viewer') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Viewers cannot update cases.',
            ], 403);
        }

        $case = SupremeCourt::findOrFail($id);
        $oldData = $case->toArray();

        $case->update($request->validated());

        // Log to archive
        $this->archiveService->logCaseChange(
            'supreme',
            $case->supreme_request_id,
            'updated',
            $oldData,
            $case->toArray()
        );

        return response()->json([
            'success' => true,
            'data' => new SupremeCourtResource($case),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        // Block viewers from deleting cases
        if ($request->user()->role === 'viewer') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Viewers cannot delete cases.',
            ], 403);
        }

        $case = SupremeCourt::findOrFail($id);
        $oldData = $case->toArray();

        // Log to archive
        $this->archiveService->logCaseChange(
            'supreme',
            $case->supreme_request_id,
            'deleted',
            $oldData,
            null
        );

        $case->delete();

        return response()->json([
            'success' => true,
            'message' => 'Supreme court case deleted successfully',
        ]);
    }
}
