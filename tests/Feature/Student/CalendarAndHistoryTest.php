<?php

namespace Tests\Feature\Student;

use App\Models\CalendarEvent;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CalendarAndHistoryTest extends TestCase
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

    public function test_siswa_bisa_melihat_kalender_pembelajaran(): void
    {
        CalendarEvent::create([
            'title' => 'Penilaian Tengah Semester (PTS)',
            'start_date' => now()->addDays(10),
            'category' => 'akademik',
        ]);

        $this->student()->get('/student/calendar')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Student/Calendar/Index')
                ->has('events'));
    }

    public function test_siswa_bisa_melihat_riwayat_jejak_pembelajaran(): void
    {
        $this->student()->get('/student/history')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Student/History/Index')
                ->has('timeline'));
    }
}
