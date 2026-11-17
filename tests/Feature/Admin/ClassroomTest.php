<?php

namespace Tests\Feature\Admin;

use App\Models\AcademicYear;
use App\Models\Classroom;
use App\Models\Department;
use App\Models\Enrollment;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ClassroomTest extends TestCase
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

    public function test_admin_bisa_melihat_daftar_kelas(): void
    {
        $this->admin()->get('/admin/classes')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Classes/Index')
                ->has('classes', 3));
    }

    public function test_admin_bisa_membuat_kelas_baru(): void
    {
        $dept = Department::where('code', 'TKJ')->firstOrFail();
        $year = AcademicYear::where('is_active', true)->firstOrFail();
        $teacher = Teacher::firstOrFail();

        $response = $this->admin()->post('/admin/classes', [
            'name' => 'X TKJ 2',
            'grade_level' => 'X',
            'department_id' => $dept->id,
            'academic_year_id' => $year->id,
            'homeroom_teacher_id' => $teacher->id,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('classes', [
            'name' => 'X TKJ 2',
            'grade_level' => 'X',
            'department_id' => $dept->id,
        ]);
    }

    public function test_nama_kelas_harus_unik_dalam_tahun_ajaran_yang_sama(): void
    {
        $existing = Classroom::firstOrFail();

        $response = $this->admin()->post('/admin/classes', [
            'name' => $existing->name,
            'grade_level' => 'X',
            'department_id' => $existing->department_id,
            'academic_year_id' => $existing->academic_year_id,
        ]);

        $response->assertSessionHasErrors('name');
    }

    public function test_admin_bisa_melihat_detail_kelas_dan_daftar_siswa(): void
    {
        $classroom = Classroom::firstOrFail();

        $this->admin()->get("/admin/classes/{$classroom->id}")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Classes/Show')
                ->where('classroom.id', $classroom->id)
                ->has('classroom.enrollments')
                ->has('availableStudents'));
    }

    public function test_admin_bisa_memasukkan_dan_mengeluarkan_siswa_dari_kelas(): void
    {
        $classroom = Classroom::firstOrFail();

        // Buat siswa baru tanpa kelas
        $user = User::factory()->student()->create();
        $student = Student::create([
            'user_id' => $user->id,
            'nis' => '999901',
        ]);

        // Masukkan siswa
        $response = $this->admin()->post("/admin/classes/{$classroom->id}/enroll", [
            'student_id' => $student->id,
        ]);
        $response->assertRedirect();
        $this->assertDatabaseHas('enrollments', [
            'student_id' => $student->id,
            'class_id' => $classroom->id,
            'academic_year_id' => $classroom->academic_year_id,
        ]);

        $enrollment = Enrollment::where('student_id', $student->id)->firstOrFail();

        // Keluarkan siswa
        $deleteResp = $this->admin()->delete("/admin/enrollments/{$enrollment->id}");
        $deleteResp->assertRedirect();
        $this->assertDatabaseMissing('enrollments', ['id' => $enrollment->id]);
    }

    public function test_kelas_dengan_siswa_tidak_bisa_dihapus(): void
    {
        $classroom = Classroom::whereHas('enrollments')->firstOrFail();

        $response = $this->admin()->delete("/admin/classes/{$classroom->id}");
        $response->assertRedirect();
        $response->assertSessionHas('error');

        $this->assertDatabaseHas('classes', ['id' => $classroom->id]);
    }
}
