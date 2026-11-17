import { Link, router } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    CheckCircle2,
    Clock,
    GraduationCap,
    HelpCircle,
    Play,
    Star,
} from 'lucide-react';
import { Badge, Card } from '../../../Components/ui';
import AppLayout from '../../../Layouts/AppLayout';
import { confirmAction } from '../../../lib/swal';

const STATUS_CONFIG = {
    in_progress: { label: 'Sedang dikerjakan', tone: 'warning' },
    submitted: { label: 'Selesai (Menunggu)', tone: 'info' },
    graded: { label: 'Sudah dinilai', tone: 'success' },
};

export default function Show({ quiz, attempts }) {
    const canStart = quiz.is_available !== false && quiz.attempts_used < quiz.max_attempts && !quiz.has_in_progress;

    const handleStart = async () => {
        const confirmed = await confirmAction({
            title: 'Mulai Kuis/Ujian?',
            text: `Kamu akan memulai "${quiz.title}". Waktu akan berjalan ${quiz.duration_minutes} menit setelah dimulai.`,
            confirmText: 'Ya, Mulai Sekarang',
            danger: false,
        });
        if (confirmed) {
            router.post(`/student/quizzes/${quiz.id}/start`);
        }
    };

    return (
        <AppLayout title={quiz.title}>
            <div className="mb-4">
                <Link
                    href="/student/quizzes"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 hover:text-brand-900"
                >
                    <ArrowLeft size={14} />
                    <span>Kembali ke Daftar Kuis</span>
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Left: Quiz info */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="rounded-xl border border-ink/10 bg-white p-6 shadow-sm">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                            <Badge tone={quiz.type === 'exam' ? 'danger' : 'info'}>
                                {quiz.type === 'exam' ? 'Ujian Resmi' : 'Kuis Harian'}
                            </Badge>
                            <span className="text-xs font-semibold text-brand-600">{quiz.subject_name}</span>
                            <span className="text-xs text-ink/40">•</span>
                            <span className="text-xs text-ink/60 flex items-center gap-1">
                                <GraduationCap size={12} /> {quiz.teacher_name}
                            </span>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-brand-950">{quiz.title}</h1>

                        {/* Stats grid */}
                        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                            {[
                                { label: 'Durasi', value: `${quiz.duration_minutes} Menit`, icon: Clock },
                                { label: 'Jumlah Soal', value: `${quiz.questions_count} Soal`, icon: HelpCircle },
                                { label: 'Percobaan', value: `${quiz.attempts_used}/${quiz.max_attempts}`, icon: CheckCircle2 },
                                {
                                    label: 'Nilai Terbaik',
                                    value: quiz.best_score !== undefined && quiz.best_score !== null ? quiz.best_score : '—',
                                    icon: Star,
                                },
                            ].map(({ label, value, icon: Icon }) => (
                                <div
                                    key={label}
                                    className="rounded-xl bg-paper/60 p-3 border border-ink/10 text-center"
                                >
                                    <Icon size={18} className="mx-auto text-brand-500 mb-1" />
                                    <p className="text-xs text-ink/50">{label}</p>
                                    <p className="text-base font-bold text-brand-950">{value}</p>
                                </div>
                            ))}
                        </div>

                        {quiz.start_at && (
                            <p className="mt-3 text-xs text-ink/60">
                                Jadwal:{' '}
                                <strong>{quiz.start_at}</strong>
                                {quiz.end_at && (
                                    <>
                                        {' '}&nbsp;–&nbsp;{' '}
                                        <strong>{quiz.end_at}</strong>
                                    </>
                                )}
                            </p>
                        )}
                    </div>

                    {/* Instructions */}
                    {quiz.instructions && (
                        <div className="rounded-xl border border-ink/10 bg-white p-6 shadow-sm">
                            <h2 className="text-base font-bold text-brand-950 mb-3">Petunjuk Pengerjaan</h2>
                            <div className="prose prose-sm max-w-none text-ink/80 whitespace-pre-wrap">
                                {quiz.instructions}
                            </div>
                        </div>
                    )}

                    {/* Attempt history */}
                    {attempts.length > 0 && (
                        <Card>
                            <h2 className="text-base font-bold text-brand-950 mb-4">Riwayat Pengerjaan</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-ink/10">
                                            <th className="pb-2 text-left text-xs font-semibold uppercase tracking-wider text-ink/50">
                                                #
                                            </th>
                                            <th className="pb-2 text-left text-xs font-semibold uppercase tracking-wider text-ink/50">
                                                Waktu Mulai
                                            </th>
                                            <th className="pb-2 text-left text-xs font-semibold uppercase tracking-wider text-ink/50">
                                                Selesai
                                            </th>
                                            <th className="pb-2 text-left text-xs font-semibold uppercase tracking-wider text-ink/50">
                                                Status
                                            </th>
                                            <th className="pb-2 text-right text-xs font-semibold uppercase tracking-wider text-ink/50">
                                                Nilai
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-ink/10">
                                        {attempts.map((a, idx) => {
                                            const cfg = STATUS_CONFIG[a.status] ?? {
                                                label: a.status,
                                                tone: 'neutral',
                                            };
                                            return (
                                                <tr key={a.id}>
                                                    <td className="py-2.5 text-ink/50">{idx + 1}</td>
                                                    <td className="py-2.5 text-ink/80">{a.started_at}</td>
                                                    <td className="py-2.5 text-ink/80">
                                                        {a.finished_at ?? '—'}
                                                    </td>
                                                    <td className="py-2.5">
                                                        <Badge tone={cfg.tone}>{cfg.label}</Badge>
                                                    </td>
                                                    <td className="py-2.5 text-right font-bold text-brand-950">
                                                        {a.total_score !== null ? a.total_score : '—'}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    )}
                </div>

                {/* Right: Action panel */}
                <div>
                    <div className="rounded-xl border border-ink/10 bg-white p-6 shadow-sm sticky top-4 text-center">
                        {quiz.has_in_progress ? (
                            <>
                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-yellow-100 text-yellow-600 mx-auto mb-3">
                                    <Clock size={28} />
                                </div>
                                <h3 className="font-bold text-brand-950 mb-1">Ujian Sedang Berjalan</h3>
                                <p className="text-xs text-ink/60 mb-4">
                                    Kamu memiliki sesi yang sedang berlangsung. Lanjutkan sebelum waktu habis.
                                </p>
                                <Link
                                    href={`/student/attempts/${quiz.in_progress_id}`}
                                    className="block w-full rounded-lg bg-yellow-500 px-4 py-3 text-sm font-bold text-white hover:bg-yellow-600 transition"
                                >
                                    Lanjutkan Mengerjakan
                                </Link>
                            </>
                        ) : canStart ? (
                            <>
                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-brand-600 mx-auto mb-3">
                                    <Play size={28} />
                                </div>
                                <h3 className="font-bold text-brand-950 mb-1">Siap Memulai?</h3>
                                <p className="text-xs text-ink/60 mb-4">
                                    Pastikan kamu sudah membaca petunjuk. Waktu akan mulai berjalan setelah klik tombol di bawah.
                                </p>
                                <button
                                    type="button"
                                    onClick={handleStart}
                                    className="block w-full rounded-lg bg-brand-600 px-4 py-3 text-sm font-bold text-white hover:bg-brand-700 transition"
                                >
                                    <Play size={16} className="inline mr-1.5" />
                                    Mulai Ujian
                                </button>
                                <p className="mt-3 text-xs text-ink/50">
                                    Sisa percobaan:{' '}
                                    <strong className="text-brand-700">
                                        {quiz.max_attempts - quiz.attempts_used}×
                                    </strong>
                                </p>
                            </>
                        ) : (
                            <>
                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-ink/10 text-ink/40 mx-auto mb-3">
                                    <AlertCircle size={28} />
                                </div>
                                <h3 className="font-bold text-brand-950 mb-1">Tidak Dapat Dikerjakan</h3>
                                <p className="text-xs text-ink/60">
                                    {quiz.attempts_used >= quiz.max_attempts
                                        ? 'Kamu sudah mencapai batas maksimal percobaan.'
                                        : 'Kuis ini belum dibuka atau sudah ditutup.'}
                                </p>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
