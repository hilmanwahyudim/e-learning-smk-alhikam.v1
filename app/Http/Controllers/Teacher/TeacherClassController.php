<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\TeacherSubject;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TeacherClassController extends Controller
{
    /**
     * Tampilkan daftar rombel dan mata pelajaran yang diampu guru.
     */
    public function index(Request $request): Response
    {
        $teacher = $request->user()->teacher;

        $classes = TeacherSubject::query()
            ->where('teacher_id', $teacher->id)
            ->with([
                'classroom.department:id,code,name',
                'classroom.academicYear:id,name,is_active',
                'subject:id,code,name',
                'semester:id,name,is_active',
            ])
            ->withCount(['materials', 'assignments', 'quizzes'])
            ->get()
            ->map(function ($ts) {
                return [
                    'id' => $ts->id,
                    'class_name' => $ts->classroom->name,
                    'grade_level' => $ts->classroom->grade_level,
                    'department' => $ts->classroom->department?->name,
                    'subject_name' => $ts->subject->name,
                    'subject_code' => $ts->subject->code,
                    'semester' => $ts->semester->name,
                    'academic_year' => $ts->classroom->academicYear?->name,
                    'is_active_period' => (bool) ($ts->semester->is_active && $ts->classroom->academicYear?->is_active),
                    'materials_count' => $ts->materials_count,
                    'assignments_count' => $ts->assignments_count,
                    'quizzes_count' => $ts->quizzes_count,
                    'students_count' => $ts->classroom->enrollments()->count(),
                ];
            });

        return Inertia::render('Teacher/Classes/Index', [
            'classes' => $classes,
        ]);
    }

    /**
     * Tampilkan halaman kursus LMS terpadu untuk satu kelas & mapel.
     */
    public function show(Request $request, TeacherSubject $teacherSubject): Response
    {
        $teacher = $request->user()->teacher;

        if ($teacherSubject->teacher_id !== $teacher->id) {
            abort(403, 'Anda bukan guru pengampu mata pelajaran di kelas ini.');
        }

        $teacherSubject->load([
            'classroom.department',
            'classroom.academicYear',
            'classroom.enrollments.student.user',
            'subject',
            'semester',
            'materials' => fn ($q) => $q->notArchived()->with('files')->orderBy('sort_order'),
            'assignments' => fn ($q) => $q->withCount('submissions')->orderByDesc('created_at'),
            'quizzes' => fn ($q) => $q->withCount(['questions', 'attempts'])->orderByDesc('created_at'),
        ]);

        return Inertia::render('Teacher/Classes/Show', [
            'course' => $teacherSubject,
        ]);
    }
}
