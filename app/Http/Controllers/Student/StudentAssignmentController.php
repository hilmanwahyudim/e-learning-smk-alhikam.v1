<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Http\Requests\Student\SubmissionRequest;
use App\Models\Assignment;
use App\Models\AssignmentFile;
use App\Models\AssignmentSubmission;
use App\Models\TeacherSubject;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class StudentAssignmentController extends Controller
{
    /**
     * Tampilkan daftar tugas siswa dari seluruh mata pelajaran.
     */
    public function index(Request $request): Response
    {
        $student = $request->user()->student;

        // Ambil kelas yang sedang diikuti siswa
        $enrolledClassIds = $student->enrollments()->pluck('class_id');
        $teacherSubjectIds = TeacherSubject::whereIn('class_id', $enrolledClassIds)->pluck('id');

        $query = Assignment::query()
            ->whereIn('teacher_subject_id', $teacherSubjectIds)
            ->with([
                'teacherSubject.subject:id,code,name',
                'teacherSubject.classroom:id,name',
                'teacherSubject.teacher.user:id,name',
            ]);

        $assignments = $query->orderBy('deadline_at')->get()->map(function ($a) use ($student) {
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
                'subject_name' => $a->teacherSubject->subject->name,
                'class_name' => $a->teacherSubject->classroom->name,
                'teacher_name' => $a->teacherSubject->teacher->user->name,
                'deadline_at' => $a->deadline_at?->format('Y-m-d H:i'),
                'is_past_deadline' => $a->deadline_at?->isPast(),
                'status' => $status,
                'score' => $submission?->score,
                'max_score' => $a->max_score,
            ];
        });

        if ($request->input('filter') === 'pending') {
            $assignments = $assignments->where('status', 'not_submitted')->values();
        } elseif ($request->input('filter') === 'completed') {
            $assignments = $assignments->whereIn('status', ['submitted', 'late', 'graded'])->values();
        }

        return Inertia::render('Student/Assignments/Index', [
            'assignments' => $assignments,
            'filter' => $request->input('filter', 'all'),
        ]);
    }

    /**
     * Tampilkan detail tugas dan formulir pengumpulan jawaban siswa.
     */
    public function show(Request $request, Assignment $assignment): Response
    {
        $student = $request->user()->student;

        $isEnrolled = $student->enrollments()
            ->where('class_id', $assignment->teacherSubject->class_id)
            ->exists();

        if (! $isEnrolled) {
            abort(403, 'Akses ditolak.');
        }

        $assignment->load([
            'teacherSubject.subject',
            'teacherSubject.classroom',
            'teacherSubject.teacher.user',
            'files',
        ]);

        $submission = $assignment->submissions()
            ->where('student_id', $student->id)
            ->first();

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

        return Inertia::render('Student/Assignments/Show', [
            'assignment' => [
                'id' => $assignment->id,
                'title' => $assignment->title,
                'description' => $assignment->description,
                'subject_name' => $assignment->teacherSubject->subject->name,
                'teacher_name' => $assignment->teacherSubject->teacher->user->name,
                'deadline_at' => $assignment->deadline_at?->format('Y-m-d H:i'),
                'is_past_deadline' => $assignment->deadline_at?->isPast(),
                'max_score' => $assignment->max_score,
                'allow_late' => $assignment->allow_late,
                'files' => $assignment->files->map(fn ($f) => [
                    'id' => $f->id,
                    'original_name' => $f->original_name,
                    'size' => $f->size,
                ]),
            ],
            'submission' => $submission ? [
                'id' => $submission->id,
                'status' => $status,
                'submitted_at' => $submission->submitted_at?->format('Y-m-d H:i'),
                'is_late' => (bool) $submission->is_late,
                'original_name' => $submission->original_name,
                'notes' => $submission->notes,
                'score' => $submission->score,
                'feedback' => $submission->feedback,
                'has_file' => (bool) $submission->file_path,
            ] : null,
        ]);
    }

    /**
     * Kumpulkan atau perbarui berkas jawaban tugas.
     */
    public function submit(SubmissionRequest $request, Assignment $assignment): RedirectResponse
    {
        $student = $request->user()->student;

        $isEnrolled = $student->enrollments()
            ->where('class_id', $assignment->teacherSubject->class_id)
            ->exists();

        if (! $isEnrolled) {
            abort(403, 'Akses ditolak.');
        }

        $isLate = now()->isAfter($assignment->deadline_at);

        if ($isLate && ! $assignment->allow_late) {
            return redirect()->back()->with('error', 'Tenggat waktu pengumpulan tugas sudah berakhir dan pengumpulan terlambat tidak diizinkan.');
        }

        $existing = AssignmentSubmission::where('assignment_id', $assignment->id)
            ->where('student_id', $student->id)
            ->first();

        // Jika sudah dinilai, tidak boleh dikumpulkan ulang
        if ($existing && $existing->score !== null) {
            return redirect()->back()->with('error', 'Tugas sudah dinilai dan tidak dapat diubah kembali.');
        }

        $filePath = $existing?->file_path;
        $originalName = $existing?->original_name;

        if ($request->hasFile('file')) {
            // Hapus file lama jika ada
            if ($filePath && Storage::disk('public')->exists($filePath)) {
                Storage::disk('public')->delete($filePath);
            }

            $file = $request->file('file');
            $filePath = $file->store("submissions/{$assignment->id}", 'public');
            $originalName = $file->getClientOriginalName();
        }

        AssignmentSubmission::updateOrCreate(
            [
                'assignment_id' => $assignment->id,
                'student_id' => $student->id,
            ],
            [
                'file_path' => $filePath,
                'original_name' => $originalName,
                'notes' => $request->input('notes'),
                'submitted_at' => now(),
                'is_late' => $isLate,
            ]
        );

        ActivityLogger::log('assignment_submitted', "Mengumpulkan tugas: {$assignment->title}", $assignment);

        $msg = $isLate ? 'Tugas berhasil dikumpulkan (Status: Terlambat).' : 'Tugas berhasil dikumpulkan tepat waktu!';

        return redirect()->back()->with('success', $msg);
    }

    /**
     * Unduh lampiran panduan tugas dari guru.
     */
    public function downloadFile(Request $request, Assignment $assignment, AssignmentFile $file): StreamedResponse
    {
        if (! $file->path || ! Storage::disk('public')->exists($file->path)) {
            abort(404, 'Berkas panduan tidak ditemukan.');
        }

        return Storage::disk('public')->download($file->path, $file->original_name);
    }

    /**
     * Unduh berkas jawaban tugas yang telah diunggah siswa.
     */
    public function downloadSubmission(Request $request, AssignmentSubmission $submission): StreamedResponse
    {
        $student = $request->user()->student;

        if ($submission->student_id !== $student->id) {
            abort(403, 'Akses ditolak.');
        }

        if (! $submission->file_path || ! Storage::disk('public')->exists($submission->file_path)) {
            abort(404, 'Berkas jawaban tidak ditemukan.');
        }

        return Storage::disk('public')->download($submission->file_path, $submission->original_name ?? 'jawaban_tugas');
    }
}
