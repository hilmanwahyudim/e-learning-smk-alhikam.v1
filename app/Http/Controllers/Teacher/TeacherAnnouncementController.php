<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Http\Requests\AnnouncementRequest;
use App\Models\Announcement;
use App\Models\TeacherSubject;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TeacherAnnouncementController extends Controller
{
    /**
     * Tampilkan daftar pengumuman kelas yang dibuat guru dan pengumuman sekolah.
     */
    public function index(Request $request): Response
    {
        $teacher = $request->user()->teacher;
        $classIds = TeacherSubject::where('teacher_id', $teacher->id)->pluck('class_id')->unique();

        $announcements = Announcement::query()
            ->where(function ($q) use ($teacher, $classIds) {
                $q->where('author_id', $teacher->user_id)
                    ->orWhereIn('class_id', $classIds)
                    ->orWhereNull('class_id');
            })
            ->with(['author:id,name', 'classroom:id,name'])
            ->orderByDesc('published_at')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($ann) => [
                'id' => $ann->id,
                'title' => $ann->title,
                'body' => $ann->body,
                'class_id' => $ann->class_id,
                'class_name' => $ann->classroom?->name ?? 'Seluruh Sekolah',
                'author_name' => $ann->author->name,
                'is_mine' => $ann->author_id === $teacher->user_id,
                'published_at' => $ann->published_at ? $ann->published_at->format('Y-m-d H:i') : $ann->created_at->format('Y-m-d H:i'),
            ]);

        $classes = TeacherSubject::where('teacher_id', $teacher->id)
            ->with('classroom:id,name')
            ->get()
            ->pluck('classroom')
            ->unique('id')
            ->values();

        return Inertia::render('Teacher/Announcements/Index', [
            'announcements' => $announcements,
            'classes' => $classes,
        ]);
    }

    /**
     * Buat pengumuman baru untuk kelas yang diampu.
     */
    public function store(AnnouncementRequest $request): RedirectResponse
    {
        $teacher = $request->user()->teacher;
        $data = $request->validated();

        $classId = $data['class_id'] ?? null;
        if ($classId) {
            $teachesClass = TeacherSubject::where('teacher_id', $teacher->id)
                ->where('class_id', $classId)
                ->exists();
            if (! $teachesClass) {
                abort(403, 'Anda tidak mengajar di kelas ini.');
            }
        }

        $announcement = Announcement::create([
            'author_id' => $request->user()->id,
            'class_id' => $classId,
            'title' => $data['title'],
            'body' => $data['body'],
            'published_at' => $data['published_at'] ?? now(),
        ]);

        ActivityLogger::log('announcement_created', "Membuat pengumuman: {$announcement->title}", $announcement);

        return redirect()->back()->with('success', 'Pengumuman berhasil dipublikasikan.');
    }

    /**
     * Perbarui pengumuman guru.
     */
    public function update(AnnouncementRequest $request, Announcement $announcement): RedirectResponse
    {
        if ($announcement->author_id !== $request->user()->id) {
            abort(403, 'Akses ditolak.');
        }

        $data = $request->validated();
        $announcement->update([
            'class_id' => $data['class_id'] ?? null,
            'title' => $data['title'],
            'body' => $data['body'],
            'published_at' => $data['published_at'] ?? now(),
        ]);

        ActivityLogger::log('announcement_updated', "Memperbarui pengumuman: {$announcement->title}", $announcement);

        return redirect()->back()->with('success', 'Pengumuman berhasil diperbarui.');
    }

    /**
     * Hapus pengumuman.
     */
    public function destroy(Request $request, Announcement $announcement): RedirectResponse
    {
        if ($announcement->author_id !== $request->user()->id) {
            abort(403, 'Akses ditolak.');
        }

        $title = $announcement->title;
        $announcement->delete();

        ActivityLogger::log('announcement_deleted', "Menghapus pengumuman: {$title}", $announcement);

        return redirect()->back()->with('success', 'Pengumuman berhasil dihapus.');
    }
}
