<?php

namespace Tests\Feature\Admin;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ActivityLogTest extends TestCase
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

    public function test_admin_bisa_melihat_log_aktivitas_sistem(): void
    {
        ActivityLog::create([
            'user_id' => User::where('username', 'admin')->first()->id,
            'action' => 'test_action',
            'description' => 'Aktivitas pengujian sistem',
            'ip_address' => '127.0.0.1',
        ]);

        $this->admin()->get('/admin/activity')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Activity/Index')
                ->has('logs'));
    }
}
