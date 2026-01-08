<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ArchiveResource extends JsonResource
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
            'caseId' => $this->case_id,
            'action' => $this->action,
            'oldData' => $this->old_data,
            'newData' => $this->new_data,
            'user' => $this->whenLoaded('user', function () {
                return [
                    'id' => $this->user->id,
                    'name' => $this->user->name,
                    'email' => $this->user->email,
                ];
            }),
            'createdAt' => $this->created_at?->format('Y-m-d H:i:s'),
        ];
    }
}
