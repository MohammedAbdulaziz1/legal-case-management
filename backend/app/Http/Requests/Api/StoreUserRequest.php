<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'role' => ['required', 'string', 'in:admin,user,viewer'],
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Set default role to 'user' if not provided or empty
        $role = $this->input('role');
        if (!$this->has('role') || $role === null || $role === '' || trim($role) === '') {
            $this->merge(['role' => 'user']);
        } else {
            // Ensure role is trimmed
            $this->merge(['role' => trim($role)]);
        }
    }
}
