<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\AssignmentSubmission;
use App\Models\MaterialProgress;
use App\Models\QuizAttempt;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StudentHistoryController extends Controller
{
    /**
     * Tampilkan riwayat jejak pembelajaran siswa (timeline aktivitas).
     */
    public function index(Request $request): Response
    {
        $student = $request->user()->student;

        // Riwayat tugas yang dikumpulkan
        $submissions = AssignmentSubmission::where('student_id', $student->id)
            ->with(['assignment.teacherSubject.subject'])
            ->orderByDesc('submitted_at')
            ->limit(20)
            ->get()
            ->map(fn ($sub) => [
                'type' => 'assignment',
                'title' => 'Mengumpulkan Tugas: ' . $sub->assignment->title,
                'subject' => $sub->assignment->teacherSubject->subject->name,
                'detail' => $sub->score !== null ? "Nilai: {$sub->score}" : ($sub->is_late ? 'Status: Terlambat' : 'Status: Tepat waktu'),
                'timestamp' => $sub->submitted_at?->format('Y-m-d H:i') ?? $sub->created_at->format('Y-m-d H:i'),
                'time_raw' => $sub->submitted_at ?? $sub->created_at,
            ]);

        // Riwayat materi yang selesai dibaca
        $materials = MaterialProgress::where('student_id', $student->id)
            ->with(['material.teacherSubject.subject'])
            ->orderByDesc('completed_at')
            ->limit(20)
            ->get()
            ->map(fn ($m) => [
                'type' => 'material',
                'title' => 'Selesai Mempelajari Materi: ' . $m->material->title,
                'subject' => $m->material->teacherSubject->subject->name,
                'detail' => 'Progres belajar tercatat 100%',
                'timestamp' => $m->completed_at ? $m->completed_at->format('Y-m-d H:i') : $m->created_at->format('Y-m-d H:i'),
                'time_raw' => $m->completed_at ?? $m->created_at,
            ]);

        // Riwayat ujian yang diselesaikan
        $attempts = QuizAttempt::where('student_id', $student->id)
            ->whereNotNull('finished_at')
            ->with(['quiz.teacherSubject.subject'])
            ->orderByDesc('finished_at')
            ->limit(20)
            ->get()
            ->map(fn ($att) => [
                'type' => 'quiz',
                'title' => 'Menyelesaikan ' . ($att->quiz->type === 'exam' ? 'Ujian: ' : 'Kuis: ') . $att->quiz->title,
                'subject' => $att->quiz->teacherSubject->subject->name,
                'detail' => $att->total_score !== null ? "Total Skor: {$att->total_score}" : 'Menunggu koreksi esai',
                'timestamp' => $att->finished_at->format('Y-m-d H:i'),
                'time_raw' => $att->finished_at,
            ]);

        $timeline = $submissions
            ->concat($materials)
            ->concat($attempts)
            ->sortByDesc('time_raw')
            ->values();

        return Inertia::render('Student/History/Index', [
            'timeline' => $timeline,
        ]);
    }
}
