<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateClassRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->school_id !== null;
    }

    /**
     * @return array<string, list<string>>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'grade_level' => ['required', 'string', 'max:40'],
            'section' => ['nullable', 'string', 'max:40'],
            'academic_year' => ['required', 'string', 'max:20'],
            'is_active' => ['required', 'boolean'],
        ];
    }
}
