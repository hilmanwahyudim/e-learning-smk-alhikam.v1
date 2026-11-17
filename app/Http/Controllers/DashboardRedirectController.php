<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

/** /dashboard mengarahkan pengguna ke dashboard sesuai role-nya. */
class DashboardRedirectController extends Controller
{
    public function __invoke(Request $request): RedirectResponse
    {
        return redirect()->route($request->user()->role->dashboardRoute());
    }
}
