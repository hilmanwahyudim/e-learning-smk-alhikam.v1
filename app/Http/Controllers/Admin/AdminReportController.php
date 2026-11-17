<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use App\Models\Classroom;
use App\Models\Grade;
use App\Models\Semester;
use App\Models\TeacherSubject;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminReportController extends Controller
{
    /**
     * Tampilkan rekapitulasi laporan nilai akademik sekolah.
     */
    public function index(Request $request): Response
    {
        $activeYear = AcademicYear::where('is_active', true)->first();
        $activeSemester = Semester::where('is_active', true)->first();

        $classes = Classroom::with('department')->orderBy('name')->get();

        $selectedClassId = $request->input('class_id', $classes->first()?->id);
        $selectedClass = $classes->firstWhere('id', $selectedClassId);

        $reportData = [];
        if ($selectedClass && $activeSemester) {
            $teacherSubjects = TeacherSubject::where('class_id', $selectedClass->id)
                ->where('semester_id', $activeSemester->id)
                ->with(['subject', 'teacher.user'])
                ->get();

            foreach ($teacherSubjects as $ts) {
                $grades = Grade::where('teacher_subject_id', $ts->id)->get();
                $avgScore = $grades->count() > 0 ? round($grades->avg('score'), 1) : null;
                $passedCount = $grades->where('score', '>=', 75)->count();
                $totalGrades = $grades->count();
                $passRate = $totalGrades > 0 ? round(($passedCount / $totalGrades) * 100) : 0;

                $reportData[] = [
                    'id' => $ts->id,
                    'subject_name' => $ts->subject->name,
                    'subject_code' => $ts->subject->code,
                    'teacher_name' => $ts->teacher->user->name,
                    'total_entries' => $totalGrades,
                    'average_score' => $avgScore,
                    'pass_rate' => $passRate,
                ];
            }
        }

        return Inertia::render('Admin/Reports/Index', [
            'classes' => $classes->map(fn ($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'department' => $c->department?->name,
            ]),
            'selectedClassId' => $selectedClassId,
            'selectedClass' => $selectedClass ? [
                'id' => $selectedClass->id,
                'name' => $selectedClass->name,
                'department' => $selectedClass->department?->name,
            ] : null,
            'activeSemester' => $activeSemester?->name,
            'activeYear' => $activeYear?->name,
            'reports' => $reportData,
        ]);
    }

    /**
     * Ekspor laporan ringkasan nilai ke CSV.
     */
    public function exportCsv(Request $request): StreamedResponse
    {
        $activeSemester = Semester::where('is_active', true)->first();
        $classId = $request->class_id;
        $classroom = Classroom::findOrFail($classId);

        $teacherSubjects = TeacherSubject::where('class_id', $classroom->id)
            ->where('semester_id', $activeSemester?->id ?? 0)
            ->with(['subject', 'teacher.user'])
            ->get();

        $fileName = "Laporan_Nilai_Kelas_{$classroom->name}.csv";

        return response()->streamDownload(function () use ($teacherSubjects, $classroom, $activeSemester) {
            $handle = fopen('php://output', 'w');
            fputs($handle, "\xEF\xBB\xBF");

            fputcsv($handle, ['LAPORAN CAPAIAN NILAI AKADEMIK SMK AL HIKAM']);
            fputcsv($handle, ['Kelas:', $classroom->name]);
            fputcsv($handle, ['Semester:', $activeSemester?->name ?? '-']);
            fputcsv($handle, []);

            fputcsv($handle, ['No', 'Kode Mapel', 'Mata Pelajaran', 'Guru Pengampu', 'Total Penilaian', 'Rata-rata Nilai', 'Kelulusan KKM (%)']);

            foreach ($teacherSubjects as $idx => $ts) {
                $grades = Grade::where('teacher_subject_id', $ts->id)->get();
                $avg = $grades->count() > 0 ? round($grades->avg('score'), 1) : '-';
                $passed = $grades->where('score', '>=', 75)->count();
                $total = $grades->count();
                $rate = $total > 0 ? round(($passed / $total) * 100) . '%' : '-';

                fputcsv($handle, [
                    $idx + 1,
                    $ts->subject->code,
                    $ts->subject->name,
                    $ts->teacher->user->name,
                    $total,
                    $avg,
                    $rate,
                ]);
            }

            fclose($handle);
        }, $fileName, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$fileName}\"",
        ]);
    }
}
