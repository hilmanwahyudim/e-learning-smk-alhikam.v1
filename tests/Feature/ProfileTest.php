<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
        $this->seed();
    }

    public function test_pengguna_bisa_melihat_halaman_profil(): void
    {
        $user = User::where('username', 'guru01')->firstOrFail();

        $this->actingAs($user)->get('/profile')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Profile/Show')
                ->has('user'));
    }

    public function test_pengguna_bisa_memperbarui_informasi_profil(): void
    {
        $user = User::where('username', 'guru01')->firstOrFail();

        $response = $this->actingAs($user)->put('/profile', [
            'name' => 'Ahmad Fauzi Al-Hikam, S.Pd.I',
            'email' => 'ahmad.fauzi@alhikam.sch.id',
            'phone' => '081234567890',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Ahmad Fauzi Al-Hikam, S.Pd.I',
            'email' => 'ahmad.fauzi@alhikam.sch.id',
        ]);

        $this->assertDatabaseHas('teachers', [
            'user_id' => $user->id,
            'phone' => '081234567890',
        ]);
    }

    public function test_pengguna_bisa_mengubah_kata_sandi_dengan_kata_sandi_lama_yang_benar(): void
    {
        $user = User::where('username', 'siswa01')->firstOrFail();

        $response = $this->actingAs($user)->put('/profile/password', [
            'current_password' => 'password',
            'password' => 'rahasia123',
            'password_confirmation' => 'rahasia123',
        ]);

        $response->assertRedirect();
        $this->assertTrue(Hash::check('rahasia123', $user->fresh()->password));
    }

    public function test_pengguna_gagal_ubah_kata_sandi_jika_sandi_lama_salah(): void
    {
        $user = User::where('username', 'siswa01')->firstOrFail();

        $response = $this->actingAs($user)->put('/profile/password', [
            'current_password' => 'password_salah',
            'password' => 'rahasia123',
            'password_confirmation' => 'rahasia123',
        ]);

        $response->assertSessionHasErrors('current_password');
        $this->assertTrue(Hash::check('password', $user->fresh()->password));
    }
}
