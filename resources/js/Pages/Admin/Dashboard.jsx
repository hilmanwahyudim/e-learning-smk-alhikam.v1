import { Activity, BookOpen, ClipboardList, FileText, GraduationCap, School, Users } from 'lucide-react';
import { ActivityChart, DonutChart } from '../../Components/Charts';
import StatCard from '../../Components/StatCard';
import { Card, EmptyState, PageHeader } from '../../Components/ui';
import AppLayout from '../../Layouts/AppLayout';
import { shortDay, timeAgo } from '../../lib/format';
import { usePage } from '@inertiajs/react';

function GreetingCard({ user }) {
    const hour = new Date().getHours();
    let greeting = 'Selamat Pagi';
    if (hour >= 11 && hour < 15) greeting = 'Selamat Siang';
    else if (hour >= 15 && hour < 18) greeting = 'Selamat Sore';
    else if (hour >= 18 || hour < 4) greeting = 'Selamat Malam';

    return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-800/95 via-slate-700/90 to-teal-700/90 px-6 py-7 text-white shadow-lg">
            <div className="relative z-10">
                <p className="text-brand-200 text-sm font-medium">{greeting},</p>
                <h2 className="mt-1 text-2xl font-bold">{user.name}!</h2>
                <p className="mt-2 text-sm text-white/75 max-w-lg">
                    Kelola dan pantau seluruh aktivitas e-learning SMK Al Hikam dari dashboard ini.
                </p>
            </div>
            <div className="absolute -right-6 -top-6 size-32 rounded-full bg-white/5" />
            <div className="absolute -right-2 top-8 size-20 rounded-full bg-white/5" />
            <div className="absolute right-16 -bottom-4 size-16 rounded-full bg-white/5" />
        </div>
    );
}

export default function Dashboard({ stats, activity, submissions, recent }) {
    const { auth } = usePage().props;

    return (
        <AppLayout title="Dashboard Administrator">
            <GreetingCard user={auth.user} />

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard icon={Users} label="Total Guru" value={stats.teachers} tone="brand" />
                <StatCard icon={GraduationCap} label="Total Siswa" value={stats.students} tone="sky" />
                <StatCard icon={School} label="Total Kelas" value={stats.classes} hint="Tahun ajaran aktif" tone="gold" />
                <StatCard icon={BookOpen} label="Mata Pelajaran" value={stats.subjects} tone="rose" />
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
                <Card title="Aktivitas Pembelajaran" subtitle="7 hari terakhir" className="lg:col-span-2">
                    <ActivityChart labels={activity.labels.map(shortDay)} values={activity.values} />
                </Card>
                <Card title="Pengumpulan Tugas">
                    <DonutChart labels={submissions.labels} values={submissions.values} />
                </Card>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
                <Card title="Aktivitas Terbaru" className="lg:col-span-2" padded={false}>
                    {recent.length === 0 ? (
                        <EmptyState icon={Activity} title="Belum ada aktivitas" text="Aktivitas pengguna akan muncul di sini." />
                    ) : (
                        <ul className="divide-y divide-ink/10">
                            {recent.map((log) => (
                                <li key={log.id} className="flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-brand-50/40 transition text-sm">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-100 text-brand-600">
                                            <Activity size={14} />
                                        </span>
                                        <p className="min-w-0">
                                            <span className="font-semibold text-brand-950">{log.user}</span>
                                            {log.role && <span className="text-ink/50"> ({log.role})</span>}
                                            <span className="text-ink/70">: {log.description}</span>
                                        </p>
                                    </div>
                                    <time dateTime={log.at} className="shrink-0 text-xs text-ink/50">
                                        {timeAgo(log.at)}
                                    </time>
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>

                <Card title="Ringkasan Data">
                    <div className="space-y-4">
                        <StatItem label="Total Materi" value={stats.materials} icon={FileText} color="brand" />
                        <StatItem label="Tugas Aktif" value={stats.active_assignments} icon={ClipboardList} color="gold" />
                    </div>
                </Card>
            </div>
        </AppLayout>
    );
}

function StatItem({ label, value, icon: Icon, color = 'brand' }) {
    const colors = {
        brand: 'bg-brand-100 text-brand-600',
        gold: 'bg-gold-400/25 text-gold-600',
        sky: 'bg-sky-100 text-sky-600',
        rose: 'bg-rose-100 text-rose-600',
    };

    return (
        <div className="flex items-center gap-3 rounded-xl bg-paper p-4">
            <span className={`grid size-10 place-items-center rounded-lg ${colors[color]}`}>
                <Icon size={18} />
            </span>
            <div>
                <p className="text-xs text-ink/60">{label}</p>
                <p className="text-xl font-bold text-brand-950">{value}</p>
            </div>
        </div>
    );
}
