<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
        $this->seed(); // data dummy: 12 siswa, 4 guru, 3 kelas, dst.
    }

    private function as(string $username): static
    {
        return $this->actingAs(User::where('username', $username)->firstOrFail());
    }

    public function test_dashboard_admin_memuat_statistik(): void
    {
        $this->as('admin')->get('/admin/dashboard')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Dashboard')
                ->where('stats.students', 12)
                ->where('stats.teachers', 4)
                ->where('stats.classes', 3)
                ->has('activity.labels', 7)
                ->has('submissions.values', 4)
                ->has('recent'));
    }

    public function test_dashboard_guru_hanya_memuat_kelas_yang_diampu(): void
    {
        // guru04 mengampu mapel produktif di 3 kelas
        $this->as('guru04')->get('/teacher/dashboard')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Teacher/Dashboard')
                ->where('stats.classes', 3)
                ->where('stats.students', 12)
                ->has('pending')
                ->has('exams'));

        // guru01 hanya mengampu PAI, tetapi PAI ada di ketiga kelas
        $this->as('guru01')->get('/teacher/dashboard')
            ->assertInertia(fn (Assert $page) => $page->where('stats.classes', 3));
    }

    public function test_dashboard_siswa_memuat_mapel_kelasnya_sendiri(): void
    {
        // siswa01 berada di X TKJ 1: PAI, BIN, MTK, BIG, JKD
        $this->as('siswa01')->get('/student/dashboard')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Student/Dashboard')
                ->where('profile.class', 'X TKJ 1')
                ->has('subjects', 5)
                ->has('announcements', 2));
    }

    public function test_siswa_kelas_lain_tidak_melihat_pengumuman_kelas_ppertama(): void
    {
        // siswa12 berada di XI RPL 1, hanya melihat pengumuman sekolah
        $this->as('siswa12')->get('/student/dashboard')
            ->assertInertia(fn (Assert $page) => $page->has('announcements', 1));
    }

    public function test_notifikasi_dibagikan_dan_bisa_ditandai_dibaca(): void
    {
        $user = User::where('username', 'siswa01')->firstOrFail();

        $this->actingAs($user)->get('/student/dashboard')
            ->assertInertia(fn (Assert $page) => $page->where('notifications.unread', 1));

        $this->actingAs($user)->post('/notifications/read-all')->assertRedirect();

        $this->assertSame(0, $user->unreadNotifications()->count());
    }

    public function test_notifikasi_orang_lain_tidak_bisa_dibaca(): void
    {
        $other = User::where('username', 'siswa02')->firstOrFail();
        $id = $other->notifications()->first()->id;

        $this->as('siswa01')->post("/notifications/{$id}/read")->assertNotFound();
    }
}
