<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class StoreAppealRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'appeal_number' => ['required', 'integer'],
            'appeal_date' => ['required', 'date'],
            'judgementdate' => ['required', 'date'],
            'judgementrecivedate' => ['required', 'date'],
            'appeal_court_number' => ['required', 'integer'],
            'appeal_judgment' => ['required', 'string', 'max:255'],
            'appealed_by' => ['required', 'string', 'max:255'],
            'assigned_case_registration_request_id' => ['required', 'exists:case_registration,assigned_case_registration_request_id'],
            'status' => ['nullable', 'string', 'in:active,pending,judgment,closed,postponed'],
            'priority' => ['nullable', 'string', 'in:normal,urgent'],
            'notes' => ['nullable', 'string'],
            'plaintiff' => ['nullable', 'string', 'max:255'],
            'plaintiff_lawyer' => ['nullable', 'string', 'max:255'],
            'defendant' => ['nullable', 'string', 'max:255'],
            'defendant_lawyer' => ['nullable', 'string', 'max:255'],
            'subject' => ['nullable', 'string', 'max:255'],
            'judge' => ['nullable', 'string', 'max:255'],
        ];
    }
}
