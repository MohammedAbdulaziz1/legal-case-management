<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreSupremeCourtRequest;
use App\Http\Requests\Api\UpdateSupremeCourtRequest;
use App\Http\Resources\SupremeCourtResource;
use App\Models\SupremeCourt;
use App\Services\ArchiveService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SupremeCourtController extends Controller
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

        $perPage = $request->get('per_page', 10);
        $cases = $query->orderBy('created_at', 'desc')->paginate($perPage);

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
        $case = SupremeCourt::create($request->validated());

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
    public function destroy(string $id): JsonResponse
    {
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
