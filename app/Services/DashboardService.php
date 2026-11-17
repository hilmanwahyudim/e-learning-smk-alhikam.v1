<?php

namespace App\Services;

use App\Models\AcademicYear;
use App\Models\ActivityLog;
use App\Models\Announcement;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\Classroom;
use App\Models\Enrollment;
use App\Models\Grade;
use App\Models\Material;
use App\Models\MaterialProgress;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\Semester;
use App\Models\Student;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\TeacherSubject;
use App\Models\User;
use Illuminate\Support\Facades\DB;

/**
 * Menyiapkan data untuk dashboard tiap role.
 * Semua tanggal dikirim sebagai ISO-8601; pemformatan dilakukan di React.
 */
class DashboardService
{
    public function admin(): array
    {
        $year = AcademicYear::active()->first();

        $stats = [
            'students' => Student::count(),
            'teachers' => Teacher::count(),
            'classes' => Classroom::when($year, fn ($q) => $q->where('academic_year_id', $year->id))->count(),
            'subjects' => Subject::count(),
            'materials' => Material::notArchived()->count(),
            'active_assignments' => Assignment::where('deadline_at', '>=', now())->count(),
        ];

        // Aktivitas 7 hari terakhir (jumlah baris activity_logs per hari)
        $byDay = ActivityLog::query()
            ->where('created_at', '>=', now()->subDays(6)->startOfDay())
            ->selectRaw('DATE(created_at) as day, COUNT(*) as total')
            ->groupBy('day')
            ->pluck('total', 'day');

        $labels = [];
        $values = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i)->toDateString();
            $labels[] = $date;
            $values[] = (int) ($byDay[$date] ?? 0);
        }

        // Statistik pengumpulan tugas
        $submitted = AssignmentSubmission::query()->whereNotNull('submitted_at');
        $graded = (clone $submitted)->whereNotNull('graded_at')->count();
        $late = (clone $submitted)->whereNull('graded_at')->where('is_late', true)->count();
        $onTime = (clone $submitted)->whereNull('graded_at')->where('is_late', false)->count();

        // Pasangan (tugas x siswa kelas penerima) = jumlah pengumpulan yang diharapkan
        $expected = DB::table('assignments')
            ->join('teacher_subjects', 'teacher_subjects.id', '=', 'assignments.teacher_subject_id')
            ->join('enrollments', 'enrollments.class_id', '=', 'teacher_subjects.class_id')
            ->whereNull('assignments.deleted_at')
            ->count();
        $missing = max(0, $expected - ($graded + $late + $onTime));

        $recent = ActivityLog::with('user:id,name,role')
            ->latest()
            ->limit(8)
            ->get()
            ->map(fn ($log) => [
                'id' => $log->id,
                'user' => $log->user?->name ?? 'Sistem',
                'role' => $log->user?->role?->label(),
                'description' => $log->description ?? $log->action,
                'at' => $log->created_at->toIso8601String(),
            ]);

        return [
            'stats' => $stats,
            'activity' => ['labels' => $labels, 'values' => $values],
            'submissions' => [
                'labels' => ['Sudah dinilai', 'Tepat waktu (belum dinilai)', 'Terlambat (belum dinilai)', 'Belum mengumpulkan'],
                'values' => [$graded, $onTime, $late, $missing],
            ],
            'recent' => $recent,
        ];
    }

    public function teacher(User $user): array
    {
        $teacher = $user->teacher;

        $subjects = $teacher
            ? TeacherSubject::where('teacher_id', $teacher->id)
                ->whereHas('semester', fn ($q) => $q->where('is_active', true))
                ->get(['id', 'class_id'])
            : collect();

        $tsIds = $subjects->pluck('id');
        $classIds = $subjects->pluck('class_id')->unique();

        $toGrade = AssignmentSubmission::query()
            ->whereNotNull('submitted_at')
            ->whereNull('graded_at')
            ->whereHas('assignment', fn ($q) => $q->whereIn('teacher_subject_id', $tsIds));

        $stats = [
            'classes' => $classIds->count(),
            'students' => Enrollment::whereIn('class_id', $classIds)->distinct()->count('student_id'),
            'materials' => Material::whereIn('teacher_subject_id', $tsIds)->notArchived()->count(),
            'to_grade' => (clone $toGrade)->count(),
        ];

        $pending = (clone $toGrade)
            ->with([
                'student.user:id,name',
                'assignment.teacherSubject.subject:id,name',
                'assignment.teacherSubject.classroom:id,name',
            ])
            ->orderBy('submitted_at')
            ->limit(100)
            ->get()
            ->map(fn ($s) => [
                'id' => $s->id,
                'student' => $s->student?->user?->name ?? '-',
                'assignment' => $s->assignment?->title ?? '-',
                'subject' => $s->assignment?->teacherSubject?->subject?->name ?? '-',
                'class' => $s->assignment?->teacherSubject?->classroom?->name ?? '-',
                'submitted_at' => $s->submitted_at?->toIso8601String(),
                'is_late' => (bool) $s->is_late,
            ])->values();

        $exams = Quiz::with(['teacherSubject.subject:id,name', 'teacherSubject.classroom:id,name'])
            ->whereIn('teacher_subject_id', $tsIds)
            ->where('is_published', true)
            ->whereNotNull('start_at')
            ->where('start_at', '>=', now()->startOfDay())
            ->orderBy('start_at')
            ->limit(5)
            ->get()
            ->map(fn ($q) => [
                'id' => $q->id,
                'title' => $q->title,
                'type' => $q->type === 'exam' ? 'Ujian' : 'Kuis',
                'subject' => $q->teacherSubject?->subject?->name,
                'class' => $q->teacherSubject?->classroom?->name,
                'start_at' => $q->start_at->toIso8601String(),
                'duration' => $q->duration_minutes,
            ]);

        $submissions = AssignmentSubmission::with(['student.user:id,name', 'assignment:id,title,teacher_subject_id'])
            ->whereHas('assignment', fn ($q) => $q->whereIn('teacher_subject_id', $tsIds))
            ->whereNotNull('submitted_at')
            ->latest('submitted_at')
            ->limit(6)
            ->get()
            ->map(fn ($s) => [
                'student' => $s->student?->user?->name ?? '-',
                'text' => 'mengumpulkan ' . ($s->assignment?->title ?? 'tugas'),
                'at' => $s->submitted_at,
            ]);

        $attempts = QuizAttempt::with(['student.user:id,name', 'quiz:id,title'])
            ->whereHas('quiz', fn ($q) => $q->whereIn('teacher_subject_id', $tsIds))
            ->latest('started_at')
            ->limit(6)
            ->get()
            ->map(fn ($a) => [
                'student' => $a->student?->user?->name ?? '-',
                'text' => 'mengerjakan ' . ($a->quiz?->title ?? 'kuis'),
                'at' => $a->started_at,
            ]);

        $activities = $submissions->concat($attempts)
            ->sortByDesc('at')
            ->take(6)
            ->values()
            ->map(fn ($a) => [...$a, 'at' => $a['at']->toIso8601String()]);

        return compact('stats', 'pending', 'exams', 'activities');
    }

    public function student(User $user): array
    {
        $student = $user->student;
        $year = AcademicYear::active()->first();
        $semester = Semester::active()->first();

        $enrollment = $student
            ? Enrollment::with('classroom.department')
                ->where('student_id', $student->id)
                ->when($year, fn ($q) => $q->where('academic_year_id', $year->id))
                ->first()
            : null;
        $classId = $enrollment?->class_id;

        $teacherSubjects = ($student && $classId && $semester)
            ? TeacherSubject::with(['subject', 'teacher.user:id,name'])
                ->withCount(['materials as materials_total' => fn ($q) => $q->where('is_published', true)->whereNull('archived_at')])
                ->where('class_id', $classId)
                ->where('semester_id', $semester->id)
                ->get()
            : collect();
        $tsIds = $teacherSubjects->pluck('id');

        // Materi yang sudah selesai dipelajari, dikelompokkan per mapel
        $doneByTs = $student
            ? MaterialProgress::query()
                ->join('materials', 'materials.id', '=', 'material_progress.material_id')
                ->where('material_progress.student_id', $student->id)
                ->whereNotNull('material_progress.completed_at')
                ->whereIn('materials.teacher_subject_id', $tsIds)
                ->selectRaw('materials.teacher_subject_id as ts_id, COUNT(*) as total')
                ->groupBy('materials.teacher_subject_id')
                ->pluck('total', 'ts_id')
            : collect();

        $subjects = $teacherSubjects->map(function ($ts) use ($doneByTs) {
            $total = (int) $ts->materials_total;
            $done = min($total, (int) ($doneByTs[$ts->id] ?? 0));

            return [
                'id' => $ts->id,
                'name' => $ts->subject?->name,
                'teacher' => $ts->teacher?->user?->name,
                'total' => $total,
                'done' => $done,
                'percent' => $total ? (int) round($done / $total * 100) : 0,
            ];
        })->values();

        $sumTotal = $subjects->sum('total');
        $progress = $sumTotal ? (int) round($subjects->sum('done') / $sumTotal * 100) : 0;

        // Tugas yang belum dikumpulkan (dan masih boleh dikerjakan)
        $pending = $student
            ? Assignment::with('teacherSubject.subject:id,name')
                ->whereIn('teacher_subject_id', $tsIds)
                ->where(fn ($q) => $q->whereNull('start_at')->orWhere('start_at', '<=', now()))
                ->whereDoesntHave('submissions', fn ($q) => $q->where('student_id', $student->id)->whereNotNull('submitted_at'))
                ->where(fn ($q) => $q->where('deadline_at', '>=', now())->orWhere('allow_late', true))
                ->orderBy('deadline_at')
                ->get()
                ->map(fn ($a) => [
                    'id' => $a->id,
                    'title' => $a->title,
                    'subject' => $a->teacherSubject?->subject?->name,
                    'deadline_at' => $a->deadline_at->toIso8601String(),
                    'overdue' => $a->deadline_at->isPast(),
                ])->values()
            : collect();

        $nextDeadline = $pending->firstWhere('overdue', false);

        $grades = $student
            ? Grade::with(['teacherSubject.subject:id,name', 'gradeable'])
                ->where('student_id', $student->id)
                ->latest()
                ->limit(5)
                ->get()
                ->map(function ($g) {
                    $item = $g->gradeable;
                    $title = $item instanceof AssignmentSubmission
                        ? $item->assignment?->title
                        : ($item instanceof QuizAttempt ? $item->quiz?->title : null);

                    return [
                        'id' => $g->id,
                        'title' => $title ?? 'Penilaian',
                        'subject' => $g->teacherSubject?->subject?->name,
                        'category' => match ($g->category) {
                            'assignment' => 'Tugas',
                            'quiz' => 'Kuis',
                            'exam' => 'Ujian',
                            default => ucfirst($g->category),
                        },
                        'score' => (float) $g->score,
                        'at' => $g->created_at->toIso8601String(),
                    ];
                })
            : collect();

        $announcements = Announcement::with('author:id,name')
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now())
            ->where(fn ($q) => $q->whereNull('class_id')->orWhere('class_id', $classId))
            ->latest('published_at')
            ->limit(5)
            ->get()
            ->map(fn ($a) => [
                'id' => $a->id,
                'title' => $a->title,
                'body' => $a->body,
                'author' => $a->author?->name,
                'at' => $a->published_at->toIso8601String(),
            ]);

        return [
            'profile' => [
                'class' => $enrollment?->classroom?->name,
                'department' => $enrollment?->classroom?->department?->name,
                'semester' => $semester ? $semester->name . ' ' . ($year?->name ?? '') : null,
            ],
            'subjects' => $subjects,
            'pending' => $pending->take(6)->values(),
            'pending_total' => $pending->count(),
            'next_deadline' => $nextDeadline,
            'grades' => $grades,
            'announcements' => $announcements,
            'progress' => $progress,
        ];
    }
}
