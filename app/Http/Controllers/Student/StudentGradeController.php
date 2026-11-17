<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use App\Models\Assignment;
use App\Models\Grade;
use App\Models\Quiz;
use App\Models\Semester;
use App\Models\TeacherSubject;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StudentGradeController extends Controller
{
    /**
     * Tampilkan transkrip rekap nilai siswa pada semester aktif.
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

        $subjectsData = [];
        if ($enrollment && $activeSemester) {
            $teacherSubjects = TeacherSubject::where('class_id', $enrollment->class_id)
                ->where('semester_id', $activeSemester->id)
                ->with(['subject', 'teacher.user'])
                ->get();

            foreach ($teacherSubjects as $ts) {
                // Ambil semua tugas untuk mapel ini
                $assignments = Assignment::where('teacher_subject_id', $ts->id)->get();
                $assignmentScores = [];
                foreach ($assignments as $a) {
                    $sub = $student->assignmentSubmissions()->where('assignment_id', $a->id)->first();
                    if ($sub && $sub->score !== null) {
                        $assignmentScores[] = (float) $sub->score;
                    }
                }

                // Ambil semua kuis untuk mapel ini
                $quizzes = Quiz::where('teacher_subject_id', $ts->id)->where('is_published', true)->get();
                $quizScores = [];
                foreach ($quizzes as $q) {
                    $best = $student->quizAttempts()
                        ->where('quiz_id', $q->id)
                        ->whereNotNull('total_score')
                        ->max('total_score');
                    if ($best !== null) {
                        $quizScores[] = (float) $best;
                    }
                }

                $avgAssignment = count($assignmentScores) > 0
                    ? round(array_sum($assignmentScores) / count($assignmentScores), 1)
                    : null;

                $avgQuiz = count($quizScores) > 0
                    ? round(array_sum($quizScores) / count($quizScores), 1)
                    : null;

                $finalScore = null;
                if ($avgAssignment !== null && $avgQuiz !== null) {
                    $finalScore = round(($avgAssignment * 0.4) + ($avgQuiz * 0.6), 1);
                } elseif ($avgAssignment !== null) {
                    $finalScore = $avgAssignment;
                } elseif ($avgQuiz !== null) {
                    $finalScore = $avgQuiz;
                }

                $predicate = '—';
                $isPassed = false;
                if ($finalScore !== null) {
                    if ($finalScore >= 90) {
                        $predicate = 'A';
                    } elseif ($finalScore >= 80) {
                        $predicate = 'B';
                    } elseif ($finalScore >= 75) {
                        $predicate = 'C';
                    } else {
                        $predicate = 'D';
                    }
                    $isPassed = $finalScore >= 75;
                }

                $subjectsData[] = [
                    'id' => $ts->id,
                    'subject_name' => $ts->subject->name,
                    'subject_code' => $ts->subject->code,
                    'teacher_name' => $ts->teacher->user->name,
                    'assignments_count' => $assignments->count(),
                    'graded_assignments_count' => count($assignmentScores),
                    'avg_assignment' => $avgAssignment,
                    'quizzes_count' => $quizzes->count(),
                    'completed_quizzes_count' => count($quizScores),
                    'avg_quiz' => $avgQuiz,
                    'final_score' => $finalScore,
                    'predicate' => $predicate,
                    'is_passed' => $isPassed,
                ];
            }
        }

        // Rata-rata keseluruhan (IP / Rata-rata Nilai Rapor)
        $validFinalScores = array_filter(array_column($subjectsData, 'final_score'), fn ($s) => $s !== null);
        $overallGpa = count($validFinalScores) > 0
            ? round(array_sum($validFinalScores) / count($validFinalScores), 1)
            : null;

        return Inertia::render('Student/Grades/Index', [
            'classroom' => $enrollment?->classroom ? [
                'name' => $enrollment->classroom->name,
                'grade_level' => $enrollment->classroom->grade_level,
                'department' => $enrollment->classroom->department?->name,
            ] : null,
            'activeSemester' => $activeSemester?->name,
            'activeYear' => $activeYear?->name,
            'subjects' => $subjectsData,
            'overallGpa' => $overallGpa,
        ]);
    }

    /**
     * Cetak Lembar Hasil Belajar (LHB) siswa.
     */
    public function print(Request $request): Response
    {
        $student = $request->user()->student;
        $activeYear = AcademicYear::where('is_active', true)->first();
        $activeSemester = Semester::where('is_active', true)->first();

        $enrollment = $student->enrollments()
            ->where('academic_year_id', $activeYear?->id ?? 0)
            ->with(['classroom.department'])
            ->first();

        $subjectsData = [];
        if ($enrollment && $activeSemester) {
            $teacherSubjects = TeacherSubject::where('class_id', $enrollment->class_id)
                ->where('semester_id', $activeSemester->id)
                ->with(['subject', 'teacher.user'])
                ->get();

            foreach ($teacherSubjects as $ts) {
                $assignmentScores = $student->assignmentSubmissions()
                    ->whereHas('assignment', fn ($q) => $q->where('teacher_subject_id', $ts->id))
                    ->whereNotNull('score')
                    ->pluck('score')
                    ->map(fn ($s) => (float) $s)
                    ->toArray();

                $quizScores = [];
                $quizzes = Quiz::where('teacher_subject_id', $ts->id)->where('is_published', true)->get();
                foreach ($quizzes as $q) {
                    $best = $student->quizAttempts()
                        ->where('quiz_id', $q->id)
                        ->whereNotNull('total_score')
                        ->max('total_score');
                    if ($best !== null) {
                        $quizScores[] = (float) $best;
                    }
                }

                $avgAssignment = count($assignmentScores) > 0 ? round(array_sum($assignmentScores) / count($assignmentScores), 1) : null;
                $avgQuiz = count($quizScores) > 0 ? round(array_sum($quizScores) / count($quizScores), 1) : null;

                $finalScore = null;
                if ($avgAssignment !== null && $avgQuiz !== null) {
                    $finalScore = round(($avgAssignment * 0.4) + ($avgQuiz * 0.6), 1);
                } elseif ($avgAssignment !== null) {
                    $finalScore = $avgAssignment;
                } elseif ($avgQuiz !== null) {
                    $finalScore = $avgQuiz;
                }

                $predicate = '—';
                if ($finalScore !== null) {
                    if ($finalScore >= 90) {
                        $predicate = 'A';
                    } elseif ($finalScore >= 80) {
                        $predicate = 'B';
                    } elseif ($finalScore >= 75) {
                        $predicate = 'C';
                    } else {
                        $predicate = 'D';
                    }
                }

                $subjectsData[] = [
                    'subject_name' => $ts->subject->name,
                    'subject_code' => $ts->subject->code,
                    'teacher_name' => $ts->teacher->user->name,
                    'avg_assignment' => $avgAssignment,
                    'avg_quiz' => $avgQuiz,
                    'final_score' => $finalScore,
                    'predicate' => $predicate,
                    'status' => ($finalScore && $finalScore >= 75) ? 'Tuntas' : 'Perlu Remedial',
                ];
            }
        }

        $validFinalScores = array_filter(array_column($subjectsData, 'final_score'), fn ($s) => $s !== null);
        $overallGpa = count($validFinalScores) > 0
            ? round(array_sum($validFinalScores) / count($validFinalScores), 1)
            : null;

        return Inertia::render('Student/Grades/Print', [
            'student' => [
                'name' => $student->user->name,
                'nis' => $student->nis,
                'nisn' => $student->nisn,
                'class_name' => $enrollment?->classroom?->name,
                'department_name' => $enrollment?->classroom?->department?->name,
            ],
            'semester' => $activeSemester?->name,
            'academic_year' => $activeYear?->name,
            'subjects' => $subjectsData,
            'overallGpa' => $overallGpa,
        ]);
    }
}
