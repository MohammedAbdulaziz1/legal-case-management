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
            'sessionDate' => ['sometimes', 'date'],
            'supremeCourtJudgment' => ['nullable', 'string', 'max:255'],
            'judgementdate' => ['sometimes', 'date'],
            'judgementrecivedate' => ['sometimes', 'date'],
            'status' => ['nullable', 'string', 'in:active,pending,judgment,closed,postponed'],
            'priority' => ['nullable', 'string', 'in:normal,urgent'],
            'notes' => ['nullable', 'string'],
            'court' => ['nullable', 'string', 'max:255'],
            'judge' => ['nullable', 'string', 'max:255'],
            'plaintiff' => ['nullable', 'string', 'max:255'],
            'plaintiff_lawyer' => ['nullable', 'string', 'max:255'],
            'defendant' => ['nullable', 'string', 'max:255'],
            'defendant_lawyer' => ['nullable', 'string', 'max:255'],
            'subject' => ['nullable', 'string', 'max:255'],
        ];
    }
}
