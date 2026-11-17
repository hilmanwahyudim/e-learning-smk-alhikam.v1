<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\TeacherSubjectRequest;
use App\Models\Classroom;
use App\Models\Semester;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\TeacherSubject;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TeacherSubjectController extends Controller
{
    /**
     * Tampilkan daftar pembagian guru dan mata pelajaran per kelas.
     */
    public function index(Request $request): Response
    {
        $activeSemester = Semester::with('academicYear')->where('is_active', true)->first();
        $selectedSemesterId = $request->input('semester_id', $activeSemester?->id ?? 'all');

        $query = TeacherSubject::query()
            ->with([
                'teacher.user:id,name',
                'subject:id,code,name',
                'classroom:id,name,grade_level',
                'semester.academicYear',
            ])
            ->withCount(['materials', 'assignments', 'quizzes']);

        if ($selectedSemesterId !== 'all' && $selectedSemesterId) {
            $query->where('semester_id', $selectedSemesterId);
        }

        if ($request->filled('class_id') && $request->class_id !== 'all') {
            $query->where('class_id', $request->class_id);
        }

        if ($request->filled('teacher_id') && $request->teacher_id !== 'all') {
            $query->where('teacher_id', $request->teacher_id);
        }

        $teacherSubjects = $query->get()->sortBy([
            ['classroom.name', 'asc'],
            ['subject.name', 'asc'],
        ])->values();

        $teachers = Teacher::with('user:id,name')->get()->map(fn ($t) => [
            'id' => $t->id,
            'name' => $t->user->name,
            'nip' => $t->nip,
        ])->sortBy('name')->values();

        $subjects = Subject::orderBy('name')->get(['id', 'code', 'name']);
        $classes = Classroom::orderBy('name')->get(['id', 'name', 'grade_level']);
        $semesters = Semester::with('academicYear:id,name')
            ->orderByDesc('start_date')
            ->get()
            ->map(fn ($s) => [
                'id' => $s->id,
                'name' => "{$s->name} - {$s->academicYear->name}",
                'is_active' => $s->is_active,
            ]);

        return Inertia::render('Admin/TeacherSubjects/Index', [
            'teacherSubjects' => $teacherSubjects,
            'teachers' => $teachers,
            'subjects' => $subjects,
            'classes' => $classes,
            'semesters' => $semesters,
            'filters' => [
                'semester_id' => $selectedSemesterId,
                'class_id' => $request->class_id ?? 'all',
                'teacher_id' => $request->teacher_id ?? 'all',
            ],
            'activeSemester' => $activeSemester ? "{$activeSemester->name} ({$activeSemester->academicYear->name})" : null,
        ]);
    }

    /**
     * Simpan pembagian guru dan mata pelajaran baru.
     */
    public function store(TeacherSubjectRequest $request): RedirectResponse
    {
        $teacherSubject = TeacherSubject::create($request->validated());

        ActivityLogger::log(
            'teacher_subject_created',
            "Menugaskan guru {$teacherSubject->teacher->user->name} untuk mapel {$teacherSubject->subject->name} di kelas {$teacherSubject->classroom->name}",
            $teacherSubject
        );

        return redirect()->back()->with('success', 'Penugasan guru dan mata pelajaran berhasil disimpan.');
    }

    /**
     * Perbarui data penugasan.
     */
    public function update(TeacherSubjectRequest $request, TeacherSubject $teacherSubject): RedirectResponse
    {
        $teacherSubject->update($request->validated());

        ActivityLogger::log(
            'teacher_subject_updated',
            "Memperbarui penugasan guru {$teacherSubject->teacher->user->name} di kelas {$teacherSubject->classroom->name}",
            $teacherSubject
        );

        return redirect()->back()->with('success', 'Penugasan guru berhasil diperbarui.');
    }

    /**
     * Hapus penugasan jika belum ada materi/tugas/kuis.
     */
    public function destroy(TeacherSubject $teacherSubject): RedirectResponse
    {
        if ($teacherSubject->materials()->exists() || $teacherSubject->assignments()->exists() || $teacherSubject->quizzes()->exists()) {
            return redirect()->back()->with('error', 'Penugasan tidak dapat dihapus karena sudah memiliki materi, tugas, atau kuis yang dibuat guru.');
        }

        $teacherSubject->delete();

        ActivityLogger::log('teacher_subject_deleted', 'Menghapus penugasan guru dan mata pelajaran', $teacherSubject);

        return redirect()->back()->with('success', 'Penugasan guru berhasil dihapus.');
    }
}
