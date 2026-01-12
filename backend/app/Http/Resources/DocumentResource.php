<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DocumentResource extends JsonResource
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
            'name' => $this->name,
            'originalFilename' => $this->original_filename,
            'filePath' => $this->file_path,
            'fileUrl' => $this->file_url,
            'fileSize' => $this->file_size,
            'formattedFileSize' => $this->formatted_file_size,
            'mimeType' => $this->mime_type,
            'description' => $this->description,
            'uploadedBy' => [
                'id' => optional($this->uploader)->id,
                'name' => optional($this->uploader)->name,
                'email' => optional($this->uploader)->email,
            ],
            'createdAt' => $this->created_at?->format('Y-m-d H:i:s'),
            'updatedAt' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
