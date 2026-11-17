<?php

namespace App\Http\Middleware;

use App\Services\ActivityLogger;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Mencatat aksi yang mengubah data (POST/PUT/PATCH/DELETE) yang berhasil.
 * Isi request (termasuk password) sengaja TIDAK dicatat.
 */
class LogActivity
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if ($request->user()
            && ! $request->isMethodSafe()
            && $response->getStatusCode() < 400) {
            ActivityLogger::log(
                'request',
                $request->method() . ' ' . ($request->route()?->getName() ?? $request->path()),
            );
        }

        return $response;
    }
}
