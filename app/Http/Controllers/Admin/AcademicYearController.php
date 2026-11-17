<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AcademicYearRequest;
use App\Http\Requests\Admin\SemesterRequest;
use App\Models\AcademicYear;
use App\Models\Semester;
use App\Services\ActivityLogger;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AcademicYearController extends Controller
{
    /**
     * Tampilkan daftar tahun ajaran beserta semester.
     */
    public function index(): Response
    {
        $academicYears = AcademicYear::query()
            ->with(['semesters' => fn ($q) => $q->orderBy('start_date')])
            ->withCount('classes')
            ->orderByDesc('start_date')
            ->get();

        return Inertia::render('Admin/AcademicYears/Index', [
            'academicYears' => $academicYears,
        ]);
    }

    /**
     * Simpan tahun ajaran baru dan buat semester ganjil/genap secara otomatis.
     */
    public function store(AcademicYearRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $isActive = (bool) ($data['is_active'] ?? false);

        DB::transaction(function () use ($data, $isActive) {
            if ($isActive) {
                AcademicYear::query()->update(['is_active' => false]);
                Semester::query()->update(['is_active' => false]);
            }

            $year = AcademicYear::create($data);

            $startDate = Carbon::parse($year->start_date);
            $endDate = Carbon::parse($year->end_date);
            $midDate = $startDate->copy()->addMonths(5)->endOfMonth();

            $year->semesters()->createMany([
                [
                    'name' => 'Ganjil',
                    'start_date' => $startDate->toDateString(),
                    'end_date' => $midDate->toDateString(),
                    'is_active' => $isActive,
                ],
                [
                    'name' => 'Genap',
                    'start_date' => $midDate->copy()->addDay()->toDateString(),
                    'end_date' => $endDate->toDateString(),
                    'is_active' => false,
                ],
            ]);

            ActivityLogger::log('academic_year_created', "Menambahkan tahun ajaran {$year->name}", $year);
        });

        return redirect()->back()->with('success', "Tahun ajaran {$data['name']} beserta semester berhasil dibuat.");
    }

    /**
     * Perbarui data tahun ajaran.
     */
    public function update(AcademicYearRequest $request, AcademicYear $academicYear): RedirectResponse
    {
        $data = $request->validated();
        $isActive = (bool) ($data['is_active'] ?? false);

        DB::transaction(function () use ($academicYear, $data, $isActive) {
            if ($isActive && ! $academicYear->is_active) {
                AcademicYear::where('id', '!=', $academicYear->id)->update(['is_active' => false]);
            }

            $academicYear->update($data);

            ActivityLogger::log('academic_year_updated', "Memperbarui tahun ajaran {$academicYear->name}", $academicYear);
        });

        return redirect()->back()->with('success', "Tahun ajaran {$academicYear->name} berhasil diperbarui.");
    }

    /**
     * Tetapkan tahun ajaran ini sebagai tahun ajaran aktif.
     */
    public function setActive(AcademicYear $academicYear): RedirectResponse
    {
        DB::transaction(function () use ($academicYear) {
            AcademicYear::where('id', '!=', $academicYear->id)->update(['is_active' => false]);
            $academicYear->update(['is_active' => true]);

            // Jika belum ada semester yang aktif di tahun ini, aktifkan semester pertama (Ganjil)
            if (! $academicYear->semesters()->where('is_active', true)->exists()) {
                Semester::query()->update(['is_active' => false]);
                $academicYear->semesters()->orderBy('start_date')->first()?->update(['is_active' => true]);
            }

            ActivityLogger::log('academic_year_activated', "Mengaktifkan tahun ajaran {$academicYear->name}", $academicYear);
        });

        return redirect()->back()->with('success', "Tahun ajaran {$academicYear->name} sekarang menjadi tahun ajaran aktif.");
    }

    /**
     * Hapus tahun ajaran.
     */
    public function destroy(AcademicYear $academicYear): RedirectResponse
    {
        if ($academicYear->is_active) {
            return redirect()->back()->with('error', 'Tidak dapat menghapus tahun ajaran yang sedang aktif.');
        }

        if ($academicYear->classes()->exists()) {
            return redirect()->back()->with('error', "Tahun ajaran {$academicYear->name} masih memiliki data kelas terkait.");
        }

        $name = $academicYear->name;
        $academicYear->delete();

        ActivityLogger::log('academic_year_deleted', "Menghapus tahun ajaran {$name}", $academicYear);

        return redirect()->back()->with('success', "Tahun ajaran {$name} berhasil dihapus.");
    }

    /**
     * Simpan semester baru untuk tahun ajaran tertentu.
     */
    public function storeSemester(SemesterRequest $request, AcademicYear $academicYear): RedirectResponse
    {
        $data = $request->validated();
        $isActive = (bool) ($data['is_active'] ?? false);

        DB::transaction(function () use ($academicYear, $data, $isActive) {
            if ($isActive) {
                Semester::query()->update(['is_active' => false]);
            }

            $semester = $academicYear->semesters()->create($data);

            ActivityLogger::log('semester_created', "Menambahkan semester {$semester->name} untuk {$academicYear->name}", $semester);
        });

        return redirect()->back()->with('success', "Semester {$data['name']} berhasil ditambahkan.");
    }

    /**
     * Perbarui data semester.
     */
    public function updateSemester(SemesterRequest $request, Semester $semester): RedirectResponse
    {
        $data = $request->validated();
        $isActive = (bool) ($data['is_active'] ?? false);

        DB::transaction(function () use ($semester, $data, $isActive) {
            if ($isActive && ! $semester->is_active) {
                Semester::where('id', '!=', $semester->id)->update(['is_active' => false]);
            }

            $semester->update($data);

            ActivityLogger::log('semester_updated', "Memperbarui semester {$semester->name}", $semester);
        });

        return redirect()->back()->with('success', "Semester {$semester->name} berhasil diperbarui.");
    }

    /**
     * Tetapkan semester ini sebagai semester aktif.
     */
    public function setActiveSemester(Semester $semester): RedirectResponse
    {
        DB::transaction(function () use ($semester) {
            Semester::where('id', '!=', $semester->id)->update(['is_active' => false]);
            $semester->update(['is_active' => true]);

            // Pastikan tahun ajarannya juga aktif
            AcademicYear::where('id', '!=', $semester->academic_year_id)->update(['is_active' => false]);
            $semester->academicYear()->update(['is_active' => true]);

            ActivityLogger::log('semester_activated', "Mengaktifkan semester {$semester->name} ({$semester->academicYear->name})", $semester);
        });

        return redirect()->back()->with('success', "Semester {$semester->name} ({$semester->academicYear->name}) sekarang aktif.");
    }
}
