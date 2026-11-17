<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\DepartmentRequest;
use App\Models\Department;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class DepartmentController extends Controller
{
    /**
     * Tampilkan daftar jurusan/program keahlian.
     */
    public function index(): Response
    {
        $departments = Department::query()
            ->withCount(['classes', 'subjects'])
            ->orderBy('code')
            ->get();

        return Inertia::render('Admin/Departments/Index', [
            'departments' => $departments,
        ]);
    }

    /**
     * Simpan jurusan baru.
     */
    public function store(DepartmentRequest $request): RedirectResponse
    {
        $department = Department::create($request->validated());

        ActivityLogger::log('department_created', "Menambahkan jurusan {$department->name} ({$department->code})", $department);

        return redirect()->back()->with('success', "Jurusan {$department->name} berhasil ditambahkan.");
    }

    /**
     * Perbarui data jurusan.
     */
    public function update(DepartmentRequest $request, Department $department): RedirectResponse
    {
        $department->update($request->validated());

        ActivityLogger::log('department_updated', "Memperbarui jurusan {$department->name} ({$department->code})", $department);

        return redirect()->back()->with('success', "Data jurusan {$department->name} berhasil diperbarui.");
    }

    /**
     * Hapus jurusan secara aman.
     */
    public function destroy(Department $department): RedirectResponse
    {
        if ($department->classes()->exists() || $department->subjects()->exists()) {
            return redirect()->back()->with('error', "Jurusan {$department->name} tidak dapat dihapus karena masih terhubung dengan kelas atau mata pelajaran.");
        }

        $name = $department->name;
        $department->delete();

        ActivityLogger::log('department_deleted', "Menghapus jurusan {$name}", $department);

        return redirect()->back()->with('success', "Jurusan {$name} berhasil dihapus.");
    }
}
