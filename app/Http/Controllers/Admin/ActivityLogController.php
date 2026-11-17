<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ActivityLogController extends Controller
{
    /**
     * Tampilkan riwayat log aktivitas pengguna dan sistem.
     */
    public function index(Request $request): Response
    {
        $logs = ActivityLog::query()
            ->with('user:id,name,username,role')
            ->orderByDesc('created_at')
            ->limit(100)
            ->get()
            ->map(fn ($log) => [
                'id' => $log->id,
                'user_name' => $log->user?->name ?? 'Sistem',
                'username' => $log->user?->username ?? '-',
                'role' => $log->user?->role?->label() ?? 'System',
                'action' => $log->action,
                'description' => $log->description,
                'ip_address' => $log->ip_address,
                'created_at' => $log->created_at->format('Y-m-d H:i:s'),
                'time_ago' => $log->created_at->diffForHumans(),
            ]);

        return Inertia::render('Admin/Activity/Index', [
            'logs' => $logs,
        ]);
    }
}
