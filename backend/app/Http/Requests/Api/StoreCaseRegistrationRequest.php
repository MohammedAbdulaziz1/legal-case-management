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
            'title' => ['nullable', 'string', 'max:255'],
            'case_number' => ['required', 'integer'],
            'case_date' => ['required', 'date'],
            'plaintiff' => ['nullable', 'date'],
            'plaintiffLawyer' => ['nullable', 'date'],
            'defendant' => ['nullable', 'date'],
            'defendantLawyer' => ['nullable', 'date'],
            'client' => ['nullable', 'string', 'max:255'],
            'opponent' => ['nullable', 'string', 'max:255'],
            'court' => ['nullable', 'integer'],
            'judge' => ['nullable', 'string', 'max:255'],
            'first_instance_judgment' => ['required', 'string', 'max:255'],
            'judgementdate' => ['nullable', 'date'],
            'judgementrecivedate' => ['nullable', 'date'],
            'status' => ['nullable', 'string', 'in:active,pending,judgment,closed,postponed'],
            'notes' => ['nullable', 'string'],
            'priority' => ['nullable', 'string'],
            'court_number' => ['nullable', 'integer'],

        ];
    }
}
