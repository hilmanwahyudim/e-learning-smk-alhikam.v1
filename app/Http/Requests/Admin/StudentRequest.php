<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StudentRequest extends FormRequest
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
        $student = $this->route('student');
        $userId = $student?->user_id;
        $studentId = $student?->id;

        return [
            'name' => ['required', 'string', 'max:255'],
            'username' => [
                'required',
                'string',
                'max:50',
                'alpha_dash',
                Rule::unique('users', 'username')->ignore($userId),
            ],
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($userId),
            ],
            'password' => [$this->isMethod('POST') ? 'required' : 'nullable', 'string', 'min:6'],
            'is_active' => ['nullable', 'boolean'],
            'nis' => [
                'required',
                'string',
                'max:30',
                Rule::unique('students', 'nis')->ignore($studentId),
            ],
            'nisn' => [
                'nullable',
                'string',
                'max:30',
                Rule::unique('students', 'nisn')->ignore($studentId),
            ],
            'gender' => ['nullable', 'in:L,P'],
            'birth_place' => ['nullable', 'string', 'max:100'],
            'birth_date' => ['nullable', 'date'],
            'phone' => ['nullable', 'string', 'max:30'],
            'address' => ['nullable', 'string', 'max:500'],
            'guardian_name' => ['nullable', 'string', 'max:100'],
            'guardian_phone' => ['nullable', 'string', 'max:30'],
            'class_id' => ['nullable', 'exists:classes,id'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'name' => 'nama lengkap siswa',
            'username' => 'username',
            'email' => 'email',
            'password' => 'kata sandi',
            'nis' => 'NIS',
            'nisn' => 'NISN',
            'gender' => 'jenis kelamin',
            'birth_place' => 'tempat lahir',
            'birth_date' => 'tanggal lahir',
            'phone' => 'nomor telepon siswa',
            'address' => 'alamat tinggal',
            'guardian_name' => 'nama orang tua/wali',
            'guardian_phone' => 'telepon orang tua/wali',
            'class_id' => 'kelas',
        ];
    }
}
