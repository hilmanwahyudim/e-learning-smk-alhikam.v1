<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SchoolProfile;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SchoolProfileController extends Controller
{
    /**
     * Tampilkan dan kelola identitas profil resmi SMK Al Hikam.
     */
    public function edit(): Response
    {
        $profile = SchoolProfile::firstOrCreate(
            ['id' => 1],
            [
                'name' => 'SMK Al Hikam Jombang',
                'npsn' => '69786543',
                'tagline' => 'Berilmu, Berakhlak, dan Siap Berkarya',
                'address' => 'Jl. Raya Al Hikam No. 01, Diwek, Jombang, Jawa Timur 61471',
                'phone' => '(0321) 861234',
                'email' => 'smk.alhikam@sch.id',
                'website' => 'https://smk-alhikam.sch.id',
                'principal_name' => 'H. Ahmad Fauzi, S.Pd., M.M.',
            ]
        );

        return Inertia::render('Admin/School/Edit', [
            'profile' => $profile,
        ]);
    }

    /**
     * Perbarui identitas profil sekolah.
     */
    public function update(Request $request): RedirectResponse
    {
        $profile = SchoolProfile::firstOrCreate(['id' => 1]);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'npsn' => ['nullable', 'string', 'max:20'],
            'tagline' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:500'],
            'phone' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:255'],
            'website' => ['nullable', 'string', 'max:255'],
            'principal_name' => ['nullable', 'string', 'max:255'],
        ]);

        $profile->update($validated);

        ActivityLogger::log('school_profile_updated', 'Memperbarui profil dan identitas sekolah', $profile);

        return redirect()->back()->with('success', 'Profil dan identitas SMK Al Hikam berhasil diperbarui.');
    }
}
