import { BookOpen, CalendarClock, ClipboardCheck, GraduationCap, History, School } from 'lucide-react';
import { usePage } from '@inertiajs/react';
import DataTable from '../../Components/DataTable';
import StatCard from '../../Components/StatCard';
import { Badge, Card, EmptyState, PageHeader } from '../../Components/ui';
import AppLayout from '../../Layouts/AppLayout';
import { formatDateTime, timeAgo } from '../../lib/format';

function GreetingCard({ user, stats }) {
    const hour = new Date().getHours();
    let greeting = 'Selamat Pagi';
    if (hour >= 11 && hour < 15) greeting = 'Selamat Siang';
    else if (hour >= 15 && hour < 18) greeting = 'Selamat Sore';
    else if (hour >= 18 || hour < 4) greeting = 'Selamat Malam';

    return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-800 via-slate-700 to-teal-700 px-6 py-7 text-white shadow-lg">
            <div className="relative z-10">
                <p className="text-brand-200 text-sm font-medium">{greeting},</p>
                <h2 className="mt-1 text-2xl font-bold">{user.name}!</h2>
                <p className="mt-2 text-sm text-white/75 max-w-lg">
                    Pantau kelas dan kelola materi pembelajaran Anda dari sini.
                </p>
                <div className="mt-5 inline-flex items-center gap-3 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 backdrop-blur-sm">
                    <span className="grid size-8 place-items-center rounded-lg bg-white/15 text-sm font-bold text-white">{stats.students}</span>
                    <span className="text-sm text-white/80">Total Siswa</span>
                </div>
            </div>
            <div className="absolute -right-6 -top-6 size-32 rounded-full bg-white/5" />
            <div className="absolute -right-2 top-8 size-20 rounded-full bg-white/5" />
            <div className="absolute right-16 -bottom-4 size-16 rounded-full bg-white/5" />
        </div>
    );
}

const columns = [
    { key: 'student', label: 'Siswa', render: (r) => <span className="font-medium text-brand-950">{r.student}</span> },
    {
        key: 'assignment',
        label: 'Tugas',
        render: (r) => (
            <div>
                <p className="font-medium text-brand-950">{r.assignment}</p>
                <p className="text-xs text-ink/60">
                    {r.subject}, {r.class}
                </p>
            </div>
        ),
    },
    {
        key: 'submitted_at',
        label: 'Dikumpulkan',
        render: (r) => (
            <div className="flex flex-wrap items-center gap-2">
                <span className="whitespace-nowrap">{formatDateTime(r.submitted_at)}</span>
                {r.is_late && <Badge tone="warning">Terlambat</Badge>}
            </div>
        ),
    },
];

export default function Dashboard({ stats, pending, exams, activities }) {
    const { auth } = usePage().props;

    return (
        <AppLayout title="Dashboard Guru">
            <GreetingCard user={auth.user} stats={stats} />

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard icon={School} label="Kelas Diampu" value={stats.classes} tone="brand" />
                <StatCard icon={GraduationCap} label="Jumlah Siswa" value={stats.students} tone="sky" />
                <StatCard icon={BookOpen} label="Materi Diunggah" value={stats.materials} tone="gold" />
                <StatCard icon={ClipboardCheck} label="Perlu Diperiksa" value={stats.to_grade} hint="Tugas belum dinilai" tone="rose" />
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
                <Card title="Tugas yang Perlu Diperiksa" className="lg:col-span-2" padded={false}>
                    <DataTable
                        columns={columns}
                        rows={pending}
                        searchKeys={['student', 'assignment', 'subject', 'class']}
                        emptyTitle="Semua tugas sudah diperiksa"
                        emptyText="Tugas baru dari siswa akan muncul di sini."
                    />
                </Card>

                <div className="space-y-6">
                    <Card title="Jadwal Ujian & Kuis" padded={false}>
                        {exams.length === 0 ? (
                            <EmptyState icon={CalendarClock} title="Belum ada jadwal" text="Ujian yang sudah dipublikasikan tampil di sini." />
                        ) : (
                            <ul className="divide-y divide-ink/10">
                                {exams.map((e) => (
                                    <li key={e.id} className="px-5 py-3.5 hover:bg-brand-50/40 transition">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-center gap-3">
                                                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-100 text-brand-600">
                                                    <CalendarClock size={14} />
                                                </span>
                                                <div>
                                                    <p className="text-sm font-semibold text-brand-950">{e.title}</p>
                                                    <p className="mt-0.5 text-xs text-ink/60">
                                                        {e.class}, {formatDateTime(e.start_at)}, {e.duration} menit
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge tone="info">{e.type}</Badge>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Card>

                    <Card title="Aktivitas Terbaru Siswa" padded={false}>
                        {activities.length === 0 ? (
                            <EmptyState icon={History} title="Belum ada aktivitas" />
                        ) : (
                            <ul className="divide-y divide-ink/10">
                                {activities.map((a, i) => (
                                    <li key={i} className="flex items-start gap-3 px-5 py-3.5 hover:bg-brand-50/40 transition text-sm">
                                        <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-sky-100 text-sky-600">
                                            <History size={13} />
                                        </span>
                                        <div className="min-w-0">
                                            <p>
                                                <span className="font-semibold text-brand-950">{a.student}</span>{' '}
                                                <span className="text-ink/70">{a.text}</span>
                                            </p>
                                            <p className="text-xs text-ink/50">{timeAgo(a.at)}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
