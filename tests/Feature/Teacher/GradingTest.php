<?php

namespace Tests\Feature\Teacher;

use App\Enums\QuestionType;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\Grade;
use App\Models\Question;
use App\Models\Quiz;
use App\Models\QuizAnswer;
use App\Models\QuizAttempt;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\TeacherSubject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class GradingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
        $this->seed();
    }

    private function teacher(string $username = 'guru01'): static
    {
        return $this->actingAs(User::where('username', $username)->firstOrFail());
    }

    public function test_guru_bisa_melihat_antrean_koreksi(): void
    {
        $this->teacher()->get('/teacher/grading')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Teacher/Grading/Index')
                ->has('assignmentSubmissions')
                ->has('quizAttempts')
                ->has('classes')
                ->has('filters'));
    }

    public function test_guru_bisa_menilai_tugas_siswa_dan_tersinkron_ke_tabel_grades(): void
    {
        $guru = User::where('username', 'guru01')->firstOrFail();
        $teacher = $guru->teacher;

        $ts = TeacherSubject::where('teacher_id', $teacher->id)->firstOrFail();
        $assignment = Assignment::create([
            'teacher_subject_id' => $ts->id,
            'title' => 'Tugas Praktikum 1',
            'deadline_at' => now()->addDays(7),
            'max_score' => 100,
        ]);

        $student = Student::firstOrFail();
        $submission = AssignmentSubmission::create([
            'assignment_id' => $assignment->id,
            'student_id' => $student->id,
            'submitted_at' => now(),
            'notes' => 'Berikut jawaban saya pak.',
        ]);

        $response = $this->teacher('guru01')->post("/teacher/grading/assignment/{$submission->id}", [
            'score' => 92.5,
            'feedback' => 'Hasil pekerjaan sangat baik dan terstruktur.',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('assignment_submissions', [
            'id' => $submission->id,
            'score' => 92.5,
            'feedback' => 'Hasil pekerjaan sangat baik dan terstruktur.',
        ]);

        $this->assertDatabaseHas('grades', [
            'student_id' => $student->id,
            'teacher_subject_id' => $ts->id,
            'category' => 'assignment',
            'score' => 92.5,
        ]);
    }

    public function test_guru_tidak_bisa_menilai_tugas_kelas_guru_lain(): void
    {
        $guru02 = User::where('username', 'guru02')->firstOrFail();
        $ts02 = TeacherSubject::where('teacher_id', $guru02->teacher->id)->firstOrFail();

        $assignment = Assignment::create([
            'teacher_subject_id' => $ts02->id,
            'title' => 'Tugas Guru Lain',
            'deadline_at' => now()->addDays(7),
            'max_score' => 100,
        ]);

        $student = Student::firstOrFail();
        $submission = AssignmentSubmission::create([
            'assignment_id' => $assignment->id,
            'student_id' => $student->id,
            'submitted_at' => now(),
        ]);

        // Guru 01 mencoba menilai tugas kelas Guru 02
        $response = $this->teacher('guru01')->post("/teacher/grading/assignment/{$submission->id}", [
            'score' => 80,
        ]);

        $response->assertForbidden();
    }

    public function test_guru_bisa_menilai_esai_kuis_dan_menghitung_total_skor(): void
    {
        $guru = User::where('username', 'guru01')->firstOrFail();
        $teacher = $guru->teacher;

        $ts = TeacherSubject::where('teacher_id', $teacher->id)->firstOrFail();
        $quiz = Quiz::create([
            'teacher_subject_id' => $ts->id,
            'title' => 'Ujian Akhir Semester',
            'type' => 'exam',
            'is_published' => true,
        ]);

        $essayQuestion = Question::create([
            'teacher_id' => $teacher->id,
            'subject_id' => $ts->subject_id,
            'type' => QuestionType::Essay,
            'body' => 'Jelaskan perbedaan TCP dan UDP!',
            'default_points' => 30,
        ]);

        $quiz->questions()->attach($essayQuestion->id, ['points' => 30, 'sort_order' => 1]);

        $student = Student::firstOrFail();
        $attempt = QuizAttempt::create([
            'quiz_id' => $quiz->id,
            'student_id' => $student->id,
            'started_at' => now()->subMinutes(40),
            'finished_at' => now(),
            'status' => 'submitted',
            'auto_score' => 50, // Nilai pilihan ganda
        ]);

        QuizAnswer::create([
            'quiz_attempt_id' => $attempt->id,
            'question_id' => $essayQuestion->id,
            'answer_text' => 'TCP connection-oriented, sedangkan UDP connectionless.',
            'score' => null,
        ]);

        // Akses halaman koreksi esai
        $this->teacher('guru01')->get("/teacher/grading/quiz-attempt/{$attempt->id}")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Teacher/Grading/QuizAttempt')
                ->has('attempt')
                ->has('answers'));

        // Simpan nilai esai
        $response = $this->teacher('guru01')->post("/teacher/grading/quiz-attempt/{$attempt->id}", [
            'answers' => [
                [
                    'question_id' => $essayQuestion->id,
                    'score' => 28,
                    'feedback' => 'Penjelasan tepat dan lengkap.',
                ],
            ],
        ]);

        $response->assertRedirect('/teacher/grading');

        $this->assertDatabaseHas('quiz_attempts', [
            'id' => $attempt->id,
            'status' => 'graded',
            'total_score' => 28, // sum of answers
        ]);

        $this->assertDatabaseHas('grades', [
            'student_id' => $student->id,
            'category' => 'exam',
            'score' => 28,
        ]);
    }
}
