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
            'status' => $this->status,
            'notes' => $this->notes,
            'appealId' => $this->appeal_request_id,
            'createdAt' => $this->created_at?->format('Y-m-d H:i:s'),
            'updatedAt' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
