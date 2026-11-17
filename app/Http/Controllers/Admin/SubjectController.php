<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SubjectRequest;
use App\Models\Department;
use App\Models\Subject;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SubjectController extends Controller
{
    /**
     * Tampilkan daftar mata pelajaran.
     */
    public function index(Request $request): Response
    {
        $query = Subject::query()
            ->with('department:id,code,name')
            ->withCount(['teacherSubjects', 'questions']);

        if ($request->filled('department_id')) {
            if ($request->department_id === 'general') {
                $query->whereNull('department_id');
            } elseif ($request->department_id !== 'all') {
                $query->where('department_id', $request->department_id);
            }
        }

        $subjects = $query->orderBy('name')->get();
        $departments = Department::orderBy('code')->get(['id', 'code', 'name']);

        return Inertia::render('Admin/Subjects/Index', [
            'subjects' => $subjects,
            'departments' => $departments,
            'filters' => [
                'department_id' => $request->department_id ?? 'all',
            ],
        ]);
    }

    /**
     * Simpan mata pelajaran baru.
     */
    public function store(SubjectRequest $request): RedirectResponse
    {
        $subject = Subject::create($request->validated());

        ActivityLogger::log('subject_created', "Menambahkan mata pelajaran {$subject->name} ({$subject->code})", $subject);

        return redirect()->back()->with('success', "Mata pelajaran {$subject->name} berhasil ditambahkan.");
    }

    /**
     * Perbarui data mata pelajaran.
     */
    public function update(SubjectRequest $request, Subject $subject): RedirectResponse
    {
        $subject->update($request->validated());

        ActivityLogger::log('subject_updated', "Memperbarui mata pelajaran {$subject->name} ({$subject->code})", $subject);

        return redirect()->back()->with('success', "Mata pelajaran {$subject->name} berhasil diperbarui.");
    }

    /**
     * Hapus mata pelajaran secara aman.
     */
    public function destroy(Subject $subject): RedirectResponse
    {
        if ($subject->teacherSubjects()->exists()) {
            return redirect()->back()->with('error', "Mata pelajaran {$subject->name} tidak dapat dihapus karena masih ditugaskan kepada guru.");
        }

        if ($subject->questions()->exists()) {
            return redirect()->back()->with('error', "Mata pelajaran {$subject->name} tidak dapat dihapus karena memiliki soal di bank soal.");
        }

        $name = $subject->name;
        $subject->delete();

        ActivityLogger::log('subject_deleted', "Menghapus mata pelajaran {$name}", $subject);

        return redirect()->back()->with('success', "Mata pelajaran {$name} berhasil dihapus.");
    }
}
