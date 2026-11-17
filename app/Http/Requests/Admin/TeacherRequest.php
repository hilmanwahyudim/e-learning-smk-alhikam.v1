<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TeacherRequest extends FormRequest
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
        $teacher = $this->route('teacher');
        $userId = $teacher?->user_id;
        $teacherId = $teacher?->id;

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
            'nip' => [
                'nullable',
                'string',
                'max:30',
                Rule::unique('teachers', 'nip')->ignore($teacherId),
            ],
            'gender' => ['nullable', 'in:L,P'],
            'phone' => ['nullable', 'string', 'max:30'],
            'address' => ['nullable', 'string', 'max:500'],
            'specialization' => ['nullable', 'string', 'max:100'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'name' => 'nama lengkap',
            'username' => 'nama pengguna (username)',
            'email' => 'alamat email',
            'password' => 'kata sandi',
            'is_active' => 'status akun',
            'nip' => 'NIP',
            'gender' => 'jenis kelamin',
            'phone' => 'nomor telepon',
            'address' => 'alamat',
            'specialization' => 'bidang keahlian / mapel',
        ];
    }
}
