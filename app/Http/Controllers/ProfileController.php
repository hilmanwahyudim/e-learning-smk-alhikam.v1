<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdatePasswordRequest;
use App\Http\Requests\UpdateProfileRequest;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Tampilkan profil pengguna yang sedang login.
     */
    public function show(Request $request): Response
    {
        $user = $request->user()->load(['student.enrollments.classroom', 'teacher']);

        return Inertia::render('Profile/Show', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'role' => $user->role->value,
                'role_label' => $user->role->label(),
                'avatar' => $user->avatar,
                'phone' => $user->teacher?->phone ?? $user->student?->phone ?? '',
                'address' => $user->student?->address ?? '',
                'nip' => $user->teacher?->nip ?? null,
                'nis' => $user->student?->nis ?? null,
                'nisn' => $user->student?->nisn ?? null,
                'class_name' => $user->student?->enrollments?->first()?->classroom?->name ?? null,
            ],
        ]);
    }

    /**
     * Perbarui data profil (nama, email, telepon, alamat).
     */
    public function update(UpdateProfileRequest $request): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
        ]);

        if ($user->isTeacher() && $user->teacher) {
            $user->teacher->update([
                'phone' => $validated['phone'] ?? null,
            ]);
        } elseif ($user->isStudent() && $user->student) {
            $user->student->update([
                'phone' => $validated['phone'] ?? null,
                'address' => $validated['address'] ?? null,
            ]);
        }

        ActivityLogger::log('profile_updated', 'Memperbarui profil pribadi', $user);

        return redirect()->back()->with('success', 'Profil berhasil diperbarui.');
    }

    /**
     * Perbarui kata sandi pengguna.
     */
    public function updatePassword(UpdatePasswordRequest $request): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        ActivityLogger::log('password_changed', 'Mengubah kata sandi akun', $user);

        return redirect()->back()->with('success', 'Kata sandi berhasil diperbarui.');
    }
}
