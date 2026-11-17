import {
    Activity,
    Archive,
    Award,
    BookOpen,
    CalendarDays,
    ClipboardCheck,
    ClipboardList,
    Database,
    FileText,
    GraduationCap,
    History,
    LayoutDashboard,
    Library,
    Megaphone,
    School,
    Settings,
    KeyRound,
    Users,
} from 'lucide-react';

/**
 * Menu sidebar per role.
 * ready: true  -> tautan aktif.
 * ready: false -> tampil abu-abu "Segera"; ubah ke true saat modulnya dibuat.
 */
const menus = {
    admin: [
        { items: [{ label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, ready: true }] },
        {
            heading: 'Data master',
            items: [
                { label: 'Guru', href: '/admin/teachers', icon: Users, ready: true },
                { label: 'Siswa', href: '/admin/students', icon: GraduationCap, ready: true },
                { label: 'Kelas', href: '/admin/classes', icon: School, ready: true },
                { label: 'Jurusan', href: '/admin/departments', icon: Library, ready: true },
                { label: 'Mata pelajaran', href: '/admin/subjects', icon: BookOpen, ready: true },
                { label: 'Tahun ajaran', href: '/admin/academic-years', icon: CalendarDays, ready: true },
                { label: 'Pembagian guru', href: '/admin/teacher-subjects', icon: ClipboardList, ready: true },
            ],
        },
        {
            heading: 'Sistem',
            items: [
                { label: 'Akun pengguna', href: '/admin/users', icon: KeyRound, ready: true },
                { label: 'Pengumuman', href: '/admin/announcements', icon: Megaphone, ready: true },
                { label: 'Aktivitas', href: '/admin/activity', icon: Activity, ready: true },
                { label: 'Laporan nilai', href: '/admin/reports', icon: FileText, ready: true },
                { label: 'Profil sekolah', href: '/admin/school', icon: Settings, ready: true },
            ],
        },
    ],
    teacher: [
        { items: [{ label: 'Dashboard', href: '/teacher/dashboard', icon: LayoutDashboard, ready: true }] },
        {
            heading: 'Pembelajaran',
            items: [
                { label: 'Kelas saya', href: '/teacher/classes', icon: School, ready: true },
                { label: 'Materi', href: '/teacher/materials', icon: BookOpen, ready: true },
                { label: 'Tugas', href: '/teacher/assignments', icon: ClipboardList, ready: true },
                { label: 'Kuis dan ujian', href: '/teacher/quizzes', icon: ClipboardCheck, ready: true },
                { label: 'Bank soal', href: '/teacher/questions', icon: Database, ready: true },
                { label: 'Arsip materi', href: '/teacher/archive', icon: Archive, ready: true },
            ],
        },
        {
            heading: 'Penilaian',
            items: [
                { label: 'Koreksi tugas', href: '/teacher/grading', icon: ClipboardCheck, ready: true },
                { label: 'Rekap nilai', href: '/teacher/grades', icon: Award, ready: true },
                { label: 'Pengumuman', href: '/teacher/announcements', icon: Megaphone, ready: true },
            ],
        },
    ],
    student: [
        { items: [{ label: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard, ready: true }] },
        {
            heading: 'Belajar',
            items: [
                { label: 'Mata pelajaran', href: '/student/subjects', icon: BookOpen, ready: true },
                { label: 'Tugas', href: '/student/assignments', icon: ClipboardList, ready: true },
                { label: 'Kuis dan ujian', href: '/student/quizzes', icon: ClipboardCheck, ready: true },
                { label: 'Nilai', href: '/student/grades', icon: Award, ready: true },
            ],
        },
        {
            heading: 'Informasi',
            items: [
                { label: 'Kalender', href: '/student/calendar', icon: CalendarDays, ready: true },
                { label: 'Pengumuman', href: '/student/announcements', icon: Megaphone, ready: true },
                { label: 'Riwayat belajar', href: '/student/history', icon: History, ready: true },
            ],
        },
    ],
};

export const navigationFor = (role) =>
    (menus[role] ?? []).map((group) => ({
        ...group,
        items: group.items.map((item) => ({ ready: false, ...item })),
    }));
