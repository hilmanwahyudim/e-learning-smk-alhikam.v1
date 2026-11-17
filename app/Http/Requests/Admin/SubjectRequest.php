<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SubjectRequest extends FormRequest
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
        $subjectId = $this->route('subject')?->id;

        return [
            'code' => [
                'required',
                'string',
                'max:20',
                Rule::unique('subjects', 'code')->ignore($subjectId),
            ],
            'name' => ['required', 'string', 'max:100'],
            'department_id' => ['nullable', 'exists:departments,id'],
            'description' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'code' => 'kode mata pelajaran',
            'name' => 'nama mata pelajaran',
            'department_id' => 'jurusan',
            'description' => 'deskripsi',
        ];
    }
}
