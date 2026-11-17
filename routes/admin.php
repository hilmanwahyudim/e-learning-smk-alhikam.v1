<?php

use App\Http\Controllers\Admin\AcademicYearController;
use App\Http\Controllers\Admin\ActivityLogController;
use App\Http\Controllers\Admin\AdminAnnouncementController;
use App\Http\Controllers\Admin\AdminReportController;
use App\Http\Controllers\Admin\ClassroomController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\DepartmentController;
use App\Http\Controllers\Admin\SchoolProfileController;
use App\Http\Controllers\Admin\StudentController;
use App\Http\Controllers\Admin\SubjectController;
use App\Http\Controllers\Admin\TeacherController;
use App\Http\Controllers\Admin\TeacherSubjectController;
use App\Http\Controllers\Admin\UserController;
use Illuminate\Support\Facades\Route;

// Prefix '/admin' dan nama 'admin.' diatur di bootstrap/app.php
Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

// 1. Jurusan / Program Keahlian
Route::resource('departments', DepartmentController::class)->except(['create', 'edit', 'show']);

// 2. Tahun Ajaran & Semester
Route::resource('academic-years', AcademicYearController::class)->except(['create', 'edit', 'show']);
Route::post('academic-years/{academic_year}/set-active', [AcademicYearController::class, 'setActive'])->name('academic-years.set-active');
Route::post('academic-years/{academic_year}/semesters', [AcademicYearController::class, 'storeSemester'])->name('academic-years.semesters.store');
Route::put('semesters/{semester}', [AcademicYearController::class, 'updateSemester'])->name('semesters.update');
Route::post('semesters/{semester}/set-active', [AcademicYearController::class, 'setActiveSemester'])->name('semesters.set-active');

// 3. Kelas
Route::resource('classes', ClassroomController::class)->except(['create', 'edit']);
Route::post('classes/{class}/enroll', [ClassroomController::class, 'enrollStudent'])->name('classes.enroll');
Route::delete('enrollments/{enrollment}', [ClassroomController::class, 'removeStudent'])->name('enrollments.destroy');

// 4. Mata Pelajaran
Route::resource('subjects', SubjectController::class)->except(['create', 'edit', 'show']);

// 5. Guru
Route::resource('teachers', TeacherController::class)->except(['create', 'edit', 'show']);

// 6. Siswa
Route::resource('students', StudentController::class)->except(['create', 'edit', 'show']);

// 7. Pembagian Guru & Mapel
Route::resource('teacher-subjects', TeacherSubjectController::class)->except(['create', 'edit', 'show']);

// Pengumuman Sekolah
Route::resource('announcements', AdminAnnouncementController::class)->except(['create', 'edit', 'show']);

// Laporan Nilai Akademik
Route::get('reports', [AdminReportController::class, 'index'])->name('reports.index');
Route::get('reports/export-csv', [AdminReportController::class, 'exportCsv'])->name('reports.export-csv');

// Tahap 7: Manajemen Pengguna
Route::get('users', [UserController::class, 'index'])->name('users.index');
Route::post('users/{user}/reset-password', [UserController::class, 'resetPassword'])->name('users.reset-password');
Route::post('users/{user}/toggle-active', [UserController::class, 'toggleActive'])->name('users.toggle-active');
Route::delete('users/{user}', [UserController::class, 'destroy'])->name('users.destroy');

// Tahap 7: Log Aktivitas Sistem
Route::get('activity', [ActivityLogController::class, 'index'])->name('activity.index');

// Tahap 7: Profil Identitas Sekolah
Route::get('school', [SchoolProfileController::class, 'edit'])->name('school.edit');
Route::put('school', [SchoolProfileController::class, 'update'])->name('school.update');
