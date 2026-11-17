<?php

use App\Http\Middleware\EnsureRole;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\LogActivity;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Support\Facades\Route;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
        then: function () {
            // Satu file route per role; semuanya wajib login + role yang sesuai.
            foreach (['admin', 'teacher', 'student'] as $role) {
                Route::middleware(['web', 'auth', "role:{$role}", 'log.activity'])
                    ->prefix($role)
                    ->name("{$role}.")
                    ->group(base_path("routes/{$role}.php"));
            }
        },
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'role' => EnsureRole::class,
            'log.activity' => LogActivity::class,
        ]);

        $middleware->web(append: [HandleInertiaRequests::class]);

        // Pengguna yang sudah login dan membuka /login diarahkan ke dashboard-nya.
        $middleware->redirectUsersTo(fn () => route('dashboard'));
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
