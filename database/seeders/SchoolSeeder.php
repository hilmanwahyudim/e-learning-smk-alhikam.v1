<?php

namespace Database\Seeders;

use App\Models\AcademicYear;
use App\Models\Department;
use App\Models\SchoolProfile;
use Illuminate\Database\Seeder;

class SchoolSeeder extends Seeder
{
    public function run(): void
    {
        SchoolProfile::create([
            'name' => 'SMK Al Hikam',
            'tagline' => 'Berilmu, berakhlak, siap berkarya',
            'address' => 'Alamat sekolah (ubah lewat menu Profil Sekolah)',
        ]);

        $year = AcademicYear::create([
            'name' => '2026/2027',
            'start_date' => '2026-07-13',
            'end_date' => '2027-06-26',
            'is_active' => true,
        ]);

        $year->semesters()->createMany([
            ['name' => 'Ganjil', 'start_date' => '2026-07-13', 'end_date' => '2026-12-19', 'is_active' => true],
            ['name' => 'Genap', 'start_date' => '2027-01-04', 'end_date' => '2027-06-26', 'is_active' => false],
        ]);

        foreach ([
            ['TKJ', 'Teknik Komputer dan Jaringan'],
            ['RPL', 'Rekayasa Perangkat Lunak'],
            ['AKL', 'Akuntansi dan Keuangan Lembaga'],
        ] as [$code, $name]) {
            Department::create(['code' => $code, 'name' => $name]);
        }
    }
}
