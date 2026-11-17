<?php

namespace App\Http\Controllers\Teacher;

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
use Symfony\Component\HttpFoundation\StreamedResponse;

class TeacherGradeController extends Controller
{
    /**
     * Tampilkan tabel rekap nilai siswa per rombel & mapel yang diampu.
     */
    public function index(Request $request): Response
    {
        $teacher = $request->user()->teacher;

        $classes = TeacherSubject::where('teacher_id', $teacher->id)
            ->with(['classroom:id,name,grade_level', 'subject:id,name,code', 'semester:id,name'])
            ->get();

        $selectedId = $request->input('teacher_subject_id', $classes->first()?->id);
        $selectedSubject = $classes->firstWhere('id', $selectedId);

        $recap = $this->buildRecapData($selectedSubject);

        return Inertia::render('Teacher/Grades/Index', [
            'classes' => $classes->map(fn ($ts) => [
                'id' => $ts->id,
                'name' => "{$ts->classroom->name} - {$ts->subject->name}",
            ]),
            'selectedId' => $selectedId,
            'selectedSubject' => $selectedSubject ? [
                'id' => $selectedSubject->id,
                'class_name' => $selectedSubject->classroom->name,
                'subject_name' => $selectedSubject->subject->name,
                'subject_code' => $selectedSubject->subject->code,
                'semester_name' => $selectedSubject->semester?->name,
            ] : null,
            'recap' => $recap,
        ]);
    }

    /**
     * Ekspor data rekap nilai ke format CSV kompatibel Excel (UTF-8 BOM).
     */
    public function exportCsv(Request $request): StreamedResponse
    {
        $teacher = $request->user()->teacher;
        $tsId = $request->teacher_subject_id;
        $selectedSubject = TeacherSubject::where('id', $tsId)
            ->where('teacher_id', $teacher->id)
            ->with(['classroom', 'subject', 'semester'])
            ->firstOrFail();

        $recap = $this->buildRecapData($selectedSubject);

        $className = str_replace(' ', '_', $selectedSubject->classroom->name);
        $subjectCode = $selectedSubject->subject->code;
        $fileName = "Rekap_Nilai_{$className}_{$subjectCode}.csv";

        return response()->streamDownload(function () use ($recap, $selectedSubject) {
            $handle = fopen('php://output', 'w');
            // Tulis UTF-8 BOM agar Excel membukanya dengan encoding yang benar
            fputs($handle, "\xEF\xBB\xBF");

            // Header informasi
            fputcsv($handle, ['REKAP NILAI SISWA SMK AL HIKAM']);
            fputcsv($handle, ['Mata Pelajaran:', $selectedSubject->subject->name . ' (' . $selectedSubject->subject->code . ')']);
            fputcsv($handle, ['Kelas:', $selectedSubject->classroom->name]);
            fputcsv($handle, ['Semester:', $selectedSubject->semester?->name ?? '-']);
            fputcsv($handle, []);

            // Header kolom tabel
            $columns = ['No', 'NIS', 'Nama Siswa'];
            foreach ($recap['assignments'] as $a) {
                $columns[] = 'Tugas: ' . $a['title'];
            }
            $columns[] = 'Rata-rata Tugas';

            foreach ($recap['quizzes'] as $q) {
                $columns[] = ($q['type'] === 'exam' ? 'Ujian: ' : 'Kuis: ') . $q['title'];
            }
            $columns[] = 'Rata-rata Kuis/Ujian';
            $columns[] = 'Nilai Akhir (NA)';
            $columns[] = 'Predikat';
            $columns[] = 'Status';

            fputcsv($handle, $columns);

            // Baris data per siswa
            foreach ($recap['students'] as $idx => $st) {
                $row = [
                    $idx + 1,
                    $st['nis'],
                    $st['name'],
                ];

                foreach ($recap['assignments'] as $a) {
                    $row[] = $st['assignment_scores'][$a['id']] ?? '-';
                }
                $row[] = $st['avg_assignment'] ?? '-';

                foreach ($recap['quizzes'] as $q) {
                    $row[] = $st['quiz_scores'][$q['id']] ?? '-';
                }
                $row[] = $st['avg_quiz'] ?? '-';
                $row[] = $st['final_score'] ?? '-';
                $row[] = $st['predicate'] ?? '-';
                $row[] = $st['status_label'] ?? '-';

                fputcsv($handle, $row);
            }

            fclose($handle);
        }, $fileName, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$fileName}\"",
        ]);
    }

    /**
     * Tampilkan lembar cetak resmi rekap nilai siswa (Print-friendly format).
     */
    public function print(Request $request): Response
    {
        $teacher = $request->user()->teacher;
        $tsId = $request->teacher_subject_id;
        $selectedSubject = TeacherSubject::where('id', $tsId)
            ->where('teacher_id', $teacher->id)
            ->with(['classroom', 'subject', 'semester', 'teacher.user'])
            ->firstOrFail();

        $activeYear = AcademicYear::where('is_active', true)->first();
        $recap = $this->buildRecapData($selectedSubject);

        return Inertia::render('Teacher/Grades/Print', [
            'subject' => [
                'name' => $selectedSubject->subject->name,
                'code' => $selectedSubject->subject->code,
                'class_name' => $selectedSubject->classroom->name,
                'teacher_name' => $selectedSubject->teacher->user->name,
                'teacher_nip' => $selectedSubject->teacher->nip,
                'semester' => $selectedSubject->semester?->name,
                'academic_year' => $activeYear?->name,
            ],
            'recap' => $recap,
        ]);
    }

    /**
     * Susun kalkulasi rekap nilai untuk rombel & mapel.
     *
     * @return array<string, mixed>
     */
    private function buildRecapData(?TeacherSubject $teacherSubject): array
    {
        if (! $teacherSubject) {
            return ['assignments' => [], 'quizzes' => [], 'students' => []];
        }

        $assignments = Assignment::where('teacher_subject_id', $teacherSubject->id)
            ->orderBy('deadline_at')
            ->get(['id', 'title', 'max_score'])
            ->map(fn ($a) => [
                'id' => $a->id,
                'title' => $a->title,
                'max_score' => $a->max_score,
            ])
            ->toArray();

        $quizzes = Quiz::where('teacher_subject_id', $teacherSubject->id)
            ->where('is_published', true)
            ->orderBy('created_at')
            ->get(['id', 'title', 'type'])
            ->map(fn ($q) => [
                'id' => $q->id,
                'title' => $q->title,
                'type' => $q->type,
            ])
            ->toArray();

        $enrollments = $teacherSubject->classroom->enrollments()
            ->with('student.user')
            ->get();

        $assignmentIds = array_column($assignments, 'id');
        $quizIds = array_column($quizzes, 'id');

        $grades = Grade::where('teacher_subject_id', $teacherSubject->id)->get();

        $students = $enrollments->map(function ($en) use ($assignments, $quizzes, $teacherSubject) {
            $student = $en->student;

            // Kumpulkan nilai tugas
            $assignmentScores = [];
            $validAssignmentScores = [];
            foreach ($assignments as $a) {
                $sub = $student->assignmentSubmissions()
                    ->where('assignment_id', $a['id'])
                    ->first();

                if ($sub && $sub->score !== null) {
                    $assignmentScores[$a['id']] = (float) $sub->score;
                    $validAssignmentScores[] = (float) $sub->score;
                } else {
                    $assignmentScores[$a['id']] = null;
                }
            }

            // Kumpulkan nilai kuis/ujian (ambil skor tertinggi jika multi-attempt)
            $quizScores = [];
            $validQuizScores = [];
            foreach ($quizzes as $q) {
                $bestAttempt = $student->quizAttempts()
                    ->where('quiz_id', $q['id'])
                    ->whereNotNull('total_score')
                    ->max('total_score');

                if ($bestAttempt !== null) {
                    $quizScores[$q['id']] = (float) $bestAttempt;
                    $validQuizScores[] = (float) $bestAttempt;
                } else {
                    $quizScores[$q['id']] = null;
                }
            }

            // Rata-rata
            $avgAssignment = count($validAssignmentScores) > 0
                ? round(array_sum($validAssignmentScores) / count($validAssignmentScores), 1)
                : null;

            $avgQuiz = count($validQuizScores) > 0
                ? round(array_sum($validQuizScores) / count($validQuizScores), 1)
                : null;

            // Nilai Akhir (NA): jika ada tugas & kuis, bobot 40% tugas + 60% kuis/ujian
            $finalScore = null;
            if ($avgAssignment !== null && $avgQuiz !== null) {
                $finalScore = round(($avgAssignment * 0.4) + ($avgQuiz * 0.6), 1);
            } elseif ($avgAssignment !== null) {
                $finalScore = $avgAssignment;
            } elseif ($avgQuiz !== null) {
                $finalScore = $avgQuiz;
            }

            // Predikat & KKM (Standar SMK = 75)
            $predicate = '—';
            $statusLabel = '—';
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

                $statusLabel = $finalScore >= 75 ? 'Tuntas' : 'Perlu Remedial';
            }

            return [
                'student_id' => $student->id,
                'nis' => $student->nis,
                'name' => $student->user->name,
                'assignment_scores' => $assignmentScores,
                'quiz_scores' => $quizScores,
                'avg_assignment' => $avgAssignment,
                'avg_quiz' => $avgQuiz,
                'final_score' => $finalScore,
                'predicate' => $predicate,
                'status_label' => $statusLabel,
            ];
        })->sortBy('name')->values()->toArray();

        return [
            'assignments' => $assignments,
            'quizzes' => $quizzes,
            'students' => $students,
        ];
    }
}
