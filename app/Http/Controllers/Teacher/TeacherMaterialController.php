<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Http\Requests\Teacher\MaterialRequest;
use App\Models\Material;
use App\Models\MaterialFile;
use App\Models\TeacherSubject;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class TeacherMaterialController extends Controller
{
    /**
     * Tampilkan daftar materi yang diampu guru.
     */
    public function index(Request $request): Response
    {
        $teacher = $request->user()->teacher;

        $teacherSubjectIds = TeacherSubject::where('teacher_id', $teacher->id)->pluck('id');

        $query = Material::query()
            ->whereIn('teacher_subject_id', $teacherSubjectIds)
            ->with([
                'teacherSubject.classroom:id,name,grade_level',
                'teacherSubject.subject:id,code,name',
                'files',
            ])
            ->withCount('progress');

        if ($request->filled('teacher_subject_id') && $request->teacher_subject_id !== 'all') {
            $query->where('teacher_subject_id', $request->teacher_subject_id);
        }

        if ($request->boolean('archived')) {
            $query->whereNotNull('archived_at');
        } else {
            $query->whereNull('archived_at');
        }

        $materials = $query->orderBy('sort_order')->orderByDesc('created_at')->get();

        $classes = TeacherSubject::where('teacher_id', $teacher->id)
            ->with(['classroom:id,name', 'subject:id,name,code'])
            ->get()
            ->map(fn ($ts) => [
                'id' => $ts->id,
                'name' => "{$ts->classroom->name} - {$ts->subject->name} ({$ts->subject->code})",
            ]);

        return Inertia::render('Teacher/Materials/Index', [
            'materials' => $materials,
            'classes' => $classes,
            'filters' => [
                'teacher_subject_id' => $request->teacher_subject_id ?? 'all',
                'archived' => $request->boolean('archived'),
            ],
        ]);
    }

    /**
     * Simpan materi pembelajaran baru beserta berkas lampiran dan video.
     */
    public function store(MaterialRequest $request): RedirectResponse
    {
        $teacher = $request->user()->teacher;
        $data = $request->validated();

        $ownsSubject = TeacherSubject::where('id', $data['teacher_subject_id'])
            ->where('teacher_id', $teacher->id)
            ->exists();

        if (! $ownsSubject) {
            abort(403, 'Anda tidak memiliki hak akses mengajar di kelas ini.');
        }

        DB::transaction(function () use ($data, $request) {
            $material = Material::create([
                'teacher_subject_id' => $data['teacher_subject_id'],
                'title' => $data['title'],
                'description' => $data['description'] ?? null,
                'content' => $data['content'] ?? null,
                'sort_order' => $data['sort_order'] ?? 0,
                'is_published' => $request->boolean('is_published', true),
            ]);

            // Simpan Video URL jika ada
            if (! empty($data['video_url'])) {
                $material->files()->create([
                    'type' => 'video',
                    'url' => $data['video_url'],
                    'original_name' => 'Video Pembelajaran',
                ]);
            }

            // Simpan file lampiran dokumen jika diunggah
            if ($request->hasFile('files')) {
                foreach ($request->file('files') as $file) {
                    $path = $file->store("materials/{$material->id}", 'public');
                    $material->files()->create([
                        'type' => 'file',
                        'path' => $path,
                        'original_name' => $file->getClientOriginalName(),
                        'mime_type' => $file->getClientMimeType(),
                        'size' => $file->getSize(),
                    ]);
                }
            }

            ActivityLogger::log('material_created', "Menambahkan materi: {$material->title}", $material);
        });

        return redirect()->back()->with('success', "Materi {$data['title']} berhasil dipublikasikan.");
    }

    /**
     * Perbarui data materi pembelajaran.
     */
    public function update(MaterialRequest $request, Material $material): RedirectResponse
    {
        $teacher = $request->user()->teacher;

        if ($material->teacherSubject->teacher_id !== $teacher->id) {
            abort(403, 'Anda tidak berhak mengubah materi ini.');
        }

        $data = $request->validated();

        DB::transaction(function () use ($material, $data, $request) {
            $material->update([
                'title' => $data['title'],
                'description' => $data['description'] ?? null,
                'content' => $data['content'] ?? null,
                'sort_order' => $data['sort_order'] ?? 0,
                'is_published' => $request->boolean('is_published', true),
            ]);

            // Perbarui Video URL
            if (! empty($data['video_url'])) {
                $videoFile = $material->files()->where('type', 'video')->first();
                if ($videoFile) {
                    $videoFile->update(['url' => $data['video_url']]);
                } else {
                    $material->files()->create([
                        'type' => 'video',
                        'url' => $data['video_url'],
                        'original_name' => 'Video Pembelajaran',
                    ]);
                }
            }

            // Upload file baru jika ada
            if ($request->hasFile('files')) {
                foreach ($request->file('files') as $file) {
                    $path = $file->store("materials/{$material->id}", 'public');
                    $material->files()->create([
                        'type' => 'file',
                        'path' => $path,
                        'original_name' => $file->getClientOriginalName(),
                        'mime_type' => $file->getClientMimeType(),
                        'size' => $file->getSize(),
                    ]);
                }
            }

            ActivityLogger::log('material_updated', "Memperbarui materi: {$material->title}", $material);
        });

        return redirect()->back()->with('success', "Materi {$material->title} berhasil diperbarui.");
    }

    /**
     * Hapus materi beserta berkas lampirannya.
     */
    public function destroy(Request $request, Material $material): RedirectResponse
    {
        $teacher = $request->user()->teacher;

        if ($material->teacherSubject->teacher_id !== $teacher->id) {
            abort(403, 'Akses ditolak.');
        }

        $title = $material->title;

        // Hapus fisik berkas dari disk
        foreach ($material->files as $file) {
            if ($file->path && Storage::disk('public')->exists($file->path)) {
                Storage::disk('public')->delete($file->path);
            }
        }

        $material->delete();

        ActivityLogger::log('material_deleted', "Menghapus materi: {$title}", $material);

        return redirect()->back()->with('success', "Materi {$title} berhasil dihapus.");
    }

    /**
     * Arsipkan atau pulihkan materi dari arsip.
     */
    public function toggleArchive(Request $request, Material $material): RedirectResponse
    {
        $teacher = $request->user()->teacher;

        if ($material->teacherSubject->teacher_id !== $teacher->id) {
            abort(403, 'Akses ditolak.');
        }

        if ($material->archived_at) {
            $material->update(['archived_at' => null]);
            $msg = 'Materi berhasil dipulihkan dari arsip.';
        } else {
            $material->update(['archived_at' => now()]);
            $msg = 'Materi berhasil dipindahkan ke arsip.';
        }

        return redirect()->back()->with('success', $msg);
    }

    /**
     * Unduh berkas lampiran materi.
     */
    public function downloadFile(Request $request, Material $material, MaterialFile $file): StreamedResponse
    {
        $user = $request->user();

        // Verifikasi kepemilikan guru atau siswa yang terdaftar di kelas
        if ($user->teacher) {
            if ($material->teacherSubject->teacher_id !== $user->teacher->id) {
                abort(403, 'Akses unduhan ditolak.');
            }
        } elseif ($user->student) {
            $enrolled = $user->student->enrollments()
                ->where('class_id', $material->teacherSubject->class_id)
                ->exists();
            if (! $enrolled) {
                abort(403, 'Anda tidak terdaftar di kelas ini.');
            }
        } else {
            abort(403);
        }

        if (! $file->path || ! Storage::disk('public')->exists($file->path)) {
            abort(404, 'Berkas tidak ditemukan di server.');
        }

        return Storage::disk('public')->download($file->path, $file->original_name);
    }
}
