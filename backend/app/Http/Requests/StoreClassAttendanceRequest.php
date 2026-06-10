<?php

namespace App\Http\Requests;

use App\Enums\AttendanceStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreClassAttendanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->school_id !== null;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'attendance_date' => ['required', 'date_format:Y-m-d'],
            'records' => ['required', 'array', 'min:1'],
            'records.*.student_user_id' => ['required', 'integer', 'exists:users,id'],
            'records.*.status' => [
                'required',
                'string',
                Rule::in(array_column(AttendanceStatus::cases(), 'value')),
            ],
            'records.*.note' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
