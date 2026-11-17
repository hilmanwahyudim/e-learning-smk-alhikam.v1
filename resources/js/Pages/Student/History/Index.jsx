import {
    Award,
    BookOpen,
    CheckCircle2,
    Clock,
    FileText,
    History,
} from 'lucide-react';
import { Badge, Card, EmptyState, PageHeader } from '../../../Components/ui';
import AppLayout from '../../../Layouts/AppLayout';

export default function Index({ timeline }) {
    return (
        <AppLayout title="Riwayat Belajar Saya">
            <PageHeader
                title="Riwayat Jejak Pembelajaran"
                subtitle="Rekaman runut waktu seluruh aktivitas belajar, pengumpulan tugas, dan penyelesaian ujian Anda."
            />

            {timeline.length === 0 ? (
                <Card>
                    <EmptyState
                        icon={<History size={32} />}
                        title="Belum ada riwayat aktivitas"
                        description="Aktivitas belajar kamu akan mulai tercatat saat kamu membaca materi, mengumpulkan tugas, atau mengerjakan kuis."
                    />
                </Card>
            ) : (
                <div className="relative border-l-2 border-brand-200 ml-4 space-y-6 pb-8">
                    {timeline.map((item, idx) => {
                        const isAssignment = item.type === 'assignment';
                        const isMaterial = item.type === 'material';
                        const isQuiz = item.type === 'quiz';

                        return (
                            <div key={idx} className="relative pl-6">
                                {/* Dot on timeline */}
                                <div
                                    className={`absolute -left-[17px] top-1 flex size-8 items-center justify-center rounded-full border-2 border-white shadow-sm ${
                                        isAssignment
                                            ? 'bg-amber-500 text-white'
                                            : isMaterial
                                            ? 'bg-emerald-500 text-white'
                                            : 'bg-brand-600 text-white'
                                    }`}
                                >
                                    {isAssignment ? (
                                        <FileText size={14} />
                                    ) : isMaterial ? (
                                        <BookOpen size={14} />
                                    ) : (
                                        <Award size={14} />
                                    )}
                                </div>

                                <div className="rounded-xl border border-ink/10 bg-white p-4 shadow-sm hover:border-brand-200 transition">
                                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                                        <div className="flex items-center gap-2">
                                            <Badge
                                                tone={
                                                    isAssignment
                                                        ? 'warning'
                                                        : isMaterial
                                                        ? 'success'
                                                        : 'primary'
                                                }
                                            >
                                                {isAssignment
                                                    ? 'Tugas'
                                                    : isMaterial
                                                    ? 'Materi'
                                                    : 'Kuis/Ujian'}
                                            </Badge>
                                            <span className="text-xs font-semibold text-brand-700">
                                                {item.subject}
                                            </span>
                                        </div>
                                        <span className="flex items-center gap-1 text-[11px] text-ink/40">
                                            <Clock size={11} />
                                            {item.timestamp}
                                        </span>
                                    </div>

                                    <h3 className="text-sm font-bold text-brand-950 mt-1">{item.title}</h3>
                                    <p className="text-xs text-ink/60 mt-0.5">{item.detail}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </AppLayout>
    );
}
