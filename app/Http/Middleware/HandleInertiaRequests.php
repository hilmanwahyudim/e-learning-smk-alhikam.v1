<?php

namespace App\Http\Middleware;

use App\Models\SchoolProfile;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /** Data yang tersedia di seluruh halaman React lewat usePage().props */
    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'username' => $user->username,
                    'email' => $user->email,
                    'avatar' => $user->avatar,
                    'role' => $user->role->value,
                    'role_label' => $user->role->label(),
                ] : null,
            ],
            'notifications' => fn () => $user ? [
                'unread' => $user->unreadNotifications()->count(),
                'items' => $user->notifications()->limit(8)->get()->map(fn ($n) => [
                    'id' => $n->id,
                    'title' => $n->data['title'] ?? 'Notifikasi',
                    'body' => $n->data['body'] ?? null,
                    'read' => $n->read_at !== null,
                    'at' => $n->created_at->toIso8601String(),
                ])->values(),
            ] : null,
            'school' => fn () => SchoolProfile::query()->first(['name', 'tagline', 'logo']),
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }
}
