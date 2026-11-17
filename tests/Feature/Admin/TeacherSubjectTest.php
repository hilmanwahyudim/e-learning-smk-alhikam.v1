<?php

namespace Tests\Feature\Admin;

use App\Models\Classroom;
use App\Models\Semester;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\TeacherSubject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class TeacherSubjectTest extends TestCase
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

    public function test_admin_bisa_melihat_daftar_pembagian_guru(): void
    {
        $this->admin()->get('/admin/teacher-subjects')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/TeacherSubjects/Index')
                ->has('teacherSubjects')
                ->has('teachers')
                ->has('subjects')
                ->has('classes')
                ->has('semesters'));
    }

    public function test_admin_bisa_menugaskan_guru_ke_mapel_dan_kelas(): void
    {
        // Buat mapel baru yang belum ditugaskan
        $subject = Subject::create(['code' => 'SEJ', 'name' => 'Sejarah Indonesia']);
        $teacher = Teacher::firstOrFail();
        $class = Classroom::firstOrFail();
        $semester = Semester::where('is_active', true)->firstOrFail();

        $response = $this->admin()->post('/admin/teacher-subjects', [
            'teacher_id' => $teacher->id,
            'subject_id' => $subject->id,
            'class_id' => $class->id,
            'semester_id' => $semester->id,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('teacher_subjects', [
            'teacher_id' => $teacher->id,
            'subject_id' => $subject->id,
            'class_id' => $class->id,
            'semester_id' => $semester->id,
        ]);
    }

    public function test_mapel_di_kelas_dan_semester_yang_sama_tidak_bisa_diduplikasi(): void
    {
        $existing = TeacherSubject::firstOrFail();
        $anotherTeacher = Teacher::where('id', '!=', $existing->teacher_id)->firstOrFail();

        $response = $this->admin()->post('/admin/teacher-subjects', [
            'teacher_id' => $anotherTeacher->id,
            'subject_id' => $existing->subject_id,
            'class_id' => $existing->class_id,
            'semester_id' => $existing->semester_id,
        ]);

        $response->assertSessionHasErrors('subject_id');
    }

    public function test_penugasan_dengan_materi_tidak_bisa_dihapus(): void
    {
        // DemoContentSeeder mengisi materi ke TeacherSubject
        $assigned = TeacherSubject::whereHas('materials')->firstOrFail();

        $response = $this->admin()->delete("/admin/teacher-subjects/{$assigned->id}");
        $response->assertRedirect();
        $response->assertSessionHas('error');

        $this->assertDatabaseHas('teacher_subjects', ['id' => $assigned->id]);
    }
}
