<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AppealResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->appeal_request_id,
            'caseNumber' => $this->appeal_number,
            'registrationDate' => $this->appeal_date?->format('Y-m-d'),
            'court' => "محكمة الاستئناف - الدائرة {$this->appeal_court_number}",
            'judge' => $this->judge,
            'judgementdate' => $this->judgementdate,
            'judgementrecivedate' => $this->judgementrecivedate, 
            'sessionDate' => $this->sessionDate,
            'plaintiff' => $this->plaintiff,
            'plaintiffLawyer' => $this->plaintiff_lawyer,
            'defendant' => $this->defendant,
            'defendantLawyer' => $this->defendant_lawyer,
            'subject' => $this->subject,
            'appealJudgment' => $this->appeal_judgment,
            'appealedBy' => $this->appealed_by,
            'status' => $this->status,
            'priority' => $this->priority,
            'notes' => $this->notes,
            'caseRegistrationId' => $this->assigned_case_registration_request_id,
            'createdAt' => $this->created_at?->format('Y-m-d H:i:s'),
            'updatedAt' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
