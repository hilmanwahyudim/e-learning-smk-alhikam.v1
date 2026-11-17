<?php

namespace App\Http\Requests\Teacher;

use Illuminate\Foundation\Http\FormRequest;

class GradeEssayRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->user()->isTeacher();
    }

    public function rules(): array
    {
        return [
            'answers' => ['required', 'array'],
            'answers.*.question_id' => ['required', 'exists:questions,id'],
            'answers.*.score' => ['required', 'numeric', 'min:0'],
            'answers.*.feedback' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
