<?php

namespace Database\Seeders;

use App\Enums\Role;
use App\Models\ActivityLog;
use App\Models\Announcement;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\CalendarEvent;
use App\Models\Classroom;
use App\Models\Grade;
use App\Models\Material;
use App\Models\MaterialProgress;
use App\Models\Quiz;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\TeacherSubject;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * Data dummy supaya dashboard langsung berisi saat diuji.
 * Hapus dari DatabaseSeeder sebelum dipakai sungguhan.
 */
class DemoContentSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('role', Role::Admin->value)->firstOrFail();

        $teacherSubjects = TeacherSubject::with(['subject', 'teacher'])->get();

        foreach ($teacherSubjects as $ts) {
            $name = $ts->subject->name;

            $materials = collect([1, 2, 3])->map(fn ($i) => Material::create([
                'teacher_subject_id' => $ts->id,
                'title' => "Pertemuan {$i}: {$name}",
                'description' => 'Materi contoh untuk pengujian.',
                'sort_order' => $i,
                'is_published' => true,
            ]));

            $upcoming = Assignment::create([
                'teacher_subject_id' => $ts->id,
                'title' => "Latihan {$name}",
                'description' => 'Kerjakan latihan lalu unggah jawabannya.',
                'start_at' => now()->subDays(2),
                'deadline_at' => now()->addDays(mt_rand(2, 9))->setTime(23, 59),
            ]);

            $past = Assignment::create([
                'teacher_subject_id' => $ts->id,
                'title' => "Tugas Pengantar {$name}",
                'description' => 'Tugas pertama semester ini.',
                'start_at' => now()->subDays(10),
                'deadline_at' => now()->subDays(3)->setTime(23, 59),
            ]);

            $students = Student::whereHas('enrollments', fn ($q) => $q->where('class_id', $ts->class_id))->get();

            foreach ($students->values() as $idx => $student) {
                // Progres materi
                if ($idx % 3 !== 2) {
                    MaterialProgress::create([
                        'material_id' => $materials[0]->id,
                        'student_id' => $student->id,
                        'completed_at' => now()->subDays(2),
                    ]);
                }
                if ($idx % 2 === 0) {
                    MaterialProgress::create([
                        'material_id' => $materials[1]->id,
                        'student_id' => $student->id,
                        'completed_at' => now()->subDay(),
                    ]);
                }

                // Pengumpulan tugas lama: 0 = dinilai, 1 = tepat waktu, 2 = terlambat, 3 = belum mengumpulkan
                $case = $idx % 4;
                if ($case === 3) {
                    continue;
                }

                $late = $case === 2;
                $submission = AssignmentSubmission::create([
                    'assignment_id' => $past->id,
                    'student_id' => $student->id,
                    'original_name' => 'jawaban.pdf',
                    'submitted_at' => $late ? $past->deadline_at->copy()->addHours(8) : $past->deadline_at->copy()->subHours(5),
                    'is_late' => $late,
                ]);

                if ($case === 0) {
                    $score = 70 + mt_rand(0, 30);
                    $submission->update([
                        'score' => $score,
                        'feedback' => 'Sudah baik, pertahankan.',
                        'graded_by' => $ts->teacher->user_id,
                        'graded_at' => now()->subDay(),
                    ]);

                    Grade::create([
                        'student_id' => $student->id,
                        'teacher_subject_id' => $ts->id,
                        'semester_id' => $ts->semester_id,
                        'gradeable_type' => $submission->getMorphClass(),
                        'gradeable_id' => $submission->id,
                        'category' => 'assignment',
                        'score' => $score,
                    ]);
                }
            }

            if (in_array($ts->subject->code, ['MTK', 'PWB'], true)) {
                Quiz::create([
                    'teacher_subject_id' => $ts->id,
                    'type' => 'exam',
                    'title' => "Ujian Tengah Semester {$name}",
                    'start_at' => now()->addDays(5)->setTime(8, 0),
                    'end_at' => now()->addDays(5)->setTime(9, 30),
                    'duration_minutes' => 90,
                    'is_published' => true,
                ]);
            }
        }

        // Pengumuman
        Announcement::create([
            'author_id' => $admin->id,
            'title' => 'Selamat datang di E-Learning SMK Al Hikam',
            'body' => "Mulai semester ini, materi, tugas, dan ujian dikelola lewat E-Learning.\nSilakan login memakai akun yang dibagikan sekolah dan hubungi wali kelas jika ada kendala.",
            'published_at' => now()->subDay(),
        ]);

        $room = Classroom::orderBy('id')->first();
        $homeroom = Teacher::find($room->homeroom_teacher_id);
        Announcement::create([
            'author_id' => $homeroom->user_id,
            'class_id' => $room->id,
            'title' => "Informasi untuk kelas {$room->name}",
            'body' => 'Harap mengumpulkan tugas tepat waktu. Tugas yang terlambat tetap diterima dengan status terlambat.',
            'published_at' => now()->subHours(5),
        ]);

        // Notifikasi
        foreach (Student::with('user')->get() as $student) {
            $student->user->notifications()->create([
                'id' => (string) Str::uuid(),
                'type' => 'App\\Notifications\\NewAssignment',
                'data' => ['title' => 'Tugas baru', 'body' => 'Ada tugas baru dari guru Anda.', 'url' => '/student/dashboard'],
            ]);
        }
        foreach (Teacher::with('user')->get() as $teacher) {
            $teacher->user->notifications()->create([
                'id' => (string) Str::uuid(),
                'type' => 'App\\Notifications\\SubmissionReceived',
                'data' => ['title' => 'Tugas menunggu dinilai', 'body' => 'Beberapa siswa sudah mengumpulkan tugas.', 'url' => '/teacher/dashboard'],
            ]);
        }

        // Kalender akademik
        CalendarEvent::insert([
            ['title' => 'Ujian Tengah Semester Ganjil', 'start_date' => now()->addDays(5)->toDateString(), 'end_date' => now()->addDays(9)->toDateString(), 'category' => 'ujian', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Pembagian laporan hasil belajar', 'start_date' => '2026-12-19', 'end_date' => null, 'category' => 'akademik', 'created_at' => now(), 'updated_at' => now()],
        ]);

        // Riwayat aktivitas 7 hari terakhir (untuk grafik admin)
        $userIds = User::pluck('id')->all();
        $logs = [];
        for ($day = 6; $day >= 0; $day--) {
            for ($n = mt_rand(8, 28); $n > 0; $n--) {
                $at = now()->subDays($day)->setTime(mt_rand(6, 20), mt_rand(0, 59));
                $logs[] = [
                    'user_id' => $userIds[array_rand($userIds)],
                    'action' => 'login',
                    'description' => 'Login berhasil',
                    'ip_address' => '127.0.0.1',
                    'created_at' => $at,
                    'updated_at' => $at,
                ];
            }
        }
        ActivityLog::insert($logs);
    }
}
