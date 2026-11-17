<?php

namespace Tests\Feature;

use App\Models\Announcement;
use App\Models\Classroom;
use App\Models\TeacherSubject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AnnouncementTest extends TestCase
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

    private function teacher(string $username = 'guru01'): static
    {
        return $this->actingAs(User::where('username', $username)->firstOrFail());
    }

    private function student(string $username = 'siswa01'): static
    {
        return $this->actingAs(User::where('username', $username)->firstOrFail());
    }

    public function test_admin_bisa_melihat_dan_membuat_pengumuman_sekolah(): void
    {
        $this->admin()->get('/admin/announcements')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Announcements/Index')
                ->has('announcements')
                ->has('classes'));

        $response = $this->admin()->post('/admin/announcements', [
            'title' => 'Libur Nasional Maulid Nabi',
            'body' => 'Diberitahukan kepada seluruh siswa dan dewan guru bahwa kegiatan KBM ditiadakan.',
            'published_at' => now()->format('Y-m-d H:i:s'),
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('announcements', [
            'title' => 'Libur Nasional Maulid Nabi',
            'class_id' => null,
        ]);
    }

    public function test_guru_bisa_membuat_pengumuman_untuk_kelas_yang_diampu(): void
    {
        $guru = User::where('username', 'guru01')->firstOrFail();
        $ts = TeacherSubject::where('teacher_id', $guru->teacher->id)->firstOrFail();

        $response = $this->teacher('guru01')->post('/teacher/announcements', [
            'class_id' => $ts->class_id,
            'title' => 'Membawa Perlengkapan Jaringan',
            'body' => 'Mohon membawa kabel UTP dan tang crimping pada pertemuan esok.',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('announcements', [
            'title' => 'Membawa Perlengkapan Jaringan',
            'class_id' => $ts->class_id,
        ]);
    }

    public function test_guru_tidak_bisa_membuat_pengumuman_untuk_kelas_lain(): void
    {
        $guru01 = User::where('username', 'guru01')->firstOrFail();
        $guru02 = User::where('username', 'guru02')->firstOrFail();

        // Cari kelas yang HANYA diampu oleh guru02
        $guru01ClassIds = TeacherSubject::where('teacher_id', $guru01->teacher->id)->pluck('class_id');
        $otherClass = Classroom::whereNotIn('id', $guru01ClassIds)->first();

        if ($otherClass) {
            $response = $this->teacher('guru01')->post('/teacher/announcements', [
                'class_id' => $otherClass->id,
                'title' => 'Pengumuman Ilegal',
                'body' => 'Testing unauthorized class.',
            ]);

            $response->assertForbidden();
        }
    }

    public function test_siswa_bisa_melihat_pengumuman(): void
    {
        // Buat pengumuman sekolah
        Announcement::create([
            'author_id' => User::where('username', 'admin')->first()->id,
            'title' => 'Pengumuman Upacara Hari Senin',
            'body' => 'Seluruh siswa wajib mengenakan seragam lengkap.',
            'published_at' => now(),
        ]);

        $this->student('siswa01')->get('/student/announcements')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Student/Announcements/Index')
                ->has('announcements'));
    }
}
