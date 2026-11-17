<?php

namespace Tests\Feature\Admin;

use App\Enums\Role;
use App\Models\AcademicYear;
use App\Models\Classroom;
use App\Models\Enrollment;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class StudentTest extends TestCase
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

    public function test_admin_bisa_melihat_daftar_siswa(): void
    {
        $this->admin()->get('/admin/students')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Students/Index')
                ->has('students', 12)
                ->has('classes', 3));
    }

    public function test_admin_bisa_membuat_siswa_baru_beserta_penempatan_kelas(): void
    {
        $classroom = Classroom::firstOrFail();

        $response = $this->admin()->post('/admin/students', [
            'name' => 'Faris Pratama',
            'username' => 'faris26',
            'email' => 'faris@alhikam.sch.id',
            'password' => 'password123',
            'is_active' => true,
            'nis' => '269999',
            'nisn' => '0098765432',
            'gender' => 'L',
            'phone' => '08987654321',
            'guardian_name' => 'H. Pratama',
            'class_id' => $classroom->id,
        ]);

        $response->assertRedirect();

        $user = User::where('username', 'faris26')->firstOrFail();
        $this->assertEquals(Role::Student, $user->role);
        $this->assertTrue(Hash::check('password123', $user->password));

        $student = Student::where('user_id', $user->id)->firstOrFail();
        $this->assertEquals('269999', $student->nis);

        $activeYear = AcademicYear::where('is_active', true)->firstOrFail();
        $this->assertDatabaseHas('enrollments', [
            'student_id' => $student->id,
            'class_id' => $classroom->id,
            'academic_year_id' => $activeYear->id,
        ]);
    }

    public function test_nis_siswa_harus_unik(): void
    {
        $existing = Student::firstOrFail();

        $response = $this->admin()->post('/admin/students', [
            'name' => 'Siswa Duplikat',
            'username' => 'duplikat',
            'email' => 'duplikat@alhikam.sch.id',
            'password' => 'password',
            'nis' => $existing->nis,
        ]);

        $response->assertSessionHasErrors('nis');
    }

    public function test_admin_bisa_mengubah_data_dan_pindah_kelas_siswa(): void
    {
        $student = Student::firstOrFail();
        $classes = Classroom::all();
        $newClass = $classes->where('id', '!=', $student->enrollments->first()?->class_id)->firstOrFail();

        $response = $this->admin()->put("/admin/students/{$student->id}", [
            'name' => 'Nama Siswa Terupdate',
            'username' => $student->user->username,
            'email' => $student->user->email,
            'nis' => $student->nis,
            'gender' => 'L',
            'class_id' => $newClass->id,
            'is_active' => true,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('users', ['id' => $student->user_id, 'name' => 'Nama Siswa Terupdate']);

        $activeYear = AcademicYear::where('is_active', true)->firstOrFail();
        $this->assertDatabaseHas('enrollments', [
            'student_id' => $student->id,
            'class_id' => $newClass->id,
            'academic_year_id' => $activeYear->id,
        ]);
    }

    public function test_admin_bisa_menghapus_siswa(): void
    {
        $student = Student::firstOrFail();
        $userId = $student->user_id;

        $response = $this->admin()->delete("/admin/students/{$student->id}");
        $response->assertRedirect();

        $this->assertSoftDeleted('students', ['id' => $student->id]);
        $this->assertFalse(User::find($userId)->is_active);
    }
}
