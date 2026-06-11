<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreStudentGuardianRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('guardians.manage') ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'relationship' => ['required', 'string', 'max:100'],
            'is_primary' => ['sometimes', 'boolean'],
            'emergency_contact_priority' => ['nullable', 'integer', 'min:1', 'max:10'],
            'phone' => ['nullable', 'string', 'max:50'],
        ];
    }
}