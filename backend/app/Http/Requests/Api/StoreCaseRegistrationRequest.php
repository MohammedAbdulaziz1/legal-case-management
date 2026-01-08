<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class StoreCaseRegistrationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'first_instance_judgment' => ['required', 'string', 'max:255'],
            'case_date' => ['required', 'date'],
            'case_number' => ['required', 'integer'],
            'session_date' => ['required', 'date'],
            'court_number' => ['required', 'integer'],
            'title' => ['nullable', 'string', 'max:255'],
            'client' => ['nullable', 'string', 'max:255'],
            'opponent' => ['nullable', 'string', 'max:255'],
            'judge' => ['nullable', 'string', 'max:255'],
            'next_session_date' => ['nullable', 'date'],
            'status' => ['nullable', 'string', 'in:active,pending,judgment,closed,postponed'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
