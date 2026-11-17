<?php

namespace Tests\Feature\Admin;

use App\Enums\Role;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class TeacherTest extends TestCase
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

    public function test_admin_bisa_melihat_daftar_guru(): void
    {
        $this->admin()->get('/admin/teachers')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Teachers/Index')
                ->has('teachers', 4));
    }

    public function test_admin_bisa_membuat_akun_dan_data_guru_baru(): void
    {
        $response = $this->admin()->post('/admin/teachers', [
            'name' => 'Budi Santoso, S.Pd.',
            'username' => 'bsantoso',
            'email' => 'bsantoso@alhikam.sch.id',
            'password' => 'rahasia123',
            'is_active' => true,
            'nip' => '198501012010011005',
            'gender' => 'L',
            'phone' => '081234567890',
            'specialization' => 'Fisika',
        ]);

        $response->assertRedirect();

        $user = User::where('username', 'bsantoso')->firstOrFail();
        $this->assertEquals(Role::Teacher, $user->role);
        $this->assertTrue(Hash::check('rahasia123', $user->password));

        $this->assertDatabaseHas('teachers', [
            'user_id' => $user->id,
            'nip' => '198501012010011005',
            'specialization' => 'Fisika',
        ]);
    }

    public function test_username_dan_email_guru_harus_unik(): void
    {
        $existing = User::where('username', 'guru01')->firstOrFail();

        $response = $this->admin()->post('/admin/teachers', [
            'name' => 'Guru Kloning',
            'username' => $existing->username,
            'email' => $existing->email,
            'password' => 'password',
        ]);

        $response->assertSessionHasErrors(['username', 'email']);
    }

    public function test_admin_bisa_memperbarui_data_guru(): void
    {
        $teacher = Teacher::firstOrFail();

        $response = $this->admin()->put("/admin/teachers/{$teacher->id}", [
            'name' => 'Nama Baru Guru',
            'username' => $teacher->user->username,
            'email' => $teacher->user->email,
            'specialization' => 'Spesialisasi Baru',
            'gender' => 'L',
            'is_active' => true,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('users', ['id' => $teacher->user_id, 'name' => 'Nama Baru Guru']);
        $this->assertDatabaseHas('teachers', ['id' => $teacher->id, 'specialization' => 'Spesialisasi Baru']);
    }

    public function test_guru_wali_kelas_tidak_bisa_dihapus(): void
    {
        $homeroomTeacher = Teacher::whereHas('homeroomClasses')->firstOrFail();

        $response = $this->admin()->delete("/admin/teachers/{$homeroomTeacher->id}");
        $response->assertRedirect();
        $response->assertSessionHas('error');

        $this->assertDatabaseHas('teachers', ['id' => $homeroomTeacher->id]);
    }
}
