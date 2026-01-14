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
            'appealed_by' => ['required', 'string', 'max:255'],
            'supremeCourtJudgment' => ['nullable', 'string', 'max:255'],
            'judgementdate' => ['required', 'date'],
            'judgementrecivedate' => ['required', 'date'],
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
