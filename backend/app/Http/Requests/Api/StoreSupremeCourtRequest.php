<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class StoreSupremeCourtRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'supreme_date' => ['required', 'date'],
            'supreme_case_number' => ['required', 'integer'],
            'appeal_request_id' => ['required', 'exists:appeal,appeal_request_id'],
            'status' => ['nullable', 'string', 'in:active,pending,judgment,closed,postponed'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
