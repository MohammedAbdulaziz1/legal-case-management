<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreDocumentRequest;
use App\Http\Requests\Api\UpdateDocumentRequest;
use App\Http\Resources\DocumentResource;
use App\Models\Document;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class DocumentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Document::with('uploader');

        // Filter by related case (polymorphic relationship)
        if ($request->has('documentable_type') && $request->has('documentable_id')) {
            $query->where('documentable_type', $request->documentable_type)
                  ->where('documentable_id', $request->documentable_id);
        } elseif ($request->has('general_only') && $request->general_only) {
            // Only show general documents (not attached to any case)
            $query->whereNull('documentable_type')
                  ->whereNull('documentable_id');
        }

        // Search by name or description
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('original_filename', 'like', "%{$search}%");
            });
        }

        // Filter by MIME type
        if ($request->has('mime_type')) {
            $query->where('mime_type', 'like', "%{$request->mime_type}%");
        }

        // Sorting
        $allowedSorts = ['name', 'file_size', 'created_at', 'mime_type'];
        $sortBy = $request->get('sort_by', 'created_at');
        if (!in_array($sortBy, $allowedSorts)) {
            $sortBy = 'created_at';
        }
        $order = strtolower($request->get('order', 'desc')) === 'asc' ? 'asc' : 'desc';

        $perPage = $request->get('per_page', 10);
        $documents = $query->orderBy($sortBy, $order)->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => DocumentResource::collection($documents->items()),
            'meta' => [
                'current_page' => $documents->currentPage(),
                'last_page' => $documents->lastPage(),
                'per_page' => $documents->perPage(),
                'total' => $documents->total(),
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreDocumentRequest $request): JsonResponse
    {
        // Block viewers from uploading documents
        if ($request->user()->role === 'viewer') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Viewers cannot upload documents.',
            ], 403);
        }

        $file = $request->file('file');
        $originalFilename = $file->getClientOriginalName();
        $mimeType = $file->getMimeType();
        $fileSize = $file->getSize();

        // Generate a safe filename
        $extension = $file->getClientOriginalExtension();
        $filename = Str::slug(pathinfo($originalFilename, PATHINFO_FILENAME)) . '-' . time() . '.' . $extension;

        // Store file in organized directory structure: documents/YYYY/MM/filename
        $year = date('Y');
        $month = date('m');
        $directory = "documents/{$year}/{$month}";
        $filePath = $file->storeAs($directory, $filename, 'public');

        // Create document record
        $documentData = [
            'name' => $request->name,
            'original_filename' => $originalFilename,
            'file_path' => $filePath,
            'file_size' => $fileSize,
            'mime_type' => $mimeType,
            'description' => $request->description,
            'uploaded_by' => $request->user()->id,
        ];

        // Add polymorphic relationship if provided
        if ($request->has('documentable_type') && $request->has('documentable_id')) {
            $documentData['documentable_type'] = $request->documentable_type;
            $documentData['documentable_id'] = $request->documentable_id;
        }

        $document = Document::create($documentData);

        return response()->json([
            'success' => true,
            'data' => new DocumentResource($document->load('uploader')),
            'message' => 'Document uploaded successfully',
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        $document = Document::with('uploader')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => new DocumentResource($document),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateDocumentRequest $request, string $id): JsonResponse
    {
        // Block viewers from updating documents
        if ($request->user()->role === 'viewer') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Viewers cannot update documents.',
            ], 403);
        }

        $document = Document::findOrFail($id);

        $document->update($request->validated());

        return response()->json([
            'success' => true,
            'data' => new DocumentResource($document->load('uploader')),
            'message' => 'Document updated successfully',
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        // Block viewers from deleting documents
        if ($request->user()->role === 'viewer') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Viewers cannot delete documents.',
            ], 403);
        }

        $document = Document::findOrFail($id);

        // Delete the file from storage
        if (Storage::disk('public')->exists($document->file_path)) {
            Storage::disk('public')->delete($document->file_path);
        }

        $document->delete();

        return response()->json([
            'success' => true,
            'message' => 'Document deleted successfully',
        ]);
    }

    /**
     * Download the specified document.
     */
    public function download(string $id)
    {
        $document = Document::findOrFail($id);

        if (!Storage::disk('public')->exists($document->file_path)) {
            return response()->json([
                'success' => false,
                'message' => 'File not found at path: ' . $document->file_path,
            ], 404);
        }

        return Storage::disk('public')->download(
            $document->file_path,
            $document->original_filename,
            [
                'Content-Type' => $document->mime_type,
            ]
        );
    }
}
