<?php

namespace Tests\Feature\Teacher;

use App\Models\TeacherSubject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class GradeRecapTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
        $this->seed();
    }

    private function teacher(): static
    {
        return $this->actingAs(User::where('username', 'guru01')->firstOrFail());
    }

    public function test_guru_bisa_melihat_rekap_nilai_kelas(): void
    {
        $this->teacher()->get('/teacher/grades')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Teacher/Grades/Index')
                ->has('classes')
                ->has('selectedId')
                ->has('recap'));
    }

    public function test_guru_bisa_ekspor_csv_rekap_nilai(): void
    {
        $guru = User::where('username', 'guru01')->firstOrFail();
        $ts = TeacherSubject::where('teacher_id', $guru->teacher->id)->firstOrFail();

        $response = $this->teacher()->get("/teacher/grades/export-csv?teacher_subject_id={$ts->id}");

        $response->assertOk();
        $this->assertTrue(str_contains($response->headers->get('content-type'), 'text/csv'));
        $this->assertTrue(str_contains($response->headers->get('content-disposition'), 'attachment; filename='));
    }

    public function test_guru_bisa_membuka_halaman_cetak_laporan_nilai(): void
    {
        $guru = User::where('username', 'guru01')->firstOrFail();
        $ts = TeacherSubject::where('teacher_id', $guru->teacher->id)->firstOrFail();

        $this->teacher()->get("/teacher/grades/print?teacher_subject_id={$ts->id}")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Teacher/Grades/Print')
                ->has('subject')
                ->has('recap'));
    }
}
