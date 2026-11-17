<?php

namespace App\Http\Requests\Student;

use Illuminate\Foundation\Http\FormRequest;

class SubmissionRequest extends FormRequest
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
            'file' => [
                'nullable',
                'file',
                'max:25600', // 25 MB
                'mimes:pdf,docx,doc,pptx,ppt,xls,xlsx,jpg,jpeg,png,webp,zip,rar',
            ],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'file' => 'berkas jawaban tugas',
            'notes' => 'catatan jawaban',
        ];
    }
}
