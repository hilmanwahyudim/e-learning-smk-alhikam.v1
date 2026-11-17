<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use App\Models\Announcement;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StudentAnnouncementController extends Controller
{
    /**
     * Tampilkan seluruh pengumuman sekolah dan pengumuman untuk kelas siswa.
     */
    public function index(Request $request): Response
    {
        $student = $request->user()->student;
        $activeYear = AcademicYear::where('is_active', true)->first();

        $enrollment = $student->enrollments()
            ->where('academic_year_id', $activeYear?->id ?? 0)
            ->first();

        $studentClassId = $enrollment?->class_id;

        $announcements = Announcement::query()
            ->where(function ($q) use ($studentClassId) {
                $q->whereNull('class_id');
                if ($studentClassId) {
                    $q->orWhere('class_id', $studentClassId);
                }
            })
            ->where(fn ($q) => $q->whereNull('published_at')->orWhere('published_at', '<=', now()))
            ->with(['author:id,name', 'classroom:id,name'])
            ->orderByDesc('published_at')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($ann) => [
                'id' => $ann->id,
                'title' => $ann->title,
                'body' => $ann->body,
                'scope' => $ann->class_id ? "Kelas {$ann->classroom->name}" : 'Seluruh Sekolah',
                'author_name' => $ann->author->name,
                'published_at' => $ann->published_at ? $ann->published_at->format('Y-m-d H:i') : $ann->created_at->format('Y-m-d H:i'),
            ]);

        return Inertia::render('Student/Announcements/Index', [
            'announcements' => $announcements,
            'className' => $enrollment?->classroom?->name,
        ]);
    }
}
