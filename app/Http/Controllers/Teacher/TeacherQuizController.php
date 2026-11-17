<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Http\Requests\Teacher\QuizRequest;
use App\Models\Question;
use App\Models\Quiz;
use App\Models\TeacherSubject;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TeacherQuizController extends Controller
{
    /**
     * Tampilkan daftar kuis dan ujian yang dibuat guru.
     */
    public function index(Request $request): Response
    {
        $teacher = $request->user()->teacher;

        $teacherSubjectIds = TeacherSubject::where('teacher_id', $teacher->id)->pluck('id');

        $query = Quiz::query()
            ->whereIn('teacher_subject_id', $teacherSubjectIds)
            ->with([
                'teacherSubject.classroom:id,name,grade_level',
                'teacherSubject.subject:id,code,name',
            ])
            ->withCount(['questions', 'attempts']);

        if ($request->filled('teacher_subject_id') && $request->teacher_subject_id !== 'all') {
            $query->where('teacher_subject_id', $request->teacher_subject_id);
        }

        $quizzes = $query->orderByDesc('created_at')->get();

        $classes = TeacherSubject::where('teacher_id', $teacher->id)
            ->with(['classroom:id,name', 'subject:id,name,code'])
            ->get()
            ->map(fn ($ts) => [
                'id' => $ts->id,
                'name' => "{$ts->classroom->name} - {$ts->subject->name}",
            ]);

        return Inertia::render('Teacher/Quizzes/Index', [
            'quizzes' => $quizzes,
            'classes' => $classes,
            'filters' => [
                'teacher_subject_id' => $request->teacher_subject_id ?? 'all',
            ],
        ]);
    }

    /**
     * Tampilkan detail kuis, soal-soal di dalamnya, dan hasil pengerjaan siswa.
     */
    public function show(Request $request, Quiz $quiz): Response
    {
        $teacher = $request->user()->teacher;

        if ($quiz->teacherSubject->teacher_id !== $teacher->id) {
            abort(403, 'Akses ditolak.');
        }

        $quiz->load([
            'teacherSubject.classroom',
            'teacherSubject.subject',
            'questions.options',
            'attempts.student.user',
        ]);

        // Soal dari bank soal untuk mapel ini yang belum dimasukkan ke kuis
        $existingQuestionIds = $quiz->questions->pluck('id');
        $availableQuestions = Question::query()
            ->where('subject_id', $quiz->teacherSubject->subject_id)
            ->where('teacher_id', $teacher->id)
            ->whereNotIn('id', $existingQuestionIds)
            ->with('options')
            ->get();

        return Inertia::render('Teacher/Quizzes/Show', [
            'quiz' => $quiz,
            'availableQuestions' => $availableQuestions,
        ]);
    }

    /**
     * Simpan kuis atau ujian baru.
     */
    public function store(QuizRequest $request): RedirectResponse
    {
        $teacher = $request->user()->teacher;
        $data = $request->validated();

        $ownsSubject = TeacherSubject::where('id', $data['teacher_subject_id'])
            ->where('teacher_id', $teacher->id)
            ->exists();

        if (! $ownsSubject) {
            abort(403, 'Akses ditolak.');
        }

        $quiz = Quiz::create([
            'teacher_subject_id' => $data['teacher_subject_id'],
            'title' => $data['title'],
            'type' => $data['type'],
            'instructions' => $data['instructions'] ?? null,
            'start_at' => $data['start_at'] ?? null,
            'end_at' => $data['end_at'] ?? null,
            'duration_minutes' => $data['duration_minutes'] ?? 60,
            'shuffle_questions' => $request->boolean('shuffle_questions', false),
            'shuffle_options' => $request->boolean('shuffle_options', false),
            'max_attempts' => $data['max_attempts'] ?? 1,
            'show_result' => $request->boolean('show_result', true),
            'is_published' => $request->boolean('is_published', false),
        ]);

        ActivityLogger::log('quiz_created', "Membuat {$quiz->type}: {$quiz->title}", $quiz);

        return redirect()->back()->with('success', "{$quiz->title} berhasil dibuat.");
    }

    /**
     * Perbarui data kuis atau ujian.
     */
    public function update(QuizRequest $request, Quiz $quiz): RedirectResponse
    {
        $teacher = $request->user()->teacher;

        if ($quiz->teacherSubject->teacher_id !== $teacher->id) {
            abort(403, 'Akses ditolak.');
        }

        $data = $request->validated();

        $quiz->update([
            'title' => $data['title'],
            'type' => $data['type'],
            'instructions' => $data['instructions'] ?? null,
            'start_at' => $data['start_at'] ?? null,
            'end_at' => $data['end_at'] ?? null,
            'duration_minutes' => $data['duration_minutes'] ?? 60,
            'shuffle_questions' => $request->boolean('shuffle_questions', false),
            'shuffle_options' => $request->boolean('shuffle_options', false),
            'max_attempts' => $data['max_attempts'] ?? 1,
            'show_result' => $request->boolean('show_result', true),
            'is_published' => $request->boolean('is_published', false),
        ]);

        ActivityLogger::log('quiz_updated', "Memperbarui {$quiz->type}: {$quiz->title}", $quiz);

        return redirect()->back()->with('success', "{$quiz->title} berhasil diperbarui.");
    }

    /**
     * Hapus kuis atau ujian.
     */
    public function destroy(Request $request, Quiz $quiz): RedirectResponse
    {
        $teacher = $request->user()->teacher;

        if ($quiz->teacherSubject->teacher_id !== $teacher->id) {
            abort(403, 'Akses ditolak.');
        }

        $title = $quiz->title;
        $quiz->delete();

        ActivityLogger::log('quiz_deleted', "Menghapus kuis: {$title}", $quiz);

        return redirect()->back()->with('success', "{$title} berhasil dihapus.");
    }

    /**
     * Masukkan butir-butir soal dari bank soal ke dalam kuis.
     */
    public function addQuestions(Request $request, Quiz $quiz): RedirectResponse
    {
        $teacher = $request->user()->teacher;

        if ($quiz->teacherSubject->teacher_id !== $teacher->id) {
            abort(403, 'Akses ditolak.');
        }

        $validated = $request->validate([
            'question_ids' => ['required', 'array'],
            'question_ids.*' => ['exists:questions,id'],
            'points' => ['nullable', 'numeric', 'min:1'],
        ]);

        $defaultPoints = $validated['points'] ?? 10;
        $currentMaxOrder = $quiz->questions()->max('quiz_questions.sort_order') ?? 0;

        foreach ($validated['question_ids'] as $idx => $qId) {
            $quiz->questions()->syncWithoutDetaching([
                $qId => [
                    'points' => $defaultPoints,
                    'sort_order' => $currentMaxOrder + $idx + 1,
                ],
            ]);
        }

        return redirect()->back()->with('success', count($validated['question_ids']) . ' soal berhasil ditambahkan ke kuis.');
    }

    /**
     * Hapus butir soal dari kuis.
     */
    public function removeQuestion(Request $request, Quiz $quiz, Question $question): RedirectResponse
    {
        $teacher = $request->user()->teacher;

        if ($quiz->teacherSubject->teacher_id !== $teacher->id) {
            abort(403, 'Akses ditolak.');
        }

        $quiz->questions()->detach($question->id);

        return redirect()->back()->with('success', 'Soal berhasil dikeluarkan dari kuis.');
    }
}
