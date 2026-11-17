<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ClassroomRequest;
use App\Models\AcademicYear;
use App\Models\Classroom;
use App\Models\Department;
use App\Models\Enrollment;
use App\Models\Student;
use App\Models\Teacher;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ClassroomController extends Controller
{
    /**
     * Tampilkan daftar kelas dengan opsi filter.
     */
    public function index(Request $request): Response
    {
        $activeYear = AcademicYear::where('is_active', true)->first();
        $selectedYearId = $request->input('academic_year_id', $activeYear?->id ?? 'all');

        $query = Classroom::query()
            ->with([
                'department:id,code,name',
                'academicYear:id,name,is_active',
                'homeroomTeacher.user:id,name',
            ])
            ->withCount(['enrollments', 'teacherSubjects']);

        if ($selectedYearId !== 'all' && $selectedYearId) {
            $query->where('academic_year_id', $selectedYearId);
        }

        if ($request->filled('department_id') && $request->department_id !== 'all') {
            $query->where('department_id', $request->department_id);
        }

        if ($request->filled('grade_level') && $request->grade_level !== 'all') {
            $query->where('grade_level', $request->grade_level);
        }

        $classes = $query->orderBy('grade_level')->orderBy('name')->get();

        $departments = Department::orderBy('code')->get(['id', 'code', 'name']);
        $academicYears = AcademicYear::orderByDesc('start_date')->get(['id', 'name', 'is_active']);
        $teachers = Teacher::with('user:id,name')->get()->map(fn ($t) => [
            'id' => $t->id,
            'name' => $t->user->name,
            'nip' => $t->nip,
        ]);

        return Inertia::render('Admin/Classes/Index', [
            'classes' => $classes,
            'departments' => $departments,
            'academicYears' => $academicYears,
            'teachers' => $teachers,
            'filters' => [
                'academic_year_id' => $selectedYearId,
                'department_id' => $request->department_id ?? 'all',
                'grade_level' => $request->grade_level ?? 'all',
            ],
        ]);
    }

    /**
     * Simpan data kelas baru.
     */
    public function store(ClassroomRequest $request): RedirectResponse
    {
        $classroom = Classroom::create($request->validated());

        ActivityLogger::log('class_created', "Menambahkan kelas {$classroom->name}", $classroom);

        return redirect()->back()->with('success', "Kelas {$classroom->name} berhasil ditambahkan.");
    }

    /**
     * Tampilkan detail kelas, daftar siswa dan jadwal mapel.
     */
    public function show(Classroom $class): Response
    {
        $class->load([
            'department',
            'academicYear',
            'homeroomTeacher.user',
            'enrollments.student.user',
            'teacherSubjects.teacher.user',
            'teacherSubjects.subject',
            'teacherSubjects.semester',
        ]);

        // Siswa yang belum terdaftar di tahun ajaran kelas ini
        $enrolledStudentIds = Enrollment::where('academic_year_id', $class->academic_year_id)
            ->pluck('student_id');

        $availableStudents = Student::with('user:id,name')
            ->whereNotIn('id', $enrolledStudentIds)
            ->get()
            ->map(fn ($s) => [
                'id' => $s->id,
                'name' => $s->user->name,
                'nis' => $s->nis,
            ]);

        return Inertia::render('Admin/Classes/Show', [
            'classroom' => $class,
            'availableStudents' => $availableStudents,
        ]);
    }

    /**
     * Perbarui data kelas.
     */
    public function update(ClassroomRequest $request, Classroom $class): RedirectResponse
    {
        $class->update($request->validated());

        ActivityLogger::log('class_updated', "Memperbarui kelas {$class->name}", $class);

        return redirect()->back()->with('success', "Kelas {$class->name} berhasil diperbarui.");
    }

    /**
     * Hapus kelas secara aman.
     */
    public function destroy(Classroom $class): RedirectResponse
    {
        if ($class->enrollments()->exists() || $class->teacherSubjects()->exists()) {
            return redirect()->back()->with('error', "Kelas {$class->name} tidak dapat dihapus karena masih memiliki data siswa atau jadwal mata pelajaran.");
        }

        $name = $class->name;
        $class->delete();

        ActivityLogger::log('class_deleted', "Menghapus kelas {$name}", $class);

        return redirect()->back()->with('success', "Kelas {$name} berhasil dihapus.");
    }

    /**
     * Tambahkan siswa ke dalam kelas (enrollment).
     */
    public function enrollStudent(Request $request, Classroom $class): RedirectResponse
    {
        $validated = $request->validate([
            'student_id' => ['required', 'exists:students,id'],
        ]);

        // Pastikan belum terdaftar di tahun ajaran yang sama
        $exists = Enrollment::where('student_id', $validated['student_id'])
            ->where('academic_year_id', $class->academic_year_id)
            ->exists();

        if ($exists) {
            return redirect()->back()->with('error', 'Siswa ini sudah terdaftar di kelas lain pada tahun ajaran ini.');
        }

        Enrollment::create([
            'student_id' => $validated['student_id'],
            'class_id' => $class->id,
            'academic_year_id' => $class->academic_year_id,
        ]);

        return redirect()->back()->with('success', 'Siswa berhasil dimasukkan ke dalam kelas.');
    }

    /**
     * Keluarkan siswa dari kelas.
     */
    public function removeStudent(Enrollment $enrollment): RedirectResponse
    {
        $studentName = $enrollment->student->user->name ?? 'Siswa';
        $enrollment->delete();

        return redirect()->back()->with('success', "{$studentName} dikeluarkan dari kelas.");
    }
}
