<?php

namespace Database\Seeders;

use App\Models\AcademicYear;
use App\Models\Classroom;
use App\Models\Department;
use App\Models\Enrollment;
use App\Models\Semester;
use App\Models\Student;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\TeacherSubject;
use Illuminate\Database\Seeder;

class AcademicSeeder extends Seeder
{
    public function run(): void
    {
        $year = AcademicYear::where('is_active', true)->firstOrFail();
        $semester = Semester::where('is_active', true)->firstOrFail();
        $dept = Department::pluck('id', 'code');
        $teachers = Teacher::orderBy('id')->get();

        // Kelas + wali kelas
        $rooms = [];
        foreach ([['X TKJ 1', 'X', 'TKJ'], ['X RPL 1', 'X', 'RPL'], ['XI RPL 1', 'XI', 'RPL']] as $i => [$name, $level, $code]) {
            $rooms[$name] = Classroom::create([
                'department_id' => $dept[$code],
                'academic_year_id' => $year->id,
                'homeroom_teacher_id' => $teachers[$i]->id,
                'name' => $name,
                'grade_level' => $level,
            ]);
        }

        // Siswa dibagi rata ke tiga kelas
        $roomList = array_values($rooms);
        foreach (Student::orderBy('id')->get()->chunk(4) as $i => $chunk) {
            foreach ($chunk as $student) {
                Enrollment::create([
                    'student_id' => $student->id,
                    'class_id' => $roomList[$i]->id,
                    'academic_year_id' => $year->id,
                ]);
            }
        }

        // Mata pelajaran: [kode, nama, jurusan|null, indeks guru pengampu]
        $subjects = [
            ['PAI', 'Pendidikan Agama Islam', null, 0],
            ['BIN', 'Bahasa Indonesia', null, 1],
            ['MTK', 'Matematika', null, 2],
            ['BIG', 'Bahasa Inggris', null, 1],
            ['DPK', 'Dasar-dasar Pemrograman', 'RPL', 3],
            ['PWB', 'Pemrograman Web', 'RPL', 3],
            ['JKD', 'Jaringan Komputer Dasar', 'TKJ', 3],
        ];

        foreach ($subjects as [$code, $name, $deptCode, $teacherIdx]) {
            $subject = Subject::create([
                'code' => $code,
                'name' => $name,
                'department_id' => $deptCode ? $dept[$deptCode] : null,
            ]);

            foreach ($rooms as $room) {
                // Mapel jurusan hanya diajarkan di kelas jurusannya
                if ($deptCode && $room->department_id != $dept[$deptCode]) {
                    continue;
                }

                TeacherSubject::create([
                    'teacher_id' => $teachers[$teacherIdx]->id,
                    'subject_id' => $subject->id,
                    'class_id' => $room->id,
                    'semester_id' => $semester->id,
                ]);
            }
        }
    }
}
