<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreClassMemberRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('class_memberships.manage') ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'user_id' => [
                'required',
                'integer',
                'exists:users,id',
            ],
            'role' => [
                'required',
                'string',
                Rule::in([
                    'teacher',
                    'student',
                    'assistant',
                ]),
            ],
        ];
    }
}