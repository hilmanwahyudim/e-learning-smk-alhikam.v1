# Tahap 2 - Database & Autentikasi (E-Learning SMK Al Hikam)

Paket ini ditimpa (overlay) di atas proyek Laravel 12 baru. Lihat langkah lengkap di jawaban chat.

## Isi
- 8 migration (semua tabel Tahap 1 + school_profiles + calendar_events)
- 26 model Eloquent (+ User), 3 Enum (Role, SubmissionStatus, QuestionType)
- Auth: AuthController, LoginRequest (rate limit 5x), middleware EnsureRole, LogActivity, HandleInertiaRequests
- Route per role: routes/{admin,teacher,student}.php (didaftarkan di bootstrap/app.php)
- Seeder + UserFactory
- React/Inertia: halaman Login, komponen Logo, halaman stub dashboard
- tests/Feature/AuthTest.php

## Akun dummy (kata sandi semua: password)
admin / guru01..guru04 / siswa01..siswa12
