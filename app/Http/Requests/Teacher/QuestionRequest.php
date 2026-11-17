<?php

namespace App\Http\Requests\Teacher;

use App\Enums\QuestionType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class QuestionRequest extends FormRequest
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
            'subject_id' => ['required', 'exists:subjects,id'],
            'type' => ['required', Rule::enum(QuestionType::class)],
            'body' => ['required', 'string'],
            'default_points' => ['required', 'numeric', 'min:1', 'max:100'],
            'explanation' => ['nullable', 'string'],
            'answer_key' => ['nullable', 'string', 'max:255'],
            'options' => ['nullable', 'array'],
            'options.*.body' => ['nullable', 'string'],
            'options.*.is_correct' => ['nullable', 'boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'subject_id' => 'mata pelajaran',
            'type' => 'tipe pertanyaan',
            'body' => 'isi pertanyaan / soal',
            'default_points' => 'bobot poin default',
            'explanation' => 'pembahasan',
            'answer_key' => 'kunci jawaban isian singkat',
            'options' => 'opsi pilihan jawaban',
        ];
    }
}
