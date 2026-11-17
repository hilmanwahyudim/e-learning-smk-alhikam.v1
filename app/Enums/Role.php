<?php

namespace App\Enums;

enum Role: string
{
    case Admin = 'admin';
    case Teacher = 'teacher';
    case Student = 'student';

    public function label(): string
    {
        return match ($this) {
            self::Admin => 'Administrator',
            self::Teacher => 'Guru',
            self::Student => 'Siswa',
        };
    }

    /** Nama route dashboard milik role ini (lihat routes/admin.php, teacher.php, student.php). */
    public function dashboardRoute(): string
    {
        return $this->value . '.dashboard';
    }
}
