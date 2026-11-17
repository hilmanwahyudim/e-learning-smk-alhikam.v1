<?php

namespace Tests\Feature\Admin;

use App\Models\AcademicYear;
use App\Models\Semester;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AcademicYearTest extends TestCase
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

    public function test_admin_bisa_melihat_daftar_tahun_ajaran(): void
    {
        $this->admin()->get('/admin/academic-years')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/AcademicYears/Index')
                ->has('academicYears', 1));
    }

    public function test_admin_bisa_membuat_tahun_ajaran_baru_dan_otomatis_membuat_semester(): void
    {
        $response = $this->admin()->post('/admin/academic-years', [
            'name' => '2027/2028',
            'start_date' => '2027-07-12',
            'end_date' => '2028-06-25',
            'is_active' => false,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('academic_years', ['name' => '2027/2028']);

        $year = AcademicYear::where('name', '2027/2028')->firstOrFail();
        $this->assertCount(2, $year->semesters);
        $this->assertEquals(['Ganjil', 'Genap'], $year->semesters->pluck('name')->all());
    }

    public function test_admin_bisa_mengaktifkan_tahun_ajaran(): void
    {
        $newYear = AcademicYear::create([
            'name' => '2028/2029',
            'start_date' => '2028-07-10',
            'end_date' => '2029-06-23',
            'is_active' => false,
        ]);
        $newYear->semesters()->create([
            'name' => 'Ganjil',
            'start_date' => '2028-07-10',
            'end_date' => '2028-12-20',
            'is_active' => false,
        ]);

        $response = $this->admin()->post("/admin/academic-years/{$newYear->id}/set-active");
        $response->assertRedirect();

        $this->assertTrue($newYear->fresh()->is_active);
        $this->assertFalse(AcademicYear::where('name', '2026/2027')->first()->is_active);
    }

    public function test_tidak_bisa_menghapus_tahun_ajaran_yang_sedang_aktif(): void
    {
        $activeYear = AcademicYear::where('is_active', true)->firstOrFail();

        $response = $this->admin()->delete("/admin/academic-years/{$activeYear->id}");
        $response->assertRedirect();
        $response->assertSessionHas('error');

        $this->assertDatabaseHas('academic_years', ['id' => $activeYear->id]);
    }

    public function test_admin_bisa_mengaktifkan_semester(): void
    {
        $year = AcademicYear::where('is_active', true)->firstOrFail();
        $genap = $year->semesters()->where('name', 'Genap')->firstOrFail();

        $response = $this->admin()->post("/admin/semesters/{$genap->id}/set-active");
        $response->assertRedirect();

        $this->assertTrue($genap->fresh()->is_active);
        $this->assertFalse($year->semesters()->where('name', 'Ganjil')->first()->is_active);
    }
}
