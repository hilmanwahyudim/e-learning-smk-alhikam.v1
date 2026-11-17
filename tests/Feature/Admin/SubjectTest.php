<?php

namespace Tests\Feature\Admin;

use App\Models\Department;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class SubjectTest extends TestCase
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

    public function test_admin_bisa_melihat_daftar_mata_pelajaran(): void
    {
        $this->admin()->get('/admin/subjects')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Subjects/Index')
                ->has('subjects', 7));
    }

    public function test_admin_bisa_membuat_mapel_umum_dan_jurusan(): void
    {
        // Mapel umum
        $respUmum = $this->admin()->post('/admin/subjects', [
            'code' => 'SBK',
            'name' => 'Seni Budaya',
            'department_id' => null,
            'description' => 'Mata pelajaran seni budaya dan keterampilan',
        ]);
        $respUmum->assertRedirect();
        $this->assertDatabaseHas('subjects', ['code' => 'SBK', 'department_id' => null]);

        // Mapel jurusan
        $dept = Department::where('code', 'TKJ')->firstOrFail();
        $respJurusan = $this->admin()->post('/admin/subjects', [
            'code' => 'ASJ',
            'name' => 'Administrasi Server Jaringan',
            'department_id' => $dept->id,
            'description' => 'Mapel produktif TKJ',
        ]);
        $respJurusan->assertRedirect();
        $this->assertDatabaseHas('subjects', ['code' => 'ASJ', 'department_id' => $dept->id]);
    }

    public function test_kode_mapel_harus_unik(): void
    {
        $response = $this->admin()->post('/admin/subjects', [
            'code' => 'MTK',
            'name' => 'Matematika Lain',
        ]);

        $response->assertSessionHasErrors('code');
    }

    public function test_mapel_yang_ditugaskan_tidak_bisa_dihapus(): void
    {
        $subject = Subject::where('code', 'MTK')->firstOrFail();

        $response = $this->admin()->delete("/admin/subjects/{$subject->id}");
        $response->assertRedirect();
        $response->assertSessionHas('error');

        $this->assertDatabaseHas('subjects', ['id' => $subject->id]);
    }

    public function test_mapel_tanpa_penugasan_bisa_dihapus(): void
    {
        $subject = Subject::create([
            'code' => 'OR',
            'name' => 'Olahraga',
        ]);

        $response = $this->admin()->delete("/admin/subjects/{$subject->id}");
        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertSoftDeleted('subjects', ['id' => $subject->id]);
    }
}
