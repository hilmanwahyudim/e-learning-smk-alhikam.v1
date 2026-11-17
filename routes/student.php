<?php

use App\Http\Controllers\Student\DashboardController;
use App\Http\Controllers\Student\StudentAnnouncementController;
use App\Http\Controllers\Student\StudentAssignmentController;
use App\Http\Controllers\Student\StudentCalendarController;
use App\Http\Controllers\Student\StudentGradeController;
use App\Http\Controllers\Student\StudentHistoryController;
use App\Http\Controllers\Student\StudentQuizController;
use App\Http\Controllers\Student\StudentSubjectController;
use Illuminate\Support\Facades\Route;

// Prefix '/student' dan nama 'student.' diatur di bootstrap/app.php
Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

// Mata Pelajaran & Kursus LMS
Route::get('/subjects', [StudentSubjectController::class, 'index'])->name('subjects.index');
Route::get('/subjects/{teacherSubject}', [StudentSubjectController::class, 'show'])->name('subjects.show');
Route::post('/materials/{material}/toggle-progress', [StudentSubjectController::class, 'toggleProgress'])->name('materials.toggle-progress');
Route::get('/materials/{material}/download/{file}', [StudentSubjectController::class, 'downloadFile'])->name('materials.download');

// Tugas Online
Route::get('/assignments', [StudentAssignmentController::class, 'index'])->name('assignments.index');
Route::get('/assignments/{assignment}', [StudentAssignmentController::class, 'show'])->name('assignments.show');
Route::post('/assignments/{assignment}/submit', [StudentAssignmentController::class, 'submit'])->name('assignments.submit');
Route::get('/assignments/{assignment}/download/{file}', [StudentAssignmentController::class, 'downloadFile'])->name('assignments.download');
Route::get('/submissions/{submission}/download', [StudentAssignmentController::class, 'downloadSubmission'])->name('submissions.download');

// Kuis & Ujian Online
Route::get('/quizzes', [StudentQuizController::class, 'index'])->name('quizzes.index');
Route::get('/quizzes/{quiz}', [StudentQuizController::class, 'show'])->name('quizzes.show');
Route::post('/quizzes/{quiz}/start', [StudentQuizController::class, 'start'])->name('quizzes.start');
Route::get('/attempts/{attempt}', [StudentQuizController::class, 'attempt'])->name('attempts.show');
Route::post('/attempts/{attempt}/answer', [StudentQuizController::class, 'saveAnswer'])->name('attempts.answer');
Route::post('/attempts/{attempt}/finish', [StudentQuizController::class, 'finish'])->name('attempts.finish');
Route::get('/attempts/{attempt}/result', [StudentQuizController::class, 'result'])->name('attempts.result');

// Nilai & Transkrip Siswa
Route::get('/grades', [StudentGradeController::class, 'index'])->name('grades.index');
Route::get('/grades/print', [StudentGradeController::class, 'print'])->name('grades.print');

// Pengumuman Siswa
Route::get('/announcements', [StudentAnnouncementController::class, 'index'])->name('announcements.index');

// Tahap 7: Kalender Akademik & Riwayat Belajar
Route::get('/calendar', [StudentCalendarController::class, 'index'])->name('calendar.index');
Route::get('/history', [StudentHistoryController::class, 'index'])->name('history.index');
