<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ClassroomRequest extends FormRequest
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
        $classId = $this->route('class')?->id;
        $academicYearId = $this->input('academic_year_id');

        return [
            'department_id' => ['required', 'exists:departments,id'],
            'academic_year_id' => ['required', 'exists:academic_years,id'],
            'homeroom_teacher_id' => ['nullable', 'exists:teachers,id'],
            'name' => [
                'required',
                'string',
                'max:50',
                Rule::unique('classes', 'name')
                    ->where('academic_year_id', $academicYearId)
                    ->ignore($classId),
            ],
            'grade_level' => ['required', 'in:X,XI,XII'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'department_id' => 'jurusan',
            'academic_year_id' => 'tahun ajaran',
            'homeroom_teacher_id' => 'wali kelas',
            'name' => 'nama kelas',
            'grade_level' => 'tingkat kelas',
        ];
    }
}
