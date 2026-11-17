<?php

namespace Tests\Feature\Admin;

use App\Models\Classroom;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ReportTest extends TestCase
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

    public function test_admin_bisa_melihat_laporan_capaian_nilai_akademik(): void
    {
        $this->admin()->get('/admin/reports')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Reports/Index')
                ->has('classes')
                ->has('selectedClassId')
                ->has('reports'));
    }

    public function test_admin_bisa_ekspor_csv_laporan_nilai(): void
    {
        $class = Classroom::firstOrFail();

        $response = $this->admin()->get("/admin/reports/export-csv?class_id={$class->id}");

        $response->assertOk();
        $this->assertTrue(str_contains($response->headers->get('content-type'), 'text/csv'));
        $this->assertTrue(str_contains($response->headers->get('content-disposition'), 'attachment; filename='));
    }
}
