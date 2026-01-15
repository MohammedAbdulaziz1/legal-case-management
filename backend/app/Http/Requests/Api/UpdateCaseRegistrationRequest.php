<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCaseRegistrationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'first_instance_judgment' => ['sometimes', 'string', 'max:255'],
            'case_date' => ['sometimes', 'date'],
            'case_number' => ['sometimes', 'integer'],
            'court_number' => ['sometimes', 'integer'],
            'title' => ['nullable', 'string', 'max:255'],
            'client' => ['nullable', 'string', 'max:255'],
            'opponent' => ['nullable', 'string', 'max:255'],
            'judge' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'string', 'in:active,pending,judgment,closed,postponed'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
