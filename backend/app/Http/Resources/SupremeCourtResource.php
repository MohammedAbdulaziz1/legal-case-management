<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SupremeCourtResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->supreme_request_id,
            'caseNumber' => $this->supreme_case_number,
            'date' => $this->supreme_date?->format('Y-m-d'),
            'sessionDate' => $this->sessionDate?->format('Y-m-d'),
            'supremeCourtJudgment' => $this->supremeCourtJudgment,
            'judgementdate' => $this->judgementdate?->format('Y-m-d'),
            'judgementrecivedate' => $this->judgementrecivedate?->format('Y-m-d'),
            'status' => $this->status,
            'priority' => $this->priority,
            'notes' => $this->notes,
            'court' => $this->court,
            'judge' => $this->judge,
            'plaintiff' => $this->plaintiff,
            'plaintiffLawyer' => $this->plaintiff_lawyer,
            'defendant' => $this->defendant,
            'defendantLawyer' => $this->defendant_lawyer,
            'subject' => $this->subject,
            'appealId' => $this->appeal_request_id,
            'createdAt' => $this->created_at?->format('Y-m-d H:i:s'),
            'updatedAt' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
