<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            SchoolSeeder::class,   // profil sekolah, tahun ajaran, semester, jurusan
            UserSeeder::class,     // admin, guru, siswa
            AcademicSeeder::class, // kelas, mapel, enrollment, pengampu
            DemoContentSeeder::class, // materi, tugas, nilai, pengumuman dummy (hapus saat produksi)
        ]);
    }
}
