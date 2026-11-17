<?php

namespace App\Http\Controllers\Student;

use App\Enums\QuestionType;
use App\Http\Controllers\Controller;
use App\Models\Question;
use App\Models\Quiz;
use App\Models\QuizAnswer;
use App\Models\QuizAttempt;
use App\Models\TeacherSubject;
use App\Services\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StudentQuizController extends Controller
{
    /**
     * Tampilkan daftar kuis dan ujian yang dapat diikuti siswa.
     */
    public function index(Request $request): Response
    {
        $student = $request->user()->student;

        $enrolledClassIds = $student->enrollments()->pluck('class_id');
        $teacherSubjectIds = TeacherSubject::whereIn('class_id', $enrolledClassIds)->pluck('id');

        $quizzes = Quiz::query()
            ->whereIn('teacher_subject_id', $teacherSubjectIds)
            ->where('is_published', true)
            ->with([
                'teacherSubject.subject:id,code,name',
                'teacherSubject.classroom:id,name',
            ])
            ->withCount('questions')
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($q) use ($student) {
                $attempts = $q->attempts()->where('student_id', $student->id)->get();
                $inProgress = $attempts->firstWhere('status', 'in_progress');
                $bestScore = $attempts->whereNotNull('total_score')->max('total_score');

                $isAvailable = true;
                if ($q->start_at && now()->isBefore($q->start_at)) {
                    $isAvailable = false;
                }
                if ($q->end_at && now()->isAfter($q->end_at)) {
                    $isAvailable = false;
                }

                return [
                    'id' => $q->id,
                    'title' => $q->title,
                    'type' => $q->type,
                    'subject_name' => $q->teacherSubject->subject->name,
                    'class_name' => $q->teacherSubject->classroom->name,
                    'duration_minutes' => $q->duration_minutes,
                    'start_at' => $q->start_at?->format('Y-m-d H:i'),
                    'end_at' => $q->end_at?->format('Y-m-d H:i'),
                    'questions_count' => $q->questions_count,
                    'max_attempts' => $q->max_attempts,
                    'attempts_used' => $attempts->count(),
                    'has_in_progress' => (bool) $inProgress,
                    'in_progress_id' => $inProgress?->id,
                    'best_score' => $bestScore,
                    'is_available' => $isAvailable,
                ];
            });

        return Inertia::render('Student/Quizzes/Index', [
            'quizzes' => $quizzes,
        ]);
    }

    /**
     * Tampilkan halaman petunjuk pengerjaan kuis/ujian.
     */
    public function show(Request $request, Quiz $quiz): Response
    {
        $student = $request->user()->student;

        $isEnrolled = $student->enrollments()
            ->where('class_id', $quiz->teacherSubject->class_id)
            ->exists();

        if (! $isEnrolled || ! $quiz->is_published) {
            abort(403, 'Akses ditolak.');
        }

        $quiz->load([
            'teacherSubject.subject',
            'teacherSubject.classroom',
            'teacherSubject.teacher.user',
        ]);

        $attempts = $quiz->attempts()
            ->where('student_id', $student->id)
            ->orderByDesc('started_at')
            ->get();

        $inProgress = $attempts->firstWhere('status', 'in_progress');

        return Inertia::render('Student/Quizzes/Show', [
            'quiz' => [
                'id' => $quiz->id,
                'title' => $quiz->title,
                'type' => $quiz->type,
                'instructions' => $quiz->instructions,
                'subject_name' => $quiz->teacherSubject->subject->name,
                'teacher_name' => $quiz->teacherSubject->teacher->user->name,
                'duration_minutes' => $quiz->duration_minutes,
                'start_at' => $quiz->start_at?->format('Y-m-d H:i'),
                'end_at' => $quiz->end_at?->format('Y-m-d H:i'),
                'questions_count' => $quiz->questions()->count(),
                'max_attempts' => $quiz->max_attempts,
                'attempts_used' => $attempts->count(),
                'has_in_progress' => (bool) $inProgress,
                'in_progress_id' => $inProgress?->id,
            ],
            'attempts' => $attempts->map(fn ($a) => [
                'id' => $a->id,
                'started_at' => $a->started_at->format('Y-m-d H:i'),
                'finished_at' => $a->finished_at?->format('Y-m-d H:i'),
                'status' => $a->status,
                'total_score' => $a->total_score,
            ]),
        ]);
    }

    /**
     * Mulai pengerjaan kuis / ujian.
     */
    public function start(Request $request, Quiz $quiz): RedirectResponse
    {
        $student = $request->user()->student;

        $isEnrolled = $student->enrollments()
            ->where('class_id', $quiz->teacherSubject->class_id)
            ->exists();

        if (! $isEnrolled || ! $quiz->is_published) {
            abort(403, 'Akses ditolak.');
        }

        // Cek apakah ada attempt yang masih berjalan
        $activeAttempt = $quiz->attempts()
            ->where('student_id', $student->id)
            ->where('status', 'in_progress')
            ->first();

        if ($activeAttempt) {
            return redirect()->route('student.attempts.show', $activeAttempt->id);
        }

        // Cek kuota kesempatan mencoba
        $usedAttempts = $quiz->attempts()->where('student_id', $student->id)->count();
        if ($usedAttempts >= $quiz->max_attempts) {
            return redirect()->back()->with('error', 'Anda telah mencapai batas maksimal kesempatan pengerjaan.');
        }

        // Atur urutan soal
        $questions = $quiz->questions()->get(['questions.id', 'quiz_questions.sort_order']);
        if ($quiz->shuffle_questions) {
            $questionOrder = $questions->pluck('id')->shuffle()->values()->toArray();
        } else {
            $questionOrder = $questions->sortBy('sort_order')->pluck('id')->values()->toArray();
        }

        $attempt = QuizAttempt::create([
            'quiz_id' => $quiz->id,
            'student_id' => $student->id,
            'started_at' => now(),
            'status' => 'in_progress',
            'question_order' => $questionOrder,
            'ip_address' => $request->ip(),
        ]);

        ActivityLogger::log('quiz_started', "Memulai pengerjaan {$quiz->type}: {$quiz->title}", $quiz);

        return redirect()->route('student.attempts.show', $attempt->id);
    }

    /**
     * Halaman pengerjaan ujian yang fokus (distraction-free testing layout).
     */
    public function attempt(Request $request, QuizAttempt $attempt): Response|RedirectResponse
    {
        $student = $request->user()->student;

        if ($attempt->student_id !== $student->id) {
            abort(403, 'Akses ditolak.');
        }

        if ($attempt->status !== 'in_progress') {
            return redirect()->route('student.attempts.result', $attempt->id);
        }

        // Cek durasi habis
        $endTime = $attempt->started_at->copy()->addMinutes($attempt->quiz->duration_minutes);
        if (now()->isAfter($endTime->addMinute())) {
            $this->finalizeAttempt($attempt);

            return redirect()->route('student.attempts.result', $attempt->id)->with('info', 'Waktu ujian telah berakhir.');
        }

        $quiz = $attempt->quiz;
        $order = $attempt->question_order ?? [];

        // Ambil soal sesuai urutan attempt
        $questions = Question::whereIn('id', $order)
            ->with('options')
            ->get()
            ->sortBy(fn ($q) => array_search($q->id, $order, true))
            ->values()
            ->map(function ($q) use ($quiz) {
                $options = $q->options;
                if ($quiz->shuffle_options) {
                    $options = $options->shuffle();
                }

                return [
                    'id' => $q->id,
                    'type' => $q->type->value,
                    'type_label' => $q->type->label(),
                    'body' => $q->body,
                    'options' => $options->map(fn ($o) => [
                        'id' => $o->id,
                        'label' => $o->label,
                        'body' => $o->body,
                    ]),
                ];
            });

        // Jawaban yang tersimpan
        $savedAnswers = $attempt->answers->keyBy('question_id')->map(fn ($a) => [
            'option_id' => $a->option_id,
            'answer_text' => $a->answer_text,
        ]);

        return Inertia::render('Student/Quizzes/Attempt', [
            'attempt' => [
                'id' => $attempt->id,
                'quiz_id' => $quiz->id,
                'quiz_title' => $quiz->title,
                'type' => $quiz->type,
                'started_at' => $attempt->started_at->toISOString(),
                'duration_seconds' => $quiz->duration_minutes * 60,
                'remaining_seconds' => max(0, $endTime->diffInSeconds(now())),
            ],
            'questions' => $questions,
            'savedAnswers' => $savedAnswers,
        ]);
    }

    /**
     * Simpan jawaban secara otomatis per nomor soal.
     */
    public function saveAnswer(Request $request, QuizAttempt $attempt): JsonResponse
    {
        $student = $request->user()->student;

        if ($attempt->student_id !== $student->id || $attempt->status !== 'in_progress') {
            return response()->json(['error' => 'Akses ditolak atau ujian sudah selesai'], 403);
        }

        $validated = $request->validate([
            'question_id' => ['required', 'exists:questions,id'],
            'option_id' => ['nullable', 'exists:question_options,id'],
            'answer_text' => ['nullable', 'string', 'max:5000'],
        ]);

        QuizAnswer::updateOrCreate(
            [
                'quiz_attempt_id' => $attempt->id,
                'question_id' => $validated['question_id'],
            ],
            [
                'option_id' => $validated['option_id'] ?? null,
                'answer_text' => $validated['answer_text'] ?? null,
            ]
        );

        return response()->json(['status' => 'saved']);
    }

    /**
     * Selesaikan ujian dan hitung nilai otomatis.
     */
    public function finish(Request $request, QuizAttempt $attempt): RedirectResponse
    {
        $student = $request->user()->student;

        if ($attempt->student_id !== $student->id) {
            abort(403, 'Akses ditolak.');
        }

        if ($attempt->status === 'in_progress') {
            $this->finalizeAttempt($attempt);
        }

        return redirect()->route('student.attempts.result', $attempt->id)->with('success', 'Ujian berhasil diselesaikan.');
    }

    /**
     * Tampilkan hasil pengerjaan kuis.
     */
    public function result(Request $request, QuizAttempt $attempt): Response
    {
        $student = $request->user()->student;

        if ($attempt->student_id !== $student->id) {
            abort(403, 'Akses ditolak.');
        }

        $attempt->load([
            'quiz.teacherSubject.subject',
            'answers.question.options',
            'answers.option',
        ]);

        $quiz = $attempt->quiz;

        $review = null;
        if ($quiz->show_result) {
            $review = $attempt->answers->map(function ($ans) {
                return [
                    'question_body' => $ans->question->body,
                    'question_type' => $ans->question->type->label(),
                    'your_answer' => $ans->option ? $ans->option->body : $ans->answer_text,
                    'is_correct' => $ans->is_correct,
                    'score' => $ans->score,
                    'feedback' => $ans->feedback,
                    'explanation' => $ans->question->explanation,
                ];
            });
        }

        return Inertia::render('Student/Quizzes/Result', [
            'attempt' => [
                'id' => $attempt->id,
                'quiz_title' => $quiz->title,
                'subject_name' => $quiz->teacherSubject->subject->name,
                'status' => $attempt->status,
                'started_at' => $attempt->started_at->format('Y-m-d H:i'),
                'finished_at' => $attempt->finished_at?->format('Y-m-d H:i'),
                'auto_score' => $attempt->auto_score,
                'total_score' => $attempt->total_score,
                'show_result' => (bool) $quiz->show_result,
            ],
            'review' => $review,
        ]);
    }

    /**
     * Logika penilaian otomatis untuk butir soal objektif.
     */
    private function finalizeAttempt(QuizAttempt $attempt): void
    {
        $quiz = $attempt->quiz;
        $quizQuestions = $quiz->questions()->with('options')->get();

        $autoScore = 0;
        $hasEssay = false;

        foreach ($quizQuestions as $question) {
            $points = (float) ($question->pivot->points ?? $question->default_points);
            $answer = $attempt->answers()->where('question_id', $question->id)->first();

            if ($question->type === QuestionType::Essay) {
                $hasEssay = true;
                if ($answer) {
                    $answer->update(['is_correct' => null, 'score' => null]);
                }
                continue;
            }

            $isCorrect = false;

            if (in_array($question->type, [QuestionType::MultipleChoice, QuestionType::TrueFalse])) {
                if ($answer && $answer->option_id) {
                    $chosenOption = $question->options->firstWhere('id', $answer->option_id);
                    if ($chosenOption && $chosenOption->is_correct) {
                        $isCorrect = true;
                    }
                }
            } elseif ($question->type === QuestionType::ShortAnswer) {
                if ($answer && ! empty($answer->answer_text) && ! empty($question->answer_key)) {
                    $normalizedUser = trim(mb_strtolower($answer->answer_text));
                    $normalizedKey = trim(mb_strtolower($question->answer_key));
                    if ($normalizedUser === $normalizedKey) {
                        $isCorrect = true;
                    }
                }
            }

            $earnedPoints = $isCorrect ? $points : 0;
            $autoScore += $earnedPoints;

            if ($answer) {
                $answer->update([
                    'is_correct' => $isCorrect,
                    'score' => $earnedPoints,
                ]);
            }
        }

        $attempt->update([
            'finished_at' => now(),
            'auto_score' => $autoScore,
            'total_score' => $hasEssay ? null : $autoScore,
            'status' => $hasEssay ? 'submitted' : 'graded',
        ]);

        ActivityLogger::log('quiz_finished', "Menyelesaikan ujian {$quiz->title} dengan skor {$autoScore}", $attempt);
    }
}
