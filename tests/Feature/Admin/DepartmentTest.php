<?php

namespace Tests\Feature\Admin;

use App\Models\Department;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DepartmentTest extends TestCase
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

    public function test_guest_dan_guru_tidak_bisa_mengakses_data_jurusan(): void
    {
        $this->get('/admin/departments')->assertRedirect('/login');

        $guru = User::where('username', 'guru01')->firstOrFail();
        $this->actingAs($guru)->get('/admin/departments')->assertForbidden();
    }

    public function test_admin_bisa_melihat_daftar_jurusan(): void
    {
        $this->admin()->get('/admin/departments')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Departments/Index')
                ->has('departments', 3));
    }

    public function test_admin_bisa_menambah_jurusan_baru(): void
    {
        $response = $this->admin()->post('/admin/departments', [
            'code' => 'DKV',
            'name' => 'Desain Komunikasi Visual',
            'description' => 'Kompetensi keahlian desain multimedia dan komunikasi visual.',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('departments', ['code' => 'DKV', 'name' => 'Desain Komunikasi Visual']);
    }

    public function test_kode_jurusan_harus_unik(): void
    {
        $response = $this->admin()->post('/admin/departments', [
            'code' => 'TKJ',
            'name' => 'Teknik Komputer',
        ]);

        $response->assertSessionHasErrors('code');
    }

    public function test_admin_bisa_mengedit_jurusan(): void
    {
        $dept = Department::where('code', 'AKL')->firstOrFail();

        $response = $this->admin()->put("/admin/departments/{$dept->id}", [
            'code' => 'AKL',
            'name' => 'Akuntansi dan Keuangan Baru',
            'description' => 'Update deskripsi',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('departments', ['id' => $dept->id, 'name' => 'Akuntansi dan Keuangan Baru']);
    }

    public function test_jurusan_yang_memiliki_kelas_tidak_dapat_dihapus(): void
    {
        $dept = Department::where('code', 'TKJ')->firstOrFail();

        $response = $this->admin()->delete("/admin/departments/{$dept->id}");
        $response->assertRedirect();
        $response->assertSessionHas('error');

        $this->assertDatabaseHas('departments', ['id' => $dept->id]);
    }

    public function test_jurusan_tanpa_relasi_bisa_dihapus(): void
    {
        $dept = Department::create(['code' => 'TBG', 'name' => 'Tata Boga']);

        $response = $this->admin()->delete("/admin/departments/{$dept->id}");
        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertSoftDeleted('departments', ['id' => $dept->id]);
    }
}
