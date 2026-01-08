<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSupremeCourtRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'supreme_date' => ['sometimes', 'date'],
            'supreme_case_number' => ['sometimes', 'integer'],
            'status' => ['nullable', 'string', 'in:active,pending,judgment,closed,postponed'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
