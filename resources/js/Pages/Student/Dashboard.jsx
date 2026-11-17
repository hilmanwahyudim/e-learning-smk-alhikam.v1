import { Award, BookOpen, CalendarClock, ClipboardList, Megaphone, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { usePage } from '@inertiajs/react';
import Modal from '../../Components/Modal';
import StatCard from '../../Components/StatCard';
import { Badge, Card, EmptyState, PageHeader, ProgressBar } from '../../Components/ui';
import AppLayout from '../../Layouts/AppLayout';
import { formatDate, formatDateTime, timeAgo, timeUntil } from '../../lib/format';

function GreetingCard({ user, profile }) {
    const hour = new Date().getHours();
    let greeting = 'Selamat Pagi';
    if (hour >= 11 && hour < 15) greeting = 'Selamat Siang';
    else if (hour >= 15 && hour < 18) greeting = 'Selamat Sore';
    else if (hour >= 18 || hour < 4) greeting = 'Selamat Malam';

    const subtitle = profile.class
        ? `${profile.class}${profile.department ? ` | ${profile.department}` : ''}${profile.semester ? ` | Semester ${profile.semester}` : ''}`
        : null;

    return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-800 via-slate-700 to-teal-700 px-6 py-7 text-white shadow-lg">
            <div className="relative z-10">
                <p className="text-brand-200 text-sm font-medium">{greeting},</p>
                <h2 className="mt-1 text-2xl font-bold">{user.name}!</h2>
                {subtitle && (
                    <p className="mt-2 text-sm text-brand-200/90">
                        {subtitle}
                    </p>
                )}
                {!profile.class && (
                    <p className="mt-2 text-sm text-amber-300">
                        Anda belum terdaftar di kelas mana pun. Hubungi administrator sekolah.
                    </p>
                )}
            </div>
            <div className="absolute -right-6 -top-6 size-32 rounded-full bg-white/5" />
            <div className="absolute -right-2 top-8 size-20 rounded-full bg-white/5" />
            <div className="absolute right-16 -bottom-4 size-16 rounded-full bg-white/5" />
        </div>
    );
}

function SubjectCard({ subject }) {
    return (
        <div className="flex items-center gap-4 rounded-xl border border-ink/10 bg-white p-4 hover:border-brand-200 hover:shadow-sm transition">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-100 text-brand-600">
                <BookOpen size={18} />
            </span>
            <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-3">
                    <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-brand-950">{subject.name}</p>
                        <p className="truncate text-xs text-ink/60">{subject.teacher}</p>
                    </div>
                    <p className="shrink-0 text-xs text-ink/60">
                        {subject.done}/{subject.total}
                    </p>
                </div>
                <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-ink/50">Progres</span>
                        <span className="text-[10px] font-bold text-brand-600">{subject.percent}%</span>
                    </div>
                    <ProgressBar value={subject.percent} label={`Progres ${subject.name}`} />
                </div>
            </div>
        </div>
    );
}

export default function Dashboard({ profile, subjects, pending, pending_total, next_deadline, grades, announcements, progress }) {
    const [selected, setSelected] = useState(null);
    const { auth } = usePage().props;

    return (
        <AppLayout title="Dashboard Siswa">
            <GreetingCard user={auth.user} profile={profile} />

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard icon={BookOpen} label="Mata Pelajaran" value={subjects.length} tone="brand" />
                <StatCard icon={ClipboardList} label="Tugas Belum Selesai" value={pending_total} tone="rose" />
                <StatCard
                    icon={CalendarClock}
                    label="Deadline Terdekat"
                    value={next_deadline ? timeUntil(next_deadline.deadline_at) : '-'}
                    hint={next_deadline ? next_deadline.title : 'Tidak ada tugas'}
                    tone="gold"
                />
                <StatCard icon={TrendingUp} label="Progres Belajar" value={`${progress}%`} hint="Materi dipelajari" tone="sky" />
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    {/* Mata Pelajaran */}
                    <Card title="Mata Pelajaran Saya" padded={false}>
                        {subjects.length === 0 ? (
                            <EmptyState icon={BookOpen} title="Belum ada mata pelajaran" text="Mata pelajaran muncul setelah guru ditugaskan ke kelas Anda." />
                        ) : (
                            <div className="divide-y divide-ink/5 p-4 space-y-3">
                                {subjects.map((s) => (
                                    <SubjectCard key={s.id} subject={s} />
                                ))}
                            </div>
                        )}
                    </Card>

                    {/* Tugas */}
                    <Card title="Tugas yang Perlu Dikerjakan" padded={false}>
                        {pending.length === 0 ? (
                            <EmptyState icon={ClipboardList} title="Tidak ada tugas yang menunggu" text="Tugas baru dari guru akan muncul di sini." />
                        ) : (
                            <ul className="divide-y divide-ink/10">
                                {pending.map((t) => (
                                    <li key={t.id} className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-brand-50/40 transition">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-amber-100 text-amber-600">
                                                <ClipboardList size={14} />
                                            </span>
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-semibold text-brand-950">{t.title}</p>
                                                <p className="truncate text-xs text-ink/60">
                                                    {t.subject}, batas {formatDateTime(t.deadline_at)}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge tone={t.overdue ? 'danger' : 'warning'}>{timeUntil(t.deadline_at)}</Badge>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Card>
                </div>

                <div className="space-y-6">
                    {/* Nilai Terbaru */}
                    <Card title="Nilai Terbaru" padded={false}>
                        {grades.length === 0 ? (
                            <EmptyState icon={Award} title="Belum ada nilai" text="Nilai tugas dan ujian tampil setelah dikoreksi guru." />
                        ) : (
                            <ul className="divide-y divide-ink/10">
                                {grades.map((g) => (
                                    <li key={g.id} className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-brand-50/40 transition">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-100 text-brand-600">
                                                <Award size={13} />
                                            </span>
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-semibold text-brand-950">{g.title}</p>
                                                <p className="truncate text-xs text-ink/60">
                                                    {g.category}, {g.subject}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="shrink-0 rounded-lg bg-brand-100 px-2.5 py-1 text-lg font-bold text-brand-700">
                                            {Math.round(g.score)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Card>

                    {/* Pengumuman */}
                    <Card title="Pengumuman Terbaru" padded={false}>
                        {announcements.length === 0 ? (
                            <EmptyState icon={Megaphone} title="Belum ada pengumuman" />
                        ) : (
                            <ul className="divide-y divide-ink/10">
                                {announcements.map((a) => (
                                    <li key={a.id}>
                                        <button
                                            type="button"
                                            onClick={() => setSelected(a)}
                                            className="flex w-full items-start gap-3 px-5 py-3.5 text-left hover:bg-brand-50/40 transition"
                                        >
                                            <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-amber-100 text-amber-600">
                                                <Megaphone size={13} />
                                            </span>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-brand-950">{a.title}</p>
                                                <p className="text-xs text-ink/50">{timeAgo(a.at)}</p>
                                            </div>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Card>
                </div>
            </div>

            <Modal
                open={!!selected}
                onClose={() => setSelected(null)}
                title={selected?.title ?? ''}
                footer={
                    <button
                        type="button"
                        onClick={() => setSelected(null)}
                        className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800"
                    >
                        Tutup
                    </button>
                }
            >
                {selected && (
                    <>
                        <p className="text-xs text-ink/60">
                            {selected.author}, {formatDate(selected.at)}
                        </p>
                        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed">{selected.body}</p>
                    </>
                )}
            </Modal>
        </AppLayout>
    );
}
