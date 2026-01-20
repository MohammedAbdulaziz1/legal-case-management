<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class StoreCaseSessionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'case_type' => ['required', 'string', 'in:primary,appeal,supreme'],
            'case_number' => ['required', 'integer'],
            'session_date' => ['required', 'date'],
            'session_time' => ['nullable', 'date_format:H:i'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
