<?php

namespace Tests\Feature\Student;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class GradeTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
        $this->seed();
    }

    private function student(): static
    {
        return $this->actingAs(User::where('username', 'siswa01')->firstOrFail());
    }

    public function test_siswa_bisa_melihat_transkrip_nilai_semester(): void
    {
        $this->student()->get('/student/grades')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Student/Grades/Index')
                ->has('classroom')
                ->has('activeSemester')
                ->has('activeYear')
                ->has('subjects'));
    }

    public function test_siswa_bisa_melihat_halaman_cetak_hasil_belajar(): void
    {
        $this->student()->get('/student/grades/print')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Student/Grades/Print')
                ->has('student')
                ->has('semester')
                ->has('academic_year')
                ->has('subjects'));
    }
}
