import { Link, router } from '@inertiajs/react';
import { AlertCircle, CheckCircle2, Clock, ClipboardList, ExternalLink } from 'lucide-react';
import { Badge, Card, EmptyState, PageHeader } from '../../../Components/ui';
import AppLayout from '../../../Layouts/AppLayout';

const STATUS_CONFIG = {
    not_submitted: { label: 'Belum Dikerjakan', tone: 'neutral', icon: Clock },
    submitted: { label: 'Sudah Dikumpulkan', tone: 'info', icon: CheckCircle2 },
    late: { label: 'Terlambat', tone: 'warning', icon: AlertCircle },
    graded: { label: 'Sudah Dinilai', tone: 'success', icon: CheckCircle2 },
};

export default function Index({ assignments, filter }) {
    const setFilter = (val) => {
        router.get('/student/assignments', { filter: val }, { preserveState: true, replace: true });
    };

    const filters = [
        { key: 'all', label: 'Semua' },
        { key: 'pending', label: 'Belum Selesai' },
        { key: 'completed', label: 'Sudah Dikumpulkan' },
    ];

    return (
        <AppLayout title="Tugas Saya">
            <PageHeader
                title="Tugas Saya"
                subtitle="Daftar seluruh tugas dari semua mata pelajaran yang kamu ikuti."
            />

            {/* Filter tabs */}
            <div className="mb-4 flex items-center gap-2">
                {filters.map((f) => (
                    <button
                        key={f.key}
                        type="button"
                        onClick={() => setFilter(f.key)}
                        className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                            filter === f.key
                                ? 'bg-brand-600 text-white shadow-sm'
                                : 'bg-white text-ink/70 border border-ink/15 hover:border-brand-300 hover:text-brand-700'
                        }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {assignments.length === 0 ? (
                <Card>
                    <EmptyState
                        icon={<ClipboardList size={32} />}
                        title="Tidak ada tugas"
                        description="Belum ada tugas yang perlu dikerjakan untuk filter ini."
                    />
                </Card>
            ) : (
                <div className="space-y-3">
                    {assignments.map((assignment) => {
                        const cfg = STATUS_CONFIG[assignment.status] ?? STATUS_CONFIG.not_submitted;
                        const StatusIcon = cfg.icon;

                        return (
                            <div
                                key={assignment.id}
                                className="flex items-center gap-4 rounded-xl border border-ink/10 bg-white p-4 shadow-sm hover:border-brand-200 hover:shadow-md transition"
                            >
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                                    <ClipboardList size={20} />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                                        <span className="text-xs font-semibold text-brand-600">
                                            {assignment.subject_name}
                                        </span>
                                        <span className="text-xs text-ink/40">•</span>
                                        <span className="text-xs text-ink/60">{assignment.class_name}</span>
                                    </div>
                                    <h3 className="text-sm font-bold text-brand-950 truncate">{assignment.title}</h3>
                                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-ink/60">
                                        <span className="flex items-center gap-1">
                                            <Clock size={11} />
                                            {assignment.deadline_at
                                                ? `Deadline: ${assignment.deadline_at}`
                                                : 'Tanpa deadline'}
                                        </span>
                                        {assignment.is_past_deadline && assignment.status === 'not_submitted' && (
                                            <span className="font-semibold text-red-600 flex items-center gap-1">
                                                <AlertCircle size={11} />
                                                Sudah Lewat Deadline
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 shrink-0">
                                    {assignment.status === 'graded' && assignment.score !== null && (
                                        <div className="text-right">
                                            <p className="text-xs text-ink/50">Nilai</p>
                                            <p className="text-lg font-bold text-brand-950">
                                                {assignment.score}
                                                <span className="text-xs font-normal text-ink/50">
                                                    /{assignment.max_score}
                                                </span>
                                            </p>
                                        </div>
                                    )}
                                    <Badge tone={cfg.tone}>
                                        <StatusIcon size={12} className="mr-1" />
                                        {cfg.label}
                                    </Badge>
                                    <Link
                                        href={`/student/assignments/${assignment.id}`}
                                        className="grid size-8 place-items-center rounded-lg text-ink/50 hover:bg-brand-50 hover:text-brand-700 transition"
                                        title="Lihat Detail"
                                    >
                                        <ExternalLink size={15} />
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </AppLayout>
    );
}
