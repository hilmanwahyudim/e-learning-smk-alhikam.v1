<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Http\Requests\Teacher\GradeAssignmentRequest;
use App\Http\Requests\Teacher\GradeEssayRequest;
use App\Models\AssignmentSubmission;
use App\Models\Grade;
use App\Models\QuizAttempt;
use App\Models\TeacherSubject;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class TeacherGradingController extends Controller
{
    /**
     * Tampilkan antrean koreksi tugas dan ujian siswa.
     */
    public function index(Request $request): Response
    {
        $teacher = $request->user()->teacher;
        $teacherSubjectIds = TeacherSubject::where('teacher_id', $teacher->id)->pluck('id');

        // Pengumpulan Tugas yang belum / sudah dinilai
        $submissionQuery = AssignmentSubmission::query()
            ->whereHas('assignment', fn ($q) => $q->whereIn('teacher_subject_id', $teacherSubjectIds))
            ->with([
                'assignment.teacherSubject.classroom:id,name',
                'assignment.teacherSubject.subject:id,name,code',
                'student.user:id,name',
            ]);

        // Attempt Ujian / Kuis yang butuh koreksi (status = submitted / in_progress / graded)
        $attemptQuery = QuizAttempt::query()
            ->whereHas('quiz', fn ($q) => $q->whereIn('teacher_subject_id', $teacherSubjectIds))
            ->with([
                'quiz.teacherSubject.classroom:id,name',
                'quiz.teacherSubject.subject:id,name,code',
                'student.user:id,name',
            ]);

        if ($request->filled('teacher_subject_id') && $request->teacher_subject_id !== 'all') {
            $tsId = $request->teacher_subject_id;
            $submissionQuery->whereHas('assignment', fn ($q) => $q->where('teacher_subject_id', $tsId));
            $attemptQuery->whereHas('quiz', fn ($q) => $q->where('teacher_subject_id', $tsId));
        }

        $assignmentSubmissions = $submissionQuery->orderByDesc('submitted_at')->get()->map(fn ($sub) => [
            'id' => $sub->id,
            'type' => 'assignment',
            'title' => $sub->assignment->title,
            'subject_name' => $sub->assignment->teacherSubject->subject->name,
            'class_name' => $sub->assignment->teacherSubject->classroom->name,
            'student_name' => $sub->student->user->name,
            'student_nis' => $sub->student->nis,
            'submitted_at' => $sub->submitted_at?->format('Y-m-d H:i'),
            'is_late' => (bool) $sub->is_late,
            'has_file' => (bool) $sub->file_path,
            'original_name' => $sub->original_name,
            'notes' => $sub->notes,
            'score' => $sub->score,
            'max_score' => $sub->assignment->max_score,
            'feedback' => $sub->feedback,
            'is_graded' => $sub->score !== null,
        ]);

        $quizAttempts = $attemptQuery->orderByDesc('finished_at')->get()->map(fn ($att) => [
            'id' => $att->id,
            'type' => 'quiz',
            'title' => $att->quiz->title,
            'quiz_type' => $att->quiz->type,
            'subject_name' => $att->quiz->teacherSubject->subject->name,
            'class_name' => $att->quiz->teacherSubject->classroom->name,
            'student_name' => $att->student->user->name,
            'student_nis' => $att->student->nis,
            'finished_at' => $att->finished_at?->format('Y-m-d H:i'),
            'status' => $att->status,
            'auto_score' => $att->auto_score,
            'total_score' => $att->total_score,
            'is_graded' => $att->status === 'graded',
        ]);

        $classes = TeacherSubject::where('teacher_id', $teacher->id)
            ->with(['classroom:id,name', 'subject:id,name,code'])
            ->get()
            ->map(fn ($ts) => [
                'id' => $ts->id,
                'name' => "{$ts->classroom->name} - {$ts->subject->name}",
            ]);

        return Inertia::render('Teacher/Grading/Index', [
            'assignmentSubmissions' => $assignmentSubmissions,
            'quizAttempts' => $quizAttempts,
            'classes' => $classes,
            'filters' => [
                'teacher_subject_id' => $request->teacher_subject_id ?? 'all',
                'tab' => $request->tab ?? 'assignments',
            ],
        ]);
    }

    /**
     * Berikan nilai dan catatan revisi/feedback pada tugas siswa.
     */
    public function gradeAssignment(GradeAssignmentRequest $request, AssignmentSubmission $submission): RedirectResponse
    {
        $teacher = $request->user()->teacher;

        if ($submission->assignment->teacherSubject->teacher_id !== $teacher->id) {
            abort(403, 'Akses ditolak.');
        }

        $validated = $request->validated();

        DB::transaction(function () use ($request, $submission, $validated) {
            $submission->update([
                'score' => $validated['score'],
                'feedback' => $validated['feedback'] ?? null,
                'graded_at' => now(),
                'graded_by' => $request->user()->id,
            ]);

            Grade::updateOrCreate(
                [
                    'gradeable_type' => AssignmentSubmission::class,
                    'gradeable_id' => $submission->id,
                ],
                [
                    'student_id' => $submission->student_id,
                    'teacher_subject_id' => $submission->assignment->teacher_subject_id,
                    'semester_id' => $submission->assignment->teacherSubject->semester_id,
                    'category' => 'assignment',
                    'score' => $validated['score'],
                ]
            );

            ActivityLogger::log('assignment_graded', "Menilai tugas {$submission->assignment->title} untuk siswa {$submission->student->user->name}", $submission);
        });

        return redirect()->back()->with('success', 'Nilai dan catatan tugas berhasil disimpan.');
    }

    /**
     * Tampilkan detail lembar pengerjaan kuis/ujian untuk penilaian butir esai.
     */
    public function showQuizAttempt(Request $request, QuizAttempt $attempt): Response
    {
        $teacher = $request->user()->teacher;

        if ($attempt->quiz->teacherSubject->teacher_id !== $teacher->id) {
            abort(403, 'Akses ditolak.');
        }

        $attempt->load([
            'quiz.teacherSubject.classroom',
            'quiz.teacherSubject.subject',
            'student.user',
            'answers.question.options',
            'answers.option',
        ]);

        $quizQuestions = $attempt->quiz->questions()->get()->keyBy('id');

        $answers = $attempt->answers->map(function ($ans) use ($quizQuestions) {
            $question = $quizQuestions->get($ans->question_id) ?? $ans->question;
            $maxPoints = (float) ($question->pivot?->points ?? $question->default_points ?? 10);

            return [
                'id' => $ans->id,
                'question_id' => $ans->question_id,
                'type' => $ans->question->type->value,
                'type_label' => $ans->question->type->label(),
                'body' => $ans->question->body,
                'explanation' => $ans->question->explanation,
                'answer_key' => $ans->question->answer_key,
                'student_answer' => $ans->option ? $ans->option->body : $ans->answer_text,
                'is_correct' => $ans->is_correct,
                'score' => $ans->score,
                'max_score' => $maxPoints,
                'feedback' => $ans->feedback,
            ];
        });

        return Inertia::render('Teacher/Grading/QuizAttempt', [
            'attempt' => [
                'id' => $attempt->id,
                'quiz_id' => $attempt->quiz->id,
                'quiz_title' => $attempt->quiz->title,
                'quiz_type' => $attempt->quiz->type,
                'class_name' => $attempt->quiz->teacherSubject->classroom->name,
                'subject_name' => $attempt->quiz->teacherSubject->subject->name,
                'student_name' => $attempt->student->user->name,
                'student_nis' => $attempt->student->nis,
                'started_at' => $attempt->started_at?->format('Y-m-d H:i'),
                'finished_at' => $attempt->finished_at?->format('Y-m-d H:i'),
                'status' => $attempt->status,
                'auto_score' => $attempt->auto_score,
                'total_score' => $attempt->total_score,
            ],
            'answers' => $answers,
        ]);
    }

    /**
     * Simpan penilaian butir esai pada kuis/ujian.
     */
    public function gradeQuizAttempt(GradeEssayRequest $request, QuizAttempt $attempt): RedirectResponse
    {
        $teacher = $request->user()->teacher;

        if ($attempt->quiz->teacherSubject->teacher_id !== $teacher->id) {
            abort(403, 'Akses ditolak.');
        }

        $validated = $request->validated();

        DB::transaction(function () use ($attempt, $validated) {
            foreach ($validated['answers'] as $item) {
                $ans = $attempt->answers()->where('question_id', $item['question_id'])->first();
                if ($ans) {
                    $ans->update([
                        'score' => $item['score'],
                        'feedback' => $item['feedback'] ?? null,
                        'is_correct' => $item['score'] > 0,
                    ]);
                }
            }

            // Hitung total nilai akhir attempt
            $totalScore = $attempt->answers()->sum('score');

            $attempt->update([
                'total_score' => $totalScore,
                'status' => 'graded',
            ]);

            Grade::updateOrCreate(
                [
                    'gradeable_type' => QuizAttempt::class,
                    'gradeable_id' => $attempt->id,
                ],
                [
                    'student_id' => $attempt->student_id,
                    'teacher_subject_id' => $attempt->quiz->teacher_subject_id,
                    'semester_id' => $attempt->quiz->teacherSubject->semester_id,
                    'category' => $attempt->quiz->type === 'exam' ? 'exam' : 'quiz',
                    'score' => $totalScore,
                ]
            );

            ActivityLogger::log('quiz_graded', "Koreksi esai {$attempt->quiz->title} untuk siswa {$attempt->student->user->name} berhasil disimpan.", $attempt);
        });

        return redirect()->route('teacher.grading.index')->with('success', 'Penilaian esai ujian berhasil disimpan.');
    }
}
