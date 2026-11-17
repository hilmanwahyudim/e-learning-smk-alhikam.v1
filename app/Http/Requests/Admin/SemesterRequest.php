<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SemesterRequest extends FormRequest
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
        $yearId = $this->route('academic_year')?->id ?? $this->route('semester')?->academic_year_id;
        $semesterId = $this->route('semester')?->id;

        return [
            'name' => [
                'required',
                'string',
                'max:20',
                Rule::unique('semesters', 'name')
                    ->where('academic_year_id', $yearId)
                    ->ignore($semesterId),
            ],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after:start_date'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'name' => 'nama semester',
            'start_date' => 'tanggal mulai',
            'end_date' => 'tanggal selesai',
            'is_active' => 'status aktif',
        ];
    }
}
