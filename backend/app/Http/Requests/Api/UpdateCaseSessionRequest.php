<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCaseSessionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'session_date' => ['sometimes', 'date'],
            'session_time' => ['nullable', 'date_format:H:i'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
