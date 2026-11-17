import { Link, router } from '@inertiajs/react';
import {
    AlertCircle,
    CheckCircle2,
    ChevronRight,
    Clock,
    HelpCircle,
    Lock,
    Star,
} from 'lucide-react';
import { Badge, Card, EmptyState, PageHeader } from '../../../Components/ui';
import AppLayout from '../../../Layouts/AppLayout';

function QuizStatusBadge({ quiz }) {
    if (quiz.has_in_progress) {
        return <Badge tone="warning">Sedang Dikerjakan</Badge>;
    }
    if (!quiz.is_available) {
        const now = new Date();
        if (quiz.start_at && now < new Date(quiz.start_at)) {
            return <Badge tone="neutral">Belum Dibuka</Badge>;
        }
        return <Badge tone="neutral">Sudah Ditutup</Badge>;
    }
    if (quiz.attempts_used >= quiz.max_attempts) {
        return <Badge tone="success">Selesai</Badge>;
    }
    return <Badge tone="info">Tersedia</Badge>;
}

export default function Index({ quizzes }) {
    const handleStart = (quizId) => {
        router.post(`/student/quizzes/${quizId}/start`);
    };

    return (
        <AppLayout title="Kuis & Ujian Online">
            <PageHeader
                title="Kuis & Ujian Online"
                subtitle="Daftar seluruh kuis dan ujian yang tersedia dari mata pelajaran kamu."
            />

            {quizzes.length === 0 ? (
                <Card>
                    <EmptyState
                        icon={<HelpCircle size={32} />}
                        title="Belum ada kuis atau ujian"
                        description="Guru belum membuat kuis atau ujian yang bisa kamu ikuti saat ini."
                    />
                </Card>
            ) : (
                <div className="space-y-3">
                    {quizzes.map((quiz) => {
                        const canStart =
                            quiz.is_available &&
                            !quiz.has_in_progress &&
                            quiz.attempts_used < quiz.max_attempts;

                        return (
                            <div
                                key={quiz.id}
                                className="flex flex-wrap items-center gap-4 rounded-xl border border-ink/10 bg-white p-5 shadow-sm hover:border-brand-200 transition"
                            >
                                {/* Icon */}
                                <div
                                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                                        quiz.type === 'exam'
                                            ? 'bg-red-100 text-red-600'
                                            : 'bg-brand-100 text-brand-600'
                                    }`}
                                >
                                    {quiz.type === 'exam' ? (
                                        <AlertCircle size={22} />
                                    ) : (
                                        <HelpCircle size={22} />
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                                        <span className="text-xs font-semibold text-brand-600">
                                            {quiz.subject_name}
                                        </span>
                                        <span className="text-xs text-ink/40">•</span>
                                        <span className="text-xs text-ink/60">{quiz.class_name}</span>
                                        <Badge tone={quiz.type === 'exam' ? 'danger' : 'info'}>
                                            {quiz.type === 'exam' ? 'Ujian' : 'Kuis'}
                                        </Badge>
                                    </div>
                                    <h3 className="text-sm font-bold text-brand-950 truncate">{quiz.title}</h3>
                                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-ink/60">
                                        <span className="flex items-center gap-1">
                                            <Clock size={11} />
                                            {quiz.duration_minutes} Menit
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <HelpCircle size={11} />
                                            {quiz.questions_count} Soal
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <CheckCircle2 size={11} />
                                            {quiz.attempts_used}/{quiz.max_attempts} Percobaan
                                        </span>
                                        {quiz.best_score !== null && (
                                            <span className="flex items-center gap-1 text-brand-700 font-semibold">
                                                <Star size={11} className="fill-brand-400 text-brand-400" />
                                                Nilai terbaik: {quiz.best_score}
                                            </span>
                                        )}
                                    </div>
                                    {quiz.start_at && (
                                        <p className="text-xs text-ink/50 mt-0.5">
                                            Jadwal: {quiz.start_at}
                                            {quiz.end_at && ` s/d ${quiz.end_at}`}
                                        </p>
                                    )}
                                </div>

                                {/* Status & action */}
                                <div className="flex items-center gap-3 shrink-0">
                                    <QuizStatusBadge quiz={quiz} />

                                    {quiz.has_in_progress ? (
                                        <Link
                                            href={`/student/attempts/${quiz.in_progress_id}`}
                                            className="inline-flex items-center gap-1.5 rounded-lg bg-yellow-500 px-4 py-2 text-sm font-semibold text-white hover:bg-yellow-600 transition"
                                        >
                                            Lanjutkan
                                            <ChevronRight size={14} />
                                        </Link>
                                    ) : canStart ? (
                                        <Link
                                            href={`/student/quizzes/${quiz.id}`}
                                            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 transition"
                                        >
                                            Lihat Detail
                                            <ChevronRight size={14} />
                                        </Link>
                                    ) : (
                                        <div className="grid size-8 place-items-center text-ink/30">
                                            <Lock size={16} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </AppLayout>
    );
}
