<?php

namespace App\Services;

use App\Models\Document;
use App\Models\CaseRegistration;
use App\Models\Appeal;
use App\Models\SupremeCourt;

class DocumentService
{
    /**
     * Copy documents from one case to another.
     * Used when escalating from Primary -> Appeal -> Supreme Court.
     *
     * @param string $sourceType Model class name (e.g., 'App\Models\CaseRegistration')
     * @param int $sourceId The source case ID
     * @param string $targetType Model class name (e.g., 'App\Models\Appeal')
     * @param int $targetId The target case ID
     * @return int Number of documents copied
     */
    public function copyDocumentsBetweenCases(
        string $sourceType,
        int $sourceId,
        string $targetType,
        int $targetId
    ): int {
        // Get all documents from the source case
        $sourceDocuments = Document::where('documentable_type', $sourceType)
            ->where('documentable_id', $sourceId)
            ->get();

        $copiedCount = 0;

        foreach ($sourceDocuments as $sourceDoc) {
            // Create a duplicate document entry for the target case
            Document::create([
                'name' => $sourceDoc->name,
                'original_filename' => $sourceDoc->original_filename,
                'file_path' => $sourceDoc->file_path, // Reuse the same file (no need to duplicate the actual file)
                'file_size' => $sourceDoc->file_size,
                'mime_type' => $sourceDoc->mime_type,
                'description' => $sourceDoc->description,
                'uploaded_by' => $sourceDoc->uploaded_by,
                'documentable_type' => $targetType,
                'documentable_id' => $targetId,
            ]);

            $copiedCount++;
        }

        return $copiedCount;
    }

    /**
     * Copy documents from Primary case to Appeal case.
     *
     * @param int $primaryCaseId
     * @param int $appealCaseId
     * @return int Number of documents copied
     */
    public function copyFromPrimaryToAppeal(int $primaryCaseId, int $appealCaseId): int
    {
        return $this->copyDocumentsBetweenCases(
            'App\Models\CaseRegistration',
            $primaryCaseId,
            'App\Models\Appeal',
            $appealCaseId
        );
    }

    /**
     * Copy documents from Appeal case to Supreme Court case.
     *
     * @param int $appealCaseId
     * @param int $supremeCourtCaseId
     * @return int Number of documents copied
     */
    public function copyFromAppealToSupreme(int $appealCaseId, int $supremeCourtCaseId): int
    {
        return $this->copyDocumentsBetweenCases(
            'App\Models\Appeal',
            $appealCaseId,
            'App\Models\SupremeCourt',
            $supremeCourtCaseId
        );
    }
}
