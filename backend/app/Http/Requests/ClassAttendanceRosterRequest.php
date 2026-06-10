<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ClassAttendanceRosterRequest extends FormRequest
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
            'date' => ['required', 'date_format:Y-m-d'],
        ];
    }
}
