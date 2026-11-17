<?php

namespace App\Http\Requests\Teacher;

use Illuminate\Foundation\Http\FormRequest;

class AssignmentRequest extends FormRequest
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
        return [
            'teacher_subject_id' => ['required', 'exists:teacher_subjects,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'start_at' => ['nullable', 'date'],
            'deadline_at' => ['required', 'date'],
            'max_score' => ['required', 'integer', 'min:10', 'max:100'],
            'allow_late' => ['nullable', 'boolean'],
            'files' => ['nullable', 'array'],
            'files.*' => [
                'nullable',
                'file',
                'max:25600',
                'mimes:pdf,docx,doc,pptx,ppt,xls,xlsx,jpg,jpeg,png,zip,rar',
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'teacher_subject_id' => 'kelas dan mata pelajaran',
            'title' => 'judul tugas',
            'description' => 'instruksi tugas',
            'start_at' => 'waktu mulai tugas',
            'deadline_at' => 'tenggat waktu (deadline)',
            'max_score' => 'nilai maksimal',
            'allow_late' => 'ijinkan pengumpulan terlambat',
            'files' => 'berkas panduan tugas',
        ];
    }
}
