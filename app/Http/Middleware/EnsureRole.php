<?php

namespace App\Http\Middleware;

use App\Enums\Role;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * Pemakaian di route: ->middleware('role:admin') atau 'role:admin,teacher'
 */
class EnsureRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            return redirect()->route('login');
        }

        // Akun dinonaktifkan saat sesi masih berjalan: paksa keluar.
        if (! $user->is_active) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('login');
        }

        $allowed = array_map(fn (string $r) => Role::from($r), $roles);

        abort_unless($user->hasRole(...$allowed), 403, 'Anda tidak memiliki akses ke halaman ini.');

        return $next($request);
    }
}
