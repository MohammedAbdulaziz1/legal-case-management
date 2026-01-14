<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreAppealRequest;
use App\Http\Requests\Api\UpdateAppealRequest;
use App\Http\Resources\AppealResource;
use App\Models\Appeal;
use App\Services\ArchiveService;
use App\Services\DocumentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AppealController extends Controller
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
        $query = Appeal::query();

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('appeal_number', 'like', "%{$search}%")
                  ->orWhere('plaintiff', 'like', "%{$search}%")
                  ->orWhere('defendant', 'like', "%{$search}%")
                  ->orWhere('subject', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Sorting
        $allowedSorts = ['appeal_number', 'appeal_date', 'sessionDate', 'created_at', 'appealed_by'];
        $sortBy = $request->get('sort_by', 'created_at');
        if (!in_array($sortBy, $allowedSorts)) {
            $sortBy = 'created_at';
        }
        $order = strtolower($request->get('order', 'asc')) === 'asc' ? 'asc' : 'desc';

        $perPage = $request->get('per_page', 10);
        $appeals = $query->orderBy($sortBy, $order)->paginate($perPage);
            
        return response()->json([
            'success' => true,
            'data' => AppealResource::collection($appeals->items()),
            'meta' => [
                'current_page' => $appeals->currentPage(),
                'last_page' => $appeals->lastPage(),
                'per_page' => $appeals->perPage(),
                'total' => $appeals->total(),
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreAppealRequest $request): JsonResponse
    {
        // Block viewers from creating cases
        if ($request->user()->role === 'viewer') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Viewers cannot create cases.',
            ], 403);
        }

        $appeal = Appeal::create($request->validated());
       
        // Copy documents from linked primary case to this appeal case
        if ($appeal->assigned_case_registration_request_id) {
            try {
                $this->documentService->copyFromPrimaryToAppeal(
                    $appeal->assigned_case_registration_request_id,
                    $appeal->appeal_request_id
                );
            } catch (\Exception $e) {
                // Log error but don't fail the appeal creation
                Log::error('Failed to copy documents from primary to appeal case', [
                    'primary_case_id' => $appeal->assigned_case_registration_request_id,
                    'appeal_case_id' => $appeal->appeal_request_id,
                    'error' => $e->getMessage()
                ]);
            }
        }

        // Log to archive
        $this->archiveService->logCaseChange(
            'appeal',
            $appeal->appeal_request_id,
            'created',
            null,
            $appeal->toArray()
        );

        return response()->json([
            'success' => true,
            'data' => new AppealResource($appeal),
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        $appeal = Appeal::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => new AppealResource($appeal),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateAppealRequest $request, string $id): JsonResponse
    {
        // Block viewers from updating cases
        if ($request->user()->role === 'viewer') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Viewers cannot update cases.',
            ], 403);
        }

        $appeal = Appeal::findOrFail($id);
        $oldData = $appeal->toArray();
        Log::info($oldData);

        $appeal->update($request->validated());

        // Log to archive
        $this->archiveService->logCaseChange(
            'appeal',
            $appeal->appeal_request_id,
            'updated',
            $oldData,
            $appeal->toArray()
        );

        return response()->json([
            'success' => true,
            'data' => new AppealResource($appeal),
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

        $appeal = Appeal::findOrFail($id);
        $oldData = $appeal->toArray();

        // Log to archive
        $this->archiveService->logCaseChange(
            'appeal',
            $appeal->appeal_request_id,
            'deleted',
            $oldData,
            null
        );

        $appeal->delete();

        return response()->json([
            'success' => true,
            'message' => 'Appeal case deleted successfully',
        ]);
    }
}
