<?php

namespace App\Http\Requests\Teacher;

use Illuminate\Foundation\Http\FormRequest;

class GradeAssignmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->user()->isTeacher();
    }

    public function rules(): array
    {
        return [
            'score' => ['required', 'numeric', 'min:0', 'max:100'],
            'feedback' => ['nullable', 'string', 'max:2000'],
        ];
    }

    public function messages(): array
    {
        return [
            'score.required' => 'Nilai wajib diisi.',
            'score.numeric' => 'Nilai harus berupa angka.',
            'score.min' => 'Nilai minimal adalah 0.',
            'score.max' => 'Nilai maksimal adalah 100.',
        ];
    }
}
