<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class UserManagementTest extends TestCase
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

    public function test_admin_bisa_melihat_daftar_akun_pengguna(): void
    {
        $this->admin()->get('/admin/users')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Users/Index')
                ->has('users')
                ->has('filters'));
    }

    public function test_admin_bisa_mereset_kata_sandi_pengguna(): void
    {
        $targetUser = User::where('username', 'siswa02')->firstOrFail();

        $response = $this->admin()->post("/admin/users/{$targetUser->id}/reset-password", [
            'password' => 'passBaru123',
        ]);

        $response->assertRedirect();
        $this->assertTrue(Hash::check('passBaru123', $targetUser->fresh()->password));
    }

    public function test_admin_bisa_mengubah_status_aktif_pengguna(): void
    {
        $targetUser = User::where('username', 'siswa02')->firstOrFail();
        $initialState = $targetUser->is_active;

        $response = $this->admin()->post("/admin/users/{$targetUser->id}/toggle-active");

        $response->assertRedirect();
        $this->assertNotEquals($initialState, $targetUser->fresh()->is_active);
    }

    public function test_admin_tidak_bisa_menonaktifkan_akun_sendiri(): void
    {
        $adminUser = User::where('username', 'admin')->firstOrFail();

        $response = $this->admin()->post("/admin/users/{$adminUser->id}/toggle-active");

        $response->assertRedirect();
        $this->assertTrue($adminUser->fresh()->is_active);
    }
}
