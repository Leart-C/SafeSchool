<?php

namespace App\Http\Requests;

use App\Enums\MessageAudience;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->school_id !== null;
    }

    public function rules(): array
    {
        return [
            'audience' => [
                'required',
                'string',
                Rule::in(MessageAudience::values()),
            ],
            'school_class_id' => [
                'nullable',
                'integer',
                'exists:school_classes,id',
                'required_if:audience,class',
            ],
            'title' => [
                'required',
                'string',
                'max:255',
            ],
            'body' => [
                'required',
                'string',
                'max:10000',
            ],
            'publish_now' => [
                'sometimes',
                'boolean',
            ],
        ];
    }
}
