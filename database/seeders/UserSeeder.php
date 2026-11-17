<?php

namespace Database\Seeders;

use App\Enums\Role;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /** Kata sandi semua akun dummy. WAJIB diganti di produksi. */
    private const PASSWORD = 'password';

    public function run(): void
    {
        $hash = Hash::make(self::PASSWORD); // di-hash sekali, dipakai ulang

        User::create([
            'name' => 'Administrator',
            'username' => 'admin',
            'email' => 'admin@alhikam.sch.id',
            'password' => $hash,
            'role' => Role::Admin,
        ]);

        $teachers = [
            ['Ahmad Fauzi, S.Pd.I', 'L', 'Pendidikan Agama Islam'],
            ['Siti Nurhaliza, S.Pd', 'P', 'Bahasa Indonesia dan Inggris'],
            ['Budi Santoso, S.Pd', 'L', 'Matematika'],
            ['Rina Wulandari, S.Kom', 'P', 'Produktif TKJ dan RPL'],
        ];

        foreach ($teachers as $i => [$name, $gender, $spec]) {
            $n = $i + 1;
            $user = User::create([
                'name' => $name,
                'username' => sprintf('guru%02d', $n),
                'email' => sprintf('guru%02d@alhikam.sch.id', $n),
                'password' => $hash,
                'role' => Role::Teacher,
            ]);

            Teacher::create([
                'user_id' => $user->id,
                'nip' => sprintf('19800101200001%04d', $n),
                'gender' => $gender,
                'specialization' => $spec,
            ]);
        }

        $students = [
            'Muhammad Rizky', 'Aisyah Putri', 'Fadhil Ramadhan', 'Nabila Azzahra',
            'Dimas Prasetyo', 'Salsabila Nur', 'Fikri Hidayat', 'Zahra Amelia',
            'Raka Pratama', 'Syifa Maharani', 'Ilham Maulana', 'Putri Ayu Lestari',
        ];

        foreach ($students as $i => $name) {
            $n = $i + 1;
            $user = User::create([
                'name' => $name,
                'username' => sprintf('siswa%02d', $n),
                'email' => sprintf('siswa%02d@alhikam.sch.id', $n),
                'password' => $hash,
                'role' => Role::Student,
            ]);

            Student::create([
                'user_id' => $user->id,
                'nis' => sprintf('2026%03d', $n),
                'gender' => $i % 2 === 0 ? 'L' : 'P',
                'birth_place' => 'Bandung',
                'birth_date' => '2010-05-' . str_pad((string) (($n % 28) + 1), 2, '0', STR_PAD_LEFT),
                'guardian_name' => 'Wali ' . $name,
            ]);
        }
    }
}
