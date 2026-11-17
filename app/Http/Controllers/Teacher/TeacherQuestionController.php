<?php

namespace App\Http\Controllers\Teacher;

use App\Enums\QuestionType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Teacher\QuestionRequest;
use App\Models\Question;
use App\Models\Subject;
use App\Models\TeacherSubject;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class TeacherQuestionController extends Controller
{
    /**
     * Tampilkan bank soal milik guru.
     */
    public function index(Request $request): Response
    {
        $teacher = $request->user()->teacher;

        $subjectIds = TeacherSubject::where('teacher_id', $teacher->id)
            ->distinct()
            ->pluck('subject_id');

        $query = Question::query()
            ->where('teacher_id', $teacher->id)
            ->with(['subject:id,code,name', 'options']);

        if ($request->filled('subject_id') && $request->subject_id !== 'all') {
            $query->where('subject_id', $request->subject_id);
        }

        if ($request->filled('type') && $request->type !== 'all') {
            $query->where('type', $request->type);
        }

        $questions = $query->orderByDesc('created_at')->get();

        $subjects = Subject::whereIn('id', $subjectIds)->orderBy('name')->get(['id', 'code', 'name']);

        return Inertia::render('Teacher/Questions/Index', [
            'questions' => $questions,
            'subjects' => $subjects,
            'filters' => [
                'subject_id' => $request->subject_id ?? 'all',
                'type' => $request->type ?? 'all',
            ],
        ]);
    }

    /**
     * Simpan soal baru ke bank soal.
     */
    public function store(QuestionRequest $request): RedirectResponse
    {
        $teacher = $request->user()->teacher;
        $data = $request->validated();

        DB::transaction(function () use ($teacher, $data) {
            $question = Question::create([
                'subject_id' => $data['subject_id'],
                'teacher_id' => $teacher->id,
                'type' => $data['type'],
                'body' => $data['body'],
                'answer_key' => $data['answer_key'] ?? null,
                'default_points' => $data['default_points'] ?? 1,
                'explanation' => $data['explanation'] ?? null,
            ]);

            // Buat pilihan jawaban untuk Multiple Choice atau True/False
            if (in_array($question->type, [QuestionType::MultipleChoice, QuestionType::TrueFalse])) {
                $labels = ['A', 'B', 'C', 'D', 'E'];
                foreach ($data['options'] ?? [] as $idx => $opt) {
                    if (! empty($opt['body'])) {
                        $question->options()->create([
                            'label' => $labels[$idx] ?? (string) ($idx + 1),
                            'body' => $opt['body'],
                            'is_correct' => (bool) ($opt['is_correct'] ?? false),
                        ]);
                    }
                }
            }

            ActivityLogger::log('question_created', 'Menambahkan soal ke bank soal', $question);
        });

        return redirect()->back()->with('success', 'Soal berhasil disimpan ke bank soal.');
    }

    /**
     * Perbarui butir soal.
     */
    public function update(QuestionRequest $request, Question $question): RedirectResponse
    {
        $teacher = $request->user()->teacher;

        if ($question->teacher_id !== $teacher->id) {
            abort(403, 'Akses ditolak.');
        }

        $data = $request->validated();

        DB::transaction(function () use ($question, $data) {
            $question->update([
                'subject_id' => $data['subject_id'],
                'type' => $data['type'],
                'body' => $data['body'],
                'answer_key' => $data['answer_key'] ?? null,
                'default_points' => $data['default_points'] ?? 1,
                'explanation' => $data['explanation'] ?? null,
            ]);

            // Re-create pilihan jawaban jika ada
            if (in_array($question->type, [QuestionType::MultipleChoice, QuestionType::TrueFalse])) {
                $question->options()->delete();
                $labels = ['A', 'B', 'C', 'D', 'E'];
                foreach ($data['options'] ?? [] as $idx => $opt) {
                    if (! empty($opt['body'])) {
                        $question->options()->create([
                            'label' => $labels[$idx] ?? (string) ($idx + 1),
                            'body' => $opt['body'],
                            'is_correct' => (bool) ($opt['is_correct'] ?? false),
                        ]);
                    }
                }
            }
        });

        return redirect()->back()->with('success', 'Soal berhasil diperbarui.');
    }

    /**
     * Hapus butir soal.
     */
    public function destroy(Request $request, Question $question): RedirectResponse
    {
        $teacher = $request->user()->teacher;

        if ($question->teacher_id !== $teacher->id) {
            abort(403, 'Akses ditolak.');
        }

        $question->delete();

        return redirect()->back()->with('success', 'Soal berhasil dihapus dari bank soal.');
    }
}
