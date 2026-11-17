<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Tampilkan daftar seluruh akun pengguna sistem (Admin, Guru, Siswa).
     */
    public function index(Request $request): Response
    {
        $query = User::query()->with(['student.enrollments.classroom', 'teacher']);

        if ($request->filled('role') && $request->role !== 'all') {
            $query->where('role', $request->role);
        }

        $users = $query->orderByDesc('created_at')->get()->map(fn ($u) => [
            'id' => $u->id,
            'name' => $u->name,
            'username' => $u->username,
            'email' => $u->email,
            'role' => $u->role->value,
            'role_label' => $u->role->label(),
            'is_active' => (bool) $u->is_active,
            'last_login_at' => $u->last_login_at?->format('Y-m-d H:i'),
            'detail' => $u->teacher ? "NIP: {$u->teacher->nip}" : ($u->student ? "NIS: {$u->student->nis}" : 'Akses Penuh'),
        ]);

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'filters' => [
                'role' => $request->role ?? 'all',
            ],
        ]);
    }

    /**
     * Reset kata sandi pengguna oleh administrator.
     */
    public function resetPassword(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'password' => ['required', 'string', Password::min(6)],
        ]);

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        ActivityLogger::log('user_password_reset', "Admin mereset kata sandi pengguna: {$user->username}", $user);

        return redirect()->back()->with('success', "Kata sandi akun {$user->username} berhasil direset.");
    }

    /**
     * Ubah status aktif / nonaktif akun pengguna.
     */
    public function toggleActive(Request $request, User $user): RedirectResponse
    {
        if ($user->id === $request->user()->id) {
            return redirect()->back()->with('error', 'Anda tidak dapat menonaktifkan akun sendiri.');
        }

        $user->update([
            'is_active' => ! $user->is_active,
        ]);

        $status = $user->is_active ? 'diaktifkan' : 'dinonaktifkan';
        ActivityLogger::log('user_status_changed', "Status akun {$user->username} diubah menjadi {$status}", $user);

        return redirect()->back()->with('success', "Akun {$user->username} berhasil {$status}.");
    }

    /**
     * Hapus akun pengguna.
     */
    public function destroy(Request $request, User $user): RedirectResponse
    {
        if ($user->id === $request->user()->id) {
            return redirect()->back()->with('error', 'Anda tidak dapat menghapus akun sendiri.');
        }

        $username = $user->username;
        $user->delete();

        ActivityLogger::log('user_deleted', "Admin menghapus akun pengguna: {$username}", $user);

        return redirect()->back()->with('success', "Akun {$username} berhasil dihapus.");
    }
}
