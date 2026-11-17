<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TeacherSubjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $id = $this->route('teacher_subject')?->id;
        $classId = $this->input('class_id');
        $semesterId = $this->input('semester_id');

        return [
            'teacher_id' => ['required', 'exists:teachers,id'],
            'class_id' => ['required', 'exists:classes,id'],
            'semester_id' => ['required', 'exists:semesters,id'],
            'subject_id' => [
                'required',
                'exists:subjects,id',
                Rule::unique('teacher_subjects', 'subject_id')
                    ->where('class_id', $classId)
                    ->where('semester_id', $semesterId)
                    ->ignore($id),
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'teacher_id' => 'guru pengampu',
            'subject_id' => 'mata pelajaran',
            'class_id' => 'kelas',
            'semester_id' => 'semester',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'subject_id.unique' => 'Mata pelajaran ini sudah memiliki guru pengampu pada kelas dan semester yang dipilih.',
        ];
    }
}
