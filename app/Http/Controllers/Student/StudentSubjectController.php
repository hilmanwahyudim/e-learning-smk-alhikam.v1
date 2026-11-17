<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use App\Models\Material;
use App\Models\MaterialFile;
use App\Models\MaterialProgress;
use App\Models\Semester;
use App\Models\TeacherSubject;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class StudentSubjectController extends Controller
{
    /**
     * Tampilkan daftar mata pelajaran yang diikuti siswa pada semester aktif.
     */
    public function index(Request $request): Response
    {
        $student = $request->user()->student;
        $activeYear = AcademicYear::where('is_active', true)->first();
        $activeSemester = Semester::where('is_active', true)->first();

        $enrollment = $student->enrollments()
            ->where('academic_year_id', $activeYear?->id ?? 0)
            ->with('classroom.department')
            ->first();

        $subjects = [];
        if ($enrollment && $activeSemester) {
            $subjects = TeacherSubject::query()
                ->where('class_id', $enrollment->class_id)
                ->where('semester_id', $activeSemester->id)
                ->with(['subject', 'teacher.user'])
                ->withCount(['materials', 'assignments', 'quizzes'])
                ->get()
                ->map(function ($ts) use ($student) {
                    $completedMaterials = MaterialProgress::where('student_id', $student->id)
                        ->whereIn('material_id', $ts->materials()->pluck('id'))
                        ->count();

                    $totalMaterials = $ts->materials_count;
                    $percent = $totalMaterials > 0 ? round(($completedMaterials / $totalMaterials) * 100) : 0;

                    return [
                        'id' => $ts->id,
                        'name' => $ts->subject->name,
                        'code' => $ts->subject->code,
                        'teacher_name' => $ts->teacher->user->name,
                        'materials_count' => $ts->materials_count,
                        'assignments_count' => $ts->assignments_count,
                        'quizzes_count' => $ts->quizzes_count,
                        'progress_percent' => $percent,
                    ];
                });
        }

        return Inertia::render('Student/Subjects/Index', [
            'subjects' => $subjects,
            'classroom' => $enrollment?->classroom ? [
                'name' => $enrollment->classroom->name,
                'grade_level' => $enrollment->classroom->grade_level,
                'department' => $enrollment->classroom->department?->name,
            ] : null,
            'activeSemester' => $activeSemester?->name,
            'activeYear' => $activeYear?->name,
        ]);
    }

    /**
     * Tampilkan halaman kursus LMS mata pelajaran untuk siswa.
     */
    public function show(Request $request, TeacherSubject $teacherSubject): Response
    {
        $student = $request->user()->student;

        // Validasi siswa berada di kelas ini
        $isEnrolled = $student->enrollments()
            ->where('class_id', $teacherSubject->class_id)
            ->exists();

        if (! $isEnrolled) {
            abort(403, 'Anda tidak terdaftar di kelas mata pelajaran ini.');
        }

        $teacherSubject->load([
            'classroom.department',
            'subject',
            'teacher.user',
            'materials' => fn ($q) => $q->notArchived()->where('is_published', true)->with('files')->orderBy('sort_order'),
            'assignments' => fn ($q) => $q->with('files')->orderBy('deadline_at'),
            'quizzes' => fn ($q) => $q->where('is_published', true)->orderBy('created_at'),
        ]);

        $completedMaterialIds = MaterialProgress::where('student_id', $student->id)
            ->whereIn('material_id', $teacherSubject->materials->pluck('id'))
            ->pluck('material_id')
            ->toArray();

        // Map status tugas siswa
        $assignments = $teacherSubject->assignments->map(function ($a) use ($student) {
            $submission = $a->submissions()->where('student_id', $student->id)->first();

            $status = 'not_submitted';
            if ($submission) {
                if ($submission->score !== null) {
                    $status = 'graded';
                } elseif ($submission->is_late) {
                    $status = 'late';
                } else {
                    $status = 'submitted';
                }
            }

            return [
                'id' => $a->id,
                'title' => $a->title,
                'description' => $a->description,
                'deadline_at' => $a->deadline_at?->format('Y-m-d H:i'),
                'is_past_deadline' => $a->deadline_at?->isPast(),
                'max_score' => $a->max_score,
                'allow_late' => $a->allow_late,
                'status' => $status,
                'score' => $submission?->score,
                'has_submission' => (bool) $submission,
            ];
        });

        // Map status kuis siswa
        $quizzes = $teacherSubject->quizzes->map(function ($q) use ($student) {
            $attempts = $q->attempts()->where('student_id', $student->id)->get();
            $bestScore = $attempts->whereNotNull('total_score')->max('total_score');

            return [
                'id' => $q->id,
                'title' => $q->title,
                'type' => $q->type,
                'duration_minutes' => $q->duration_minutes,
                'start_at' => $q->start_at?->format('Y-m-d H:i'),
                'end_at' => $q->end_at?->format('Y-m-d H:i'),
                'max_attempts' => $q->max_attempts,
                'attempts_used' => $attempts->count(),
                'best_score' => $bestScore,
                'has_in_progress' => $attempts->where('status', 'in_progress')->isNotEmpty(),
            ];
        });

        return Inertia::render('Student/Subjects/Show', [
            'course' => [
                'id' => $teacherSubject->id,
                'name' => $teacherSubject->subject->name,
                'code' => $teacherSubject->subject->code,
                'description' => $teacherSubject->subject->description,
                'class_name' => $teacherSubject->classroom->name,
                'teacher' => [
                    'name' => $teacherSubject->teacher->user->name,
                    'nip' => $teacherSubject->teacher->nip,
                    'phone' => $teacherSubject->teacher->phone,
                ],
            ],
            'materials' => $teacherSubject->materials->map(function ($m) use ($completedMaterialIds) {
                return [
                    'id' => $m->id,
                    'title' => $m->title,
                    'description' => $m->description,
                    'content' => $m->content,
                    'sort_order' => $m->sort_order,
                    'is_completed' => in_array($m->id, $completedMaterialIds, true),
                    'files' => $m->files->map(fn ($f) => [
                        'id' => $f->id,
                        'type' => $f->type,
                        'url' => $f->url,
                        'original_name' => $f->original_name,
                        'size' => $f->size,
                    ]),
                ];
            }),
            'assignments' => $assignments,
            'quizzes' => $quizzes,
        ]);
    }

    /**
     * Tandai materi sebagai selesai dipelajari atau batalkan.
     */
    public function toggleProgress(Request $request, Material $material): RedirectResponse
    {
        $student = $request->user()->student;

        $progress = MaterialProgress::where('material_id', $material->id)
            ->where('student_id', $student->id)
            ->first();

        if ($progress) {
            $progress->delete();
            $msg = 'Materi ditandai belum selesai.';
        } else {
            MaterialProgress::create([
                'material_id' => $material->id,
                'student_id' => $student->id,
                'completed_at' => now(),
            ]);
            $msg = 'Materi berhasil ditandai selesai!';
        }

        return redirect()->back()->with('success', $msg);
    }

    /**
     * Unduh lampiran materi.
     */
    public function downloadFile(Request $request, Material $material, MaterialFile $file): StreamedResponse
    {
        $student = $request->user()->student;

        $isEnrolled = $student->enrollments()
            ->where('class_id', $material->teacherSubject->class_id)
            ->exists();

        if (! $isEnrolled) {
            abort(403, 'Akses ditolak.');
        }

        if (! $file->path || ! Storage::disk('public')->exists($file->path)) {
            abort(404, 'Berkas tidak ditemukan.');
        }

        return Storage::disk('public')->download($file->path, $file->original_name);
    }
}
