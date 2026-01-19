<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CaseSessionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'caseType' => $this->case_type,
            'caseNumber' => $this->case_number,
            'caseId' => $this->resource->getCaseId(),
            'sessionDate' => $this->session_date?->format('Y-m-d'),
            'sessionTime' => $this->session_time ? substr((string) $this->session_time, 0, 5) : null,
            'notes' => $this->notes,
            'createdAt' => $this->created_at?->format('Y-m-d H:i:s'),
            'updatedAt' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
