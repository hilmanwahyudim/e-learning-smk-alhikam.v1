<?php

namespace Tests\Feature\Admin;

use App\Models\SchoolProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class SchoolProfileTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
        $this->seed();
    }

    private function admin(): static
    {
        return $this->actingAs(User::where('username', 'admin')->firstOrFail());
    }

    public function test_admin_bisa_melihat_dan_memperbarui_profil_sekolah(): void
    {
        $this->admin()->get('/admin/school')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/School/Edit')
                ->has('profile'));

        $response = $this->admin()->put('/admin/school', [
            'name' => 'SMK Al Hikam Diwek Jombang',
            'npsn' => '69786543',
            'tagline' => 'Unggul dalam Imtaq, Terampil dalam Iptek',
            'address' => 'Jl. Raya Al Hikam No. 01, Diwek, Jombang',
            'phone' => '(0321) 861234',
            'email' => 'smk.alhikam@sch.id',
            'principal_name' => 'H. Ahmad Fauzi, S.Pd., M.M.',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('school_profiles', [
            'name' => 'SMK Al Hikam Diwek Jombang',
            'tagline' => 'Unggul dalam Imtaq, Terampil dalam Iptek',
        ]);
    }
}
