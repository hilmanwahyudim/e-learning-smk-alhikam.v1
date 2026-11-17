<?php

namespace App\Http\Requests\Teacher;

use Illuminate\Foundation\Http\FormRequest;

class MaterialRequest extends FormRequest
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
            'description' => ['nullable', 'string', 'max:1000'],
            'content' => ['nullable', 'string'],
            'video_url' => ['nullable', 'url', 'max:500'],
            'files' => ['nullable', 'array'],
            'files.*' => [
                'nullable',
                'file',
                'max:25600', // 25 MB
                'mimes:pdf,docx,doc,pptx,ppt,xls,xlsx,jpg,jpeg,png,webp,zip,rar,mp4',
            ],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_published' => ['nullable', 'boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'teacher_subject_id' => 'kelas dan mata pelajaran',
            'title' => 'judul materi',
            'description' => 'ringkasan materi',
            'content' => 'isi materi',
            'video_url' => 'tautan video pembelajaran',
            'files' => 'berkas lampiran',
            'files.*' => 'berkas lampiran',
            'sort_order' => 'urutan pertemuan',
            'is_published' => 'status publikasi',
        ];
    }
}
