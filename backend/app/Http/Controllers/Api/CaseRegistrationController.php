<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreCaseRegistrationRequest;
use App\Http\Requests\Api\UpdateCaseRegistrationRequest;
use App\Http\Resources\CaseResource;
use App\Models\CaseRegistration;
use App\Services\ArchiveService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CaseRegistrationController extends Controller
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
        $query = CaseRegistration::query();

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('case_number', 'like', "%{$search}%")
                  ->orWhere('title', 'like', "%{$search}%")
                  ->orWhere('client', 'like', "%{$search}%")
                  ->orWhere('opponent', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $perPage = $request->get('per_page', 10);
        $cases = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => CaseResource::collection($cases->items()),
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
    public function store(StoreCaseRegistrationRequest $request): JsonResponse
    {
        $case = CaseRegistration::create($request->validated());

        // Log to archive
        $this->archiveService->logCaseChange(
            'primary',
            $case->assigned_case_registration_request_id,
            'created',
            null,
            $case->toArray()
        );

        return response()->json([
            'success' => true,
            'data' => new CaseResource($case),
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        $case = CaseRegistration::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => new CaseResource($case),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCaseRegistrationRequest $request, string $id): JsonResponse
    {
        $case = CaseRegistration::findOrFail($id);
        $oldData = $case->toArray();

        $case->update($request->validated());

        // Log to archive
        $this->archiveService->logCaseChange(
            'primary',
            $case->assigned_case_registration_request_id,
            'updated',
            $oldData,
            $case->toArray()
        );

        return response()->json([
            'success' => true,
            'data' => new CaseResource($case),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $case = CaseRegistration::findOrFail($id);
        $oldData = $case->toArray();

        // Log to archive
        $this->archiveService->logCaseChange(
            'primary',
            $case->assigned_case_registration_request_id,
            'deleted',
            $oldData,
            null
        );

        $case->delete();

        return response()->json([
            'success' => true,
            'message' => 'Case deleted successfully',
        ]);
    }
}
