<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CaseResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->assigned_case_registration_request_id,
            'caseNumber' => $this->case_number,
            'registrationDate' => $this->case_date?->format('Y-m-d'),
            'title' => $this->title,
            'client' => $this->client,
            'opponent' => $this->opponent,
            'court' => "المحكمة الابتدائية - الدائرة {$this->court_number}",
            'judge' => $this->judge,
            'firstInstanceJudgment' => $this->first_instance_judgment,
            'judgementdate' => $this->judgementdate?->format('Y-m-d'),
            'judgementrecivedate' => $this->judgementrecivedate?->format('Y-m-d'),
            'status' => $this->status,
            'notes' => $this->notes,
            'createdAt' => $this->created_at?->format('Y-m-d H:i:s'),
            'updatedAt' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
