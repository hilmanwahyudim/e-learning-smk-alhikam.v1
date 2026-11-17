<?php

namespace App\Http\Requests\Teacher;

use Illuminate\Foundation\Http\FormRequest;

class QuizRequest extends FormRequest
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
            'type' => ['required', 'in:quiz,exam'],
            'instructions' => ['nullable', 'string'],
            'start_at' => ['nullable', 'date'],
            'end_at' => ['nullable', 'date'],
            'duration_minutes' => ['required', 'integer', 'min:5', 'max:300'],
            'shuffle_questions' => ['nullable', 'boolean'],
            'shuffle_options' => ['nullable', 'boolean'],
            'max_attempts' => ['required', 'integer', 'min:1', 'max:10'],
            'show_result' => ['nullable', 'boolean'],
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
            'title' => 'judul kuis/ujian',
            'type' => 'jenis tes',
            'instructions' => 'petunjuk pengerjaan',
            'start_at' => 'waktu mulai akses',
            'end_at' => 'batas akhir akses',
            'duration_minutes' => 'durasi pengerjaan (menit)',
            'shuffle_questions' => 'acak urutan soal',
            'shuffle_options' => 'acak pilihan jawaban',
            'max_attempts' => 'maksimal kesempatan mencoba',
            'show_result' => 'tampilkan hasil ke siswa',
            'is_published' => 'publikasikan ke siswa',
        ];
    }
}
