<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use App\Models\Assignment;
use App\Models\CalendarEvent;
use App\Models\Quiz;
use App\Models\TeacherSubject;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StudentCalendarController extends Controller
{
    /**
     * Tampilkan kalender akademik beserta tenggat tugas dan jadwal ujian.
     */
    public function index(Request $request): Response
    {
        $student = $request->user()->student;
        $activeYear = AcademicYear::where('is_active', true)->first();

        // Agenda resmi sekolah
        $events = CalendarEvent::orderBy('start_date')->get()->map(fn ($e) => [
            'id' => 'event-' . $e->id,
            'title' => $e->title,
            'description' => $e->description,
            'date' => $e->start_date->format('Y-m-d'),
            'type' => 'event',
            'type_label' => 'Agenda Sekolah',
            'category' => $e->category,
        ]);

        // Tenggat waktu tugas siswa
        $classIds = $student->enrollments()->pluck('class_id');
        $tsIds = TeacherSubject::whereIn('class_id', $classIds)->pluck('id');

        $assignments = Assignment::whereIn('teacher_subject_id', $tsIds)
            ->whereNotNull('deadline_at')
            ->with('teacherSubject.subject')
            ->get()
            ->map(fn ($a) => [
                'id' => 'assignment-' . $a->id,
                'title' => 'Deadline Tugas: ' . $a->title,
                'description' => 'Mata Pelajaran: ' . $a->teacherSubject->subject->name,
                'date' => $a->deadline_at->format('Y-m-d'),
                'type' => 'assignment',
                'type_label' => 'Tenggat Tugas',
                'category' => 'tugas',
            ]);

        // Jadwal kuis / ujian
        $quizzes = Quiz::whereIn('teacher_subject_id', $tsIds)
            ->where('is_published', true)
            ->whereNotNull('start_at')
            ->with('teacherSubject.subject')
            ->get()
            ->map(fn ($q) => [
                'id' => 'quiz-' . $q->id,
                'title' => ($q->type === 'exam' ? 'Jadwal Ujian: ' : 'Jadwal Kuis: ') . $q->title,
                'description' => 'Mata Pelajaran: ' . $q->teacherSubject->subject->name,
                'date' => $q->start_at->format('Y-m-d'),
                'type' => 'quiz',
                'type_label' => $q->type === 'exam' ? 'Ujian Resmi' : 'Kuis Harian',
                'category' => 'ujian',
            ]);

        $allEvents = $events->concat($assignments)->concat($quizzes)->sortBy('date')->values();

        return Inertia::render('Student/Calendar/Index', [
            'events' => $allEvents,
            'academicYear' => $activeYear?->name,
        ]);
    }
}
