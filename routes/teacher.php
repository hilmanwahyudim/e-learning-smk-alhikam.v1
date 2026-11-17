<?php

use App\Http\Controllers\Teacher\DashboardController;
use App\Http\Controllers\Teacher\TeacherAnnouncementController;
use App\Http\Controllers\Teacher\TeacherAssignmentController;
use App\Http\Controllers\Teacher\TeacherClassController;
use App\Http\Controllers\Teacher\TeacherGradeController;
use App\Http\Controllers\Teacher\TeacherGradingController;
use App\Http\Controllers\Teacher\TeacherMaterialController;
use App\Http\Controllers\Teacher\TeacherQuestionController;
use App\Http\Controllers\Teacher\TeacherQuizController;
use Illuminate\Support\Facades\Route;

// Prefix '/teacher' dan nama 'teacher.' diatur di bootstrap/app.php
Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

// Kelas saya & LMS Mapel
Route::get('/classes', [TeacherClassController::class, 'index'])->name('classes.index');
Route::get('/classes/{teacherSubject}', [TeacherClassController::class, 'show'])->name('classes.show');

// Materi Pembelajaran
Route::resource('materials', TeacherMaterialController::class)->except(['create', 'edit', 'show']);
Route::post('materials/{material}/archive', [TeacherMaterialController::class, 'toggleArchive'])->name('materials.archive');
Route::get('materials/{material}/download/{file}', [TeacherMaterialController::class, 'downloadFile'])->name('materials.download');
Route::get('/archive', fn () => redirect()->route('teacher.materials.index', ['archived' => 1]))->name('archive.index');

// Tugas Online
Route::resource('assignments', TeacherAssignmentController::class)->except(['create', 'edit']);
Route::get('assignments/{assignment}/download/{file}', [TeacherAssignmentController::class, 'downloadFile'])->name('assignments.download');
Route::get('submissions/{submission}/download', [TeacherAssignmentController::class, 'downloadSubmission'])->name('submissions.download');

// Bank Soal
Route::resource('questions', TeacherQuestionController::class)->except(['create', 'edit', 'show']);

// Kuis & Ujian Online
Route::resource('quizzes', TeacherQuizController::class)->except(['create', 'edit']);
Route::post('quizzes/{quiz}/questions', [TeacherQuizController::class, 'addQuestions'])->name('quizzes.questions.add');
Route::delete('quizzes/{quiz}/questions/{question}', [TeacherQuizController::class, 'removeQuestion'])->name('quizzes.questions.remove');

// Tahap 6: Koreksi Penilaian
Route::get('grading', [TeacherGradingController::class, 'index'])->name('grading.index');
Route::post('grading/assignment/{submission}', [TeacherGradingController::class, 'gradeAssignment'])->name('grading.assignment');
Route::get('grading/quiz-attempt/{attempt}', [TeacherGradingController::class, 'showQuizAttempt'])->name('grading.quiz-attempt.show');
Route::post('grading/quiz-attempt/{attempt}', [TeacherGradingController::class, 'gradeQuizAttempt'])->name('grading.quiz-attempt.grade');

// Tahap 6: Rekap Nilai & Ekspor
Route::get('grades', [TeacherGradeController::class, 'index'])->name('grades.index');
Route::get('grades/export-csv', [TeacherGradeController::class, 'exportCsv'])->name('grades.export-csv');
Route::get('grades/print', [TeacherGradeController::class, 'print'])->name('grades.print');

// Tahap 6: Pengumuman Guru
Route::resource('announcements', TeacherAnnouncementController::class)->except(['create', 'edit', 'show']);
