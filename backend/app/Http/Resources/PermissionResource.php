<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PermissionResource extends JsonResource
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
            'module' => $this->module,
            'enabled' => $this->enabled,
            'view' => $this->view,
            'add' => $this->add,
            'edit' => $this->edit,
            'delete' => $this->delete,
        ];
    }
}
