<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreStudentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('users.manage') ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'first_name' => [
                'required',
                'string',
                'max:255',
            ],
            'last_name' => [
                'required',
                'string',
                'max:255',
            ],
            'email' => [
                'nullable',
                'email',
                'max:255',
            ],
            'student_code' => [
                'nullable',
                'string',
                'max:50',
                Rule::unique('student_profiles', 'student_code')
                    ->where('school_id', $this->user()?->school_id),
            ],
            'date_of_birth' => [
                'nullable',
                'date',
                'before:today',
            ],
            'grade_level' => [
                'required',
                'string',
                'max:50',
            ],
            'enrollment_status' => [
                'nullable',
                'string',
                Rule::in([
                    'active',
                    'inactive',
                    'transferred',
                    'graduated',
                ]),
            ],
            'notes' => [
                'nullable',
                'string',
                'max:5000',
            ],
        ];
    }
}