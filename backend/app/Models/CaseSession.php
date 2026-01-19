<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CaseSession extends Model
{
    protected $table = 'case_sessions';

    protected $fillable = [
        'case_type',
        'case_number',
        'session_date',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'session_date' => 'date',
        ];
    }

    /**
     * Resolve case ID for linking: primary -> case_registration, appeal -> appeal, supreme -> supreme_court.
     */
    public function getCaseId(): ?int
    {
        $n = $this->case_number;
        if ($n === null) {
            return null;
        }
        return match ($this->case_type) {
            'primary' => \App\Models\CaseRegistration::where('case_number', $n)->value('assigned_case_registration_request_id'),
            'appeal' => \App\Models\Appeal::where('appeal_number', $n)->value('appeal_request_id'),
            'supreme' => \App\Models\SupremeCourt::where('supreme_case_number', $n)->value('supreme_request_id'),
            default => null,
        };
    }
}
