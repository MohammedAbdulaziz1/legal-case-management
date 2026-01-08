<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreAppealRequest;
use App\Http\Requests\Api\UpdateAppealRequest;
use App\Http\Resources\AppealResource;
use App\Models\Appeal;
use App\Services\ArchiveService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AppealController extends Controller
{
    protected ArchiveService $archiveService;

    public function __construct(ArchiveService $archiveService)
    {
        $this->archiveService = $archiveService;
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

        $perPage = $request->get('per_page', 10);
        $appeals = $query->orderBy('created_at', 'desc')->paginate($perPage);

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
        $appeal = Appeal::create($request->validated());

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
        $appeal = Appeal::findOrFail($id);
        $oldData = $appeal->toArray();

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
    public function destroy(string $id): JsonResponse
    {
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
