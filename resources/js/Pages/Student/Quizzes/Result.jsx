import { Link } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    CheckCircle2,
    Clock,
    HelpCircle,
    Star,
    XCircle,
} from 'lucide-react';
import { Badge } from '../../../Components/ui';
import AppLayout from '../../../Layouts/AppLayout';

const STATUS_CONFIG = {
    graded: { label: 'Sudah Dinilai', tone: 'success' },
    submitted: { label: 'Menunggu Penilaian', tone: 'info' },
    in_progress: { label: 'Belum Selesai', tone: 'warning' },
};

export default function Result({ attempt, review }) {
    const cfg = STATUS_CONFIG[attempt.status] ?? { label: attempt.status, tone: 'neutral' };
    const scorePercent =
        attempt.total_score !== null
            ? Math.round((attempt.total_score / ((attempt.max_score ?? attempt.total_score) || 1)) * 100)
            : null;

    return (
        <AppLayout title={`Hasil: ${attempt.quiz_title}`}>
            <div className="mb-4">
                <Link
                    href="/student/quizzes"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 hover:text-brand-900"
                >
                    <ArrowLeft size={14} />
                    <span>Kembali ke Daftar Kuis</span>
                </Link>
            </div>

            {/* Score card */}
            <div className="mb-6 overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-md">
                <div className="bg-gradient-to-r from-brand-700 to-brand-900 px-6 py-8 text-center text-white">
                    <h1 className="text-lg font-bold mb-1 opacity-90">{attempt.quiz_title}</h1>
                    <p className="text-sm opacity-70">{attempt.subject_name}</p>

                    <div className="mt-6">
                        {attempt.status === 'submitted' ? (
                            <div>
                                <Clock size={40} className="mx-auto mb-2 opacity-70" />
                                <p className="text-xl font-bold">Menunggu Penilaian</p>
                                <p className="text-sm opacity-70 mt-1">
                                    Jawabanmu sudah dikumpulkan. Guru akan memberikan nilai segera.
                                </p>
                            </div>
                        ) : attempt.total_score !== null ? (
                            <div>
                                <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-white/20 mx-auto mb-2">
                                    <span className="text-4xl font-black text-white">
                                        {attempt.total_score}
                                    </span>
                                </div>
                                {attempt.auto_score !== null && attempt.auto_score !== attempt.total_score && (
                                    <p className="text-xs opacity-60 mt-1">
                                        (Skor Otomatis: {attempt.auto_score})
                                    </p>
                                )}
                                <p className="mt-2 text-sm opacity-80">Nilai Akhir Kamu</p>
                            </div>
                        ) : attempt.auto_score !== null ? (
                            <div>
                                <Star size={36} className="mx-auto mb-2 fill-yellow-300 text-yellow-300" />
                                <p className="text-3xl font-black">{attempt.auto_score}</p>
                                <p className="text-sm opacity-70 mt-1">Skor Otomatis (Essay perlu dinilai guru)</p>
                            </div>
                        ) : (
                            <div>
                                <CheckCircle2 size={40} className="mx-auto mb-2 text-green-300" />
                                <p className="text-xl font-bold">Ujian Selesai</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Detail row */}
                <div className="grid grid-cols-2 divide-x divide-ink/10 border-t border-ink/10 sm:grid-cols-4">
                    {[
                        { label: 'Status', value: <Badge tone={cfg.tone}>{cfg.label}</Badge> },
                        { label: 'Waktu Mulai', value: attempt.started_at },
                        { label: 'Selesai', value: attempt.finished_at ?? '—' },
                        {
                            label: 'Jawaban Benar',
                            value: review
                                ? `${review.filter((r) => r.is_correct).length}/${review.length}`
                                : '—',
                        },
                    ].map(({ label, value }) => (
                        <div key={label} className="p-4 text-center">
                            <p className="text-xs text-ink/50 mb-1">{label}</p>
                            <div className="text-sm font-semibold text-brand-950">{value}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Review section */}
            {review ? (
                <div className="space-y-4">
                    <h2 className="text-base font-bold text-brand-950">Pembahasan Jawaban</h2>
                    {review.map((item, idx) => (
                        <div
                            key={idx}
                            className={`rounded-xl border p-5 ${
                                item.is_correct === true
                                    ? 'border-green-200 bg-green-50'
                                    : item.is_correct === false
                                    ? 'border-red-200 bg-red-50'
                                    : 'border-ink/10 bg-white'
                            }`}
                        >
                            <div className="flex items-start gap-3">
                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white border border-ink/15 text-xs font-bold text-brand-950">
                                    {idx + 1}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                        <span className="text-xs text-ink/50">{item.question_type}</span>
                                        {item.is_correct === true && (
                                            <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700">
                                                <CheckCircle2 size={13} /> Benar
                                            </span>
                                        )}
                                        {item.is_correct === false && (
                                            <span className="inline-flex items-center gap-1 text-xs font-bold text-red-700">
                                                <XCircle size={13} /> Salah
                                            </span>
                                        )}
                                        {item.is_correct === null && (
                                            <span className="inline-flex items-center gap-1 text-xs font-bold text-ink/50">
                                                <HelpCircle size={13} /> Dinilai Manual
                                            </span>
                                        )}
                                        {item.score !== null && item.score !== undefined && (
                                            <span className="ml-auto text-xs font-semibold text-brand-700">
                                                +{item.score} poin
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm font-semibold text-brand-950 mb-3 leading-relaxed">
                                        {item.question_body}
                                    </p>

                                    <div className="text-sm space-y-1">
                                        <p className="text-ink/70">
                                            <span className="font-semibold">Jawaban kamu:</span>{' '}
                                            <span
                                                className={
                                                    item.is_correct === true
                                                        ? 'text-green-700 font-semibold'
                                                        : item.is_correct === false
                                                        ? 'text-red-700'
                                                        : ''
                                                }
                                            >
                                                {item.your_answer ?? '(tidak dijawab)'}
                                            </span>
                                        </p>
                                        {item.feedback && (
                                            <p className="text-ink/70">
                                                <span className="font-semibold">Komentar guru:</span>{' '}
                                                <span className="italic">{item.feedback}</span>
                                            </p>
                                        )}
                                        {item.explanation && (
                                            <div className="mt-2 rounded-lg bg-white/60 p-3 border border-ink/10">
                                                <p className="text-xs font-semibold text-ink/50 mb-1">Pembahasan:</p>
                                                <p className="text-xs text-ink/80">{item.explanation}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : attempt.show_result === false ? (
                <div className="rounded-xl border border-ink/10 bg-white p-8 text-center shadow-sm">
                    <AlertCircle size={36} className="mx-auto text-ink/30 mb-3" />
                    <p className="text-sm font-semibold text-ink/60">
                        Pembahasan jawaban tidak ditampilkan untuk ujian ini.
                    </p>
                </div>
            ) : null}
        </AppLayout>
    );
}
