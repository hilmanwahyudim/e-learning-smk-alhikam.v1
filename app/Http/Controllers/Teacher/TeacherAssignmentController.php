<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Http\Requests\Teacher\AssignmentRequest;
use App\Models\Assignment;
use App\Models\AssignmentFile;
use App\Models\AssignmentSubmission;
use App\Models\TeacherSubject;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class TeacherAssignmentController extends Controller
{
    /**
     * Tampilkan daftar tugas yang dibuat guru.
     */
    public function index(Request $request): Response
    {
        $teacher = $request->user()->teacher;

        $teacherSubjectIds = TeacherSubject::where('teacher_id', $teacher->id)->pluck('id');

        $query = Assignment::query()
            ->whereIn('teacher_subject_id', $teacherSubjectIds)
            ->with([
                'teacherSubject.classroom:id,name,grade_level',
                'teacherSubject.subject:id,code,name',
                'files',
            ])
            ->withCount('submissions');

        if ($request->filled('teacher_subject_id') && $request->teacher_subject_id !== 'all') {
            $query->where('teacher_subject_id', $request->teacher_subject_id);
        }

        $assignments = $query->orderByDesc('deadline_at')->get()->map(function ($a) {
            $isPastDeadline = $a->deadline_at && $a->deadline_at->isPast();

            return [
                'id' => $a->id,
                'title' => $a->title,
                'class_name' => $a->teacherSubject->classroom->name,
                'subject_name' => $a->teacherSubject->subject->name,
                'deadline_at' => $a->deadline_at?->format('Y-m-d H:i'),
                'is_past_deadline' => $isPastDeadline,
                'max_score' => $a->max_score,
                'allow_late' => $a->allow_late,
                'submissions_count' => $a->submissions_count,
                'total_students' => $a->teacherSubject->classroom->enrollments()->count(),
                'files_count' => $a->files->count(),
            ];
        });

        $classes = TeacherSubject::where('teacher_id', $teacher->id)
            ->with(['classroom:id,name', 'subject:id,name,code'])
            ->get()
            ->map(fn ($ts) => [
                'id' => $ts->id,
                'name' => "{$ts->classroom->name} - {$ts->subject->name}",
            ]);

        return Inertia::render('Teacher/Assignments/Index', [
            'assignments' => $assignments,
            'classes' => $classes,
            'filters' => [
                'teacher_subject_id' => $request->teacher_subject_id ?? 'all',
            ],
        ]);
    }

    /**
     * Detail tugas dan rekap status pengumpulan siswa di kelas.
     */
    public function show(Request $request, Assignment $assignment): Response
    {
        $teacher = $request->user()->teacher;

        if ($assignment->teacherSubject->teacher_id !== $teacher->id) {
            abort(403, 'Akses ditolak.');
        }

        $assignment->load([
            'teacherSubject.classroom.enrollments.student.user',
            'teacherSubject.subject',
            'files',
            'submissions.student.user',
        ]);

        $enrolledStudents = $assignment->teacherSubject->classroom->enrollments->map(function ($en) use ($assignment) {
            $student = $en->student;
            $submission = $assignment->submissions->firstWhere('student_id', $student->id);

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
                'student_id' => $student->id,
                'name' => $student->user->name,
                'nis' => $student->nis,
                'submission_id' => $submission?->id,
                'status' => $status,
                'submitted_at' => $submission?->submitted_at?->format('Y-m-d H:i'),
                'is_late' => (bool) $submission?->is_late,
                'score' => $submission?->score,
                'feedback' => $submission?->feedback,
                'has_file' => (bool) $submission?->file_path,
                'original_name' => $submission?->original_name,
                'notes' => $submission?->notes,
            ];
        })->sortBy('name')->values();

        return Inertia::render('Teacher/Assignments/Show', [
            'assignment' => [
                'id' => $assignment->id,
                'title' => $assignment->title,
                'description' => $assignment->description,
                'class_name' => $assignment->teacherSubject->classroom->name,
                'subject_name' => $assignment->teacherSubject->subject->name,
                'start_at' => $assignment->start_at?->format('Y-m-d H:i'),
                'deadline_at' => $assignment->deadline_at?->format('Y-m-d H:i'),
                'max_score' => $assignment->max_score,
                'allow_late' => $assignment->allow_late,
                'files' => $assignment->files->map(fn ($f) => [
                    'id' => $f->id,
                    'original_name' => $f->original_name,
                    'size' => $f->size,
                ]),
            ],
            'students' => $enrolledStudents,
        ]);
    }

    /**
     * Simpan tugas baru beserta lampiran instruksi.
     */
    public function store(AssignmentRequest $request): RedirectResponse
    {
        $teacher = $request->user()->teacher;
        $data = $request->validated();

        $ownsSubject = TeacherSubject::where('id', $data['teacher_subject_id'])
            ->where('teacher_id', $teacher->id)
            ->exists();

        if (! $ownsSubject) {
            abort(403, 'Akses ditolak.');
        }

        DB::transaction(function () use ($data, $request) {
            $assignment = Assignment::create([
                'teacher_subject_id' => $data['teacher_subject_id'],
                'title' => $data['title'],
                'description' => $data['description'] ?? null,
                'start_at' => $data['start_at'] ?? now(),
                'deadline_at' => $data['deadline_at'],
                'max_score' => $data['max_score'] ?? 100,
                'allow_late' => $request->boolean('allow_late', true),
            ]);

            if ($request->hasFile('files')) {
                foreach ($request->file('files') as $file) {
                    $path = $file->store("assignments/{$assignment->id}", 'public');
                    $assignment->files()->create([
                        'path' => $path,
                        'original_name' => $file->getClientOriginalName(),
                        'mime_type' => $file->getClientMimeType(),
                        'size' => $file->getSize(),
                    ]);
                }
            }

            ActivityLogger::log('assignment_created', "Membuat tugas: {$assignment->title}", $assignment);
        });

        return redirect()->back()->with('success', "Tugas {$data['title']} berhasil dibuat.");
    }

    /**
     * Perbarui tugas.
     */
    public function update(AssignmentRequest $request, Assignment $assignment): RedirectResponse
    {
        $teacher = $request->user()->teacher;

        if ($assignment->teacherSubject->teacher_id !== $teacher->id) {
            abort(403, 'Akses ditolak.');
        }

        $data = $request->validated();

        DB::transaction(function () use ($assignment, $data, $request) {
            $assignment->update([
                'title' => $data['title'],
                'description' => $data['description'] ?? null,
                'start_at' => $data['start_at'] ?? $assignment->start_at,
                'deadline_at' => $data['deadline_at'],
                'max_score' => $data['max_score'] ?? 100,
                'allow_late' => $request->boolean('allow_late', true),
            ]);

            if ($request->hasFile('files')) {
                foreach ($request->file('files') as $file) {
                    $path = $file->store("assignments/{$assignment->id}", 'public');
                    $assignment->files()->create([
                        'path' => $path,
                        'original_name' => $file->getClientOriginalName(),
                        'mime_type' => $file->getClientMimeType(),
                        'size' => $file->getSize(),
                    ]);
                }
            }

            ActivityLogger::log('assignment_updated', "Memperbarui tugas: {$assignment->title}", $assignment);
        });

        return redirect()->back()->with('success', "Tugas {$assignment->title} berhasil diperbarui.");
    }

    /**
     * Hapus tugas.
     */
    public function destroy(Request $request, Assignment $assignment): RedirectResponse
    {
        $teacher = $request->user()->teacher;

        if ($assignment->teacherSubject->teacher_id !== $teacher->id) {
            abort(403, 'Akses ditolak.');
        }

        $title = $assignment->title;
        $assignment->delete();

        ActivityLogger::log('assignment_deleted', "Menghapus tugas: {$title}", $assignment);

        return redirect()->back()->with('success', "Tugas {$title} berhasil dihapus.");
    }

    /**
     * Unduh berkas lampiran instruksi tugas.
     */
    public function downloadFile(Request $request, Assignment $assignment, AssignmentFile $file): StreamedResponse
    {
        if (! $file->path || ! Storage::disk('public')->exists($file->path)) {
            abort(404, 'Berkas tidak ditemukan.');
        }

        return Storage::disk('public')->download($file->path, $file->original_name);
    }

    /**
     * Unduh berkas jawaban tugas yang dikumpulkan siswa.
     */
    public function downloadSubmission(Request $request, AssignmentSubmission $submission): StreamedResponse
    {
        $user = $request->user();

        // Hak akses: guru pemilik mapel atau siswa pemilik tugas
        if ($user->teacher) {
            if ($submission->assignment->teacherSubject->teacher_id !== $user->teacher->id) {
                abort(403, 'Akses ditolak.');
            }
        } elseif ($user->student) {
            if ($submission->student_id !== $user->student->id) {
                abort(403, 'Akses ditolak.');
            }
        } else {
            abort(403);
        }

        if (! $submission->file_path || ! Storage::disk('public')->exists($submission->file_path)) {
            abort(404, 'Berkas jawaban tidak ditemukan.');
        }

        return Storage::disk('public')->download($submission->file_path, $submission->original_name ?? 'jawaban_tugas');
    }
}
