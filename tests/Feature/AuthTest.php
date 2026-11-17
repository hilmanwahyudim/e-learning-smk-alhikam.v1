<?php

namespace Tests\Feature;

use App\Models\ActivityLog;
use App\Models\SchoolProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
        SchoolProfile::create(['name' => 'SMK Al Hikam']);
    }

    public function test_halaman_login_tampil(): void
    {
        $this->get('/login')->assertOk();
    }

    public function test_tamu_diarahkan_ke_login(): void
    {
        $this->get('/admin/dashboard')->assertRedirect('/login');
    }

    public function test_setiap_role_diarahkan_ke_dashboard_masing_masing(): void
    {
        foreach (['admin', 'teacher', 'student'] as $role) {
            $user = User::factory()->{$role}()->create(['username' => "u_{$role}"]);

            $this->post('/login', ['login' => "u_{$role}", 'password' => 'password'])
                ->assertRedirect("/{$role}/dashboard");

            $this->get("/{$role}/dashboard")->assertOk();
            $this->post('/logout')->assertRedirect('/login');
            $this->assertGuest();
        }
    }

    public function test_login_dengan_email_berhasil(): void
    {
        User::factory()->teacher()->create(['email' => 'guru@test.local']);

        $this->post('/login', ['login' => 'guru@test.local', 'password' => 'password'])
            ->assertRedirect('/teacher/dashboard');
    }

    public function test_kata_sandi_salah_ditolak(): void
    {
        User::factory()->create(['username' => 'siswa_x']);

        $this->post('/login', ['login' => 'siswa_x', 'password' => 'salah'])
            ->assertSessionHasErrors('login');
        $this->assertGuest();
    }

    public function test_akun_nonaktif_tidak_bisa_login(): void
    {
        User::factory()->inactive()->create(['username' => 'nonaktif']);

        $this->post('/login', ['login' => 'nonaktif', 'password' => 'password'])
            ->assertSessionHasErrors('login');
        $this->assertGuest();
    }

    public function test_siswa_tidak_bisa_membuka_halaman_admin_dan_guru(): void
    {
        $siswa = User::factory()->student()->create();

        $this->actingAs($siswa)->get('/admin/dashboard')->assertForbidden();
        $this->actingAs($siswa)->get('/teacher/dashboard')->assertForbidden();
    }

    public function test_guru_tidak_bisa_membuka_halaman_admin(): void
    {
        $guru = User::factory()->teacher()->create();

        $this->actingAs($guru)->get('/admin/dashboard')->assertForbidden();
    }

    public function test_login_dibatasi_setelah_lima_percobaan_gagal(): void
    {
        User::factory()->create(['username' => 'brute']);

        for ($i = 0; $i < 5; $i++) {
            $this->post('/login', ['login' => 'brute', 'password' => 'salah']);
        }

        // Percobaan ke-6 ditolak walau kata sandinya benar.
        $this->post('/login', ['login' => 'brute', 'password' => 'password'])
            ->assertSessionHasErrors('login');
        $this->assertGuest();
    }

    public function test_login_dan_logout_tercatat_di_activity_log(): void
    {
        $user = User::factory()->admin()->create(['username' => 'adm']);

        $this->post('/login', ['login' => 'adm', 'password' => 'password']);
        $this->post('/logout');

        $this->assertDatabaseHas('activity_logs', ['user_id' => $user->id, 'action' => 'login']);
        $this->assertDatabaseHas('activity_logs', ['user_id' => $user->id, 'action' => 'logout']);
        $this->assertSame(2, ActivityLog::where('user_id', $user->id)->count());
    }

    public function test_password_tersimpan_ter_hash(): void
    {
        $user = User::factory()->create();

        $this->assertNotSame('password', $user->password);
        $this->assertTrue(\Illuminate\Support\Facades\Hash::check('password', $user->password));
    }
}
