<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAppealRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'appeal_number' => ['sometimes', 'integer'],
            'appeal_date' => ['sometimes', 'date'],
            'appeal_court_number' => ['sometimes', 'integer'],
            'appeal_judgment' => ['sometimes', 'string', 'max:255'],
            'appealed_by' => ['sometimes', 'string', 'max:255'],
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
