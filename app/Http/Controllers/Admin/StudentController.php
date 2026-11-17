<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StudentRequest;
use App\Models\AcademicYear;
use App\Models\Classroom;
use App\Models\Enrollment;
use App\Models\Student;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class StudentController extends Controller
{
    /**
     * Tampilkan daftar siswa beserta kelas aktifnya.
     */
    public function index(Request $request): Response
    {
        $activeYear = AcademicYear::where('is_active', true)->first();

        $query = Student::query()
            ->with([
                'user:id,name,username,email,is_active,avatar,last_login_at',
                'enrollments' => function ($q) use ($activeYear) {
                    if ($activeYear) {
                        $q->where('academic_year_id', $activeYear->id);
                    }
                    $q->with('classroom:id,name,grade_level');
                },
            ]);

        if ($request->filled('class_id') && $request->class_id !== 'all') {
            $query->whereHas('enrollments', function ($q) use ($request, $activeYear) {
                $q->where('class_id', $request->class_id);
                if ($activeYear) {
                    $q->where('academic_year_id', $activeYear->id);
                }
            });
        }

        $students = $query->get()->map(function ($s) {
            $activeEnrollment = $s->enrollments->first();

            return [
                'id' => $s->id,
                'user_id' => $s->user_id,
                'name' => $s->user->name,
                'username' => $s->user->username,
                'email' => $s->user->email,
                'is_active' => $s->user->is_active,
                'avatar' => $s->user->avatar,
                'last_login_at' => $s->user->last_login_at,
                'nis' => $s->nis,
                'nisn' => $s->nisn,
                'gender' => $s->gender,
                'birth_place' => $s->birth_place,
                'birth_date' => $s->birth_date?->format('Y-m-d'),
                'phone' => $s->phone,
                'address' => $s->address,
                'guardian_name' => $s->guardian_name,
                'guardian_phone' => $s->guardian_phone,
                'classroom' => $activeEnrollment?->classroom ? [
                    'id' => $activeEnrollment->classroom->id,
                    'name' => $activeEnrollment->classroom->name,
                    'grade_level' => $activeEnrollment->classroom->grade_level,
                ] : null,
                'class_id' => $activeEnrollment?->class_id,
            ];
        })->sortBy('name')->values();

        $classes = Classroom::where('academic_year_id', $activeYear?->id ?? 0)
            ->orderBy('name')
            ->get(['id', 'name', 'grade_level']);

        return Inertia::render('Admin/Students/Index', [
            'students' => $students,
            'classes' => $classes,
            'filters' => [
                'class_id' => $request->class_id ?? 'all',
            ],
            'activeYear' => $activeYear?->name,
        ]);
    }

    /**
     * Simpan data siswa baru beserta akun user dan penempatan kelas awal.
     */
    public function store(StudentRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $activeYear = AcademicYear::where('is_active', true)->first();

        DB::transaction(function () use ($data, $request, $activeYear) {
            $user = User::create([
                'name' => $data['name'],
                'username' => $data['username'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'role' => Role::Student,
                'is_active' => $request->boolean('is_active', true),
            ]);

            $student = Student::create([
                'user_id' => $user->id,
                'nis' => $data['nis'],
                'nisn' => $data['nisn'] ?? null,
                'gender' => $data['gender'] ?? null,
                'birth_place' => $data['birth_place'] ?? null,
                'birth_date' => $data['birth_date'] ?? null,
                'phone' => $data['phone'] ?? null,
                'address' => $data['address'] ?? null,
                'guardian_name' => $data['guardian_name'] ?? null,
                'guardian_phone' => $data['guardian_phone'] ?? null,
            ]);

            if (! empty($data['class_id']) && $activeYear) {
                Enrollment::create([
                    'student_id' => $student->id,
                    'class_id' => $data['class_id'],
                    'academic_year_id' => $activeYear->id,
                ]);
            }

            ActivityLogger::log('student_created', "Menambahkan akun siswa {$user->name} ({$student->nis})", $student);
        });

        return redirect()->back()->with('success', "Data siswa {$data['name']} berhasil ditambahkan.");
    }

    /**
     * Perbarui data siswa, akun, dan kelasnya.
     */
    public function update(StudentRequest $request, Student $student): RedirectResponse
    {
        $data = $request->validated();
        $activeYear = AcademicYear::where('is_active', true)->first();

        DB::transaction(function () use ($student, $data, $request, $activeYear) {
            $userUpdates = [
                'name' => $data['name'],
                'username' => $data['username'],
                'email' => $data['email'],
                'is_active' => $request->boolean('is_active', true),
            ];

            if (! empty($data['password'])) {
                $userUpdates['password'] = Hash::make($data['password']);
            }

            $student->user()->update($userUpdates);

            $student->update([
                'nis' => $data['nis'],
                'nisn' => $data['nisn'] ?? null,
                'gender' => $data['gender'] ?? null,
                'birth_place' => $data['birth_place'] ?? null,
                'birth_date' => $data['birth_date'] ?? null,
                'phone' => $data['phone'] ?? null,
                'address' => $data['address'] ?? null,
                'guardian_name' => $data['guardian_name'] ?? null,
                'guardian_phone' => $data['guardian_phone'] ?? null,
            ]);

            // Update atau buat enrollment untuk tahun ajaran aktif
            if ($activeYear) {
                if (! empty($data['class_id'])) {
                    Enrollment::updateOrCreate(
                        [
                            'student_id' => $student->id,
                            'academic_year_id' => $activeYear->id,
                        ],
                        [
                            'class_id' => $data['class_id'],
                        ]
                    );
                } else {
                    Enrollment::where('student_id', $student->id)
                        ->where('academic_year_id', $activeYear->id)
                        ->delete();
                }
            }

            ActivityLogger::log('student_updated', "Memperbarui data siswa {$student->user->name}", $student);
        });

        return redirect()->back()->with('success', "Data siswa {$data['name']} berhasil diperbarui.");
    }

    /**
     * Hapus data siswa dan nonaktifkan akunnya.
     */
    public function destroy(Student $student): RedirectResponse
    {
        $name = $student->user->name;

        DB::transaction(function () use ($student, $name) {
            $student->user()->update(['is_active' => false]);
            $student->delete();
            ActivityLogger::log('student_deleted', "Menghapus akun siswa {$name}", $student);
        });

        return redirect()->back()->with('success', "Data siswa {$name} berhasil dihapus.");
    }
}
