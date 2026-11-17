<?php

namespace App\Enums;

enum QuestionType: string
{
    case MultipleChoice = 'multiple_choice';
    case TrueFalse = 'true_false';
    case ShortAnswer = 'short_answer';
    case Essay = 'essay';

    public function label(): string
    {
        return match ($this) {
            self::MultipleChoice => 'Pilihan ganda',
            self::TrueFalse => 'Benar atau salah',
            self::ShortAnswer => 'Isian singkat',
            self::Essay => 'Essay',
        };
    }

    /** Apakah bisa dinilai otomatis oleh sistem. */
    public function isAutoGraded(): bool
    {
        return $this !== self::Essay;
    }
}
