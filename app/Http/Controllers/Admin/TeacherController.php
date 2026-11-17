<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\TeacherRequest;
use App\Models\Teacher;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class TeacherController extends Controller
{
    /**
     * Tampilkan daftar data guru.
     */
    public function index(Request $request): Response
    {
        $teachers = Teacher::query()
            ->with('user:id,name,username,email,is_active,avatar,last_login_at')
            ->withCount(['teacherSubjects', 'homeroomClasses'])
            ->get()
            ->sortBy('user.name')
            ->values();

        return Inertia::render('Admin/Teachers/Index', [
            'teachers' => $teachers,
        ]);
    }

    /**
     * Simpan data guru dan akun user baru.
     */
    public function store(TeacherRequest $request): RedirectResponse
    {
        $data = $request->validated();

        DB::transaction(function () use ($data, $request) {
            $user = User::create([
                'name' => $data['name'],
                'username' => $data['username'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'role' => Role::Teacher,
                'is_active' => $request->boolean('is_active', true),
            ]);

            $teacher = Teacher::create([
                'user_id' => $user->id,
                'nip' => $data['nip'] ?? null,
                'gender' => $data['gender'] ?? null,
                'phone' => $data['phone'] ?? null,
                'address' => $data['address'] ?? null,
                'specialization' => $data['specialization'] ?? null,
            ]);

            ActivityLogger::log('teacher_created', "Menambahkan akun guru {$user->name} ({$user->username})", $teacher);
        });

        return redirect()->back()->with('success', "Data guru {$data['name']} berhasil ditambahkan.");
    }

    /**
     * Perbarui data guru dan akun login.
     */
    public function update(TeacherRequest $request, Teacher $teacher): RedirectResponse
    {
        $data = $request->validated();

        DB::transaction(function () use ($teacher, $data, $request) {
            $userUpdates = [
                'name' => $data['name'],
                'username' => $data['username'],
                'email' => $data['email'],
                'is_active' => $request->boolean('is_active', true),
            ];

            if (! empty($data['password'])) {
                $userUpdates['password'] = Hash::make($data['password']);
            }

            $teacher->user()->update($userUpdates);

            $teacher->update([
                'nip' => $data['nip'] ?? null,
                'gender' => $data['gender'] ?? null,
                'phone' => $data['phone'] ?? null,
                'address' => $data['address'] ?? null,
                'specialization' => $data['specialization'] ?? null,
            ]);

            ActivityLogger::log('teacher_updated', "Memperbarui akun guru {$teacher->user->name}", $teacher);
        });

        return redirect()->back()->with('success', "Data guru {$data['name']} berhasil diperbarui.");
    }

    /**
     * Hapus data guru dan nonaktifkan akun user.
     */
    public function destroy(Teacher $teacher): RedirectResponse
    {
        if ($teacher->homeroomClasses()->exists()) {
            return redirect()->back()->with('error', "Guru {$teacher->user->name} masih bertugas sebagai wali kelas.");
        }

        if ($teacher->teacherSubjects()->exists()) {
            return redirect()->back()->with('error', "Guru {$teacher->user->name} masih memiliki penugasan mata pelajaran.");
        }

        $name = $teacher->user->name;

        DB::transaction(function () use ($teacher, $name) {
            $teacher->user()->update(['is_active' => false]);
            $teacher->delete();
            ActivityLogger::log('teacher_deleted', "Menghapus akun guru {$name}", $teacher);
        });

        return redirect()->back()->with('success', "Data guru {$name} berhasil dihapus.");
    }
}
