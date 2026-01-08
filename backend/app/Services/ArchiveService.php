<?php

namespace App\Services;

use App\Models\ArchiveLog;
use Illuminate\Support\Facades\Auth;

class ArchiveService
{
    /**
     * Log a case modification
     */
    public function logCaseChange(string $caseType, int $caseId, string $action, ?array $oldData = null, ?array $newData = null): ArchiveLog
    {
        return ArchiveLog::create([
            'case_type' => $caseType,
            'case_id' => $caseId,
            'action' => $action,
            'old_data' => $oldData,
            'new_data' => $newData,
            'user_id' => Auth::id(),
        ]);
    }

    /**
     * Get case history
     */
    public function getCaseHistory(string $caseType, int $caseId)
    {
        return ArchiveLog::where('case_type', $caseType)
            ->where('case_id', $caseId)
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->get();
    }
}

