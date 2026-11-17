<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\AnnouncementRequest;
use App\Models\Announcement;
use App\Models\Classroom;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminAnnouncementController extends Controller
{
    /**
     * Tampilkan seluruh pengumuman sekolah dan kelas.
     */
    public function index(Request $request): Response
    {
        $announcements = Announcement::query()
            ->with(['author:id,name', 'classroom:id,name'])
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($ann) => [
                'id' => $ann->id,
                'title' => $ann->title,
                'body' => $ann->body,
                'class_id' => $ann->class_id,
                'class_name' => $ann->classroom?->name ?? 'Seluruh Sekolah',
                'author_name' => $ann->author->name,
                'published_at' => $ann->published_at ? $ann->published_at->format('Y-m-d H:i') : $ann->created_at->format('Y-m-d H:i'),
            ]);

        $classes = Classroom::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Admin/Announcements/Index', [
            'announcements' => $announcements,
            'classes' => $classes,
        ]);
    }

    /**
     * Simpan pengumuman baru (sekolah atau per kelas).
     */
    public function store(AnnouncementRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $announcement = Announcement::create([
            'author_id' => $request->user()->id,
            'class_id' => $data['class_id'] ?? null,
            'title' => $data['title'],
            'body' => $data['body'],
            'published_at' => $data['published_at'] ?? now(),
        ]);

        ActivityLogger::log('announcement_created', "Admin membuat pengumuman: {$announcement->title}", $announcement);

        return redirect()->back()->with('success', 'Pengumuman sekolah berhasil dipublikasikan.');
    }

    /**
     * Perbarui pengumuman.
     */
    public function update(AnnouncementRequest $request, Announcement $announcement): RedirectResponse
    {
        $data = $request->validated();

        $announcement->update([
            'class_id' => $data['class_id'] ?? null,
            'title' => $data['title'],
            'body' => $data['body'],
            'published_at' => $data['published_at'] ?? now(),
        ]);

        ActivityLogger::log('announcement_updated', "Admin memperbarui pengumuman: {$announcement->title}", $announcement);

        return redirect()->back()->with('success', 'Pengumuman berhasil diperbarui.');
    }

    /**
     * Hapus pengumuman.
     */
    public function destroy(Request $request, Announcement $announcement): RedirectResponse
    {
        $title = $announcement->title;
        $announcement->delete();

        ActivityLogger::log('announcement_deleted', "Admin menghapus pengumuman: {$title}", $announcement);

        return redirect()->back()->with('success', 'Pengumuman berhasil dihapus.');
    }
}
