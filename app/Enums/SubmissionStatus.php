<?php

namespace App\Enums;

enum SubmissionStatus: string
{
    case NotSubmitted = 'not_submitted';
    case Submitted = 'submitted';
    case Late = 'late';
    case Graded = 'graded';

    public function label(): string
    {
        return match ($this) {
            self::NotSubmitted => 'Belum dikerjakan',
            self::Submitted => 'Sudah dikumpulkan',
            self::Late => 'Terlambat',
            self::Graded => 'Sudah dinilai',
        };
    }
}
