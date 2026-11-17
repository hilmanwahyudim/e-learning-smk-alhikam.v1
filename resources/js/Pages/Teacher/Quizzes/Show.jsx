import { Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    BookOpen,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    Clock,
    Hash,
    ListChecks,
    Plus,
    Trash2,
    User,
} from 'lucide-react';
import { useState } from 'react';
import { Badge, Card, EmptyState, PageHeader } from '../../../Components/ui';
import AppLayout from '../../../Layouts/AppLayout';
import { confirmAction } from '../../../lib/swal';

const TYPE_LABEL = {
    multiple_choice: 'Pilihan Ganda',
    true_false: 'Benar/Salah',
    short_answer: 'Isian Singkat',
    essay: 'Esai',
};

const STATUS_CONFIG = {
    in_progress: { label: 'Sedang dikerjakan', tone: 'info' },
    submitted: { label: 'Selesai (Esai)', tone: 'warning' },
    graded: { label: 'Sudah dinilai', tone: 'success' },
};

function QuestionCard({ question, onRemove, index }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="rounded-xl border border-ink/10 bg-white shadow-sm overflow-hidden">
            <div
                className="flex items-center gap-3 p-4 cursor-pointer hover:bg-paper/40 transition"
                onClick={() => setExpanded(!expanded)}
            >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                    {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-brand-950 truncate">{question.body}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                        <Badge tone="neutral">{TYPE_LABEL[question.type] ?? question.type}</Badge>
                        <span className="text-xs text-ink/50">
                            {question.pivot?.points ?? question.default_points} poin
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemove(question);
                        }}
                        title="Keluarkan dari kuis"
                        className="grid size-8 place-items-center rounded-lg text-red-500 hover:bg-red-50 transition"
                    >
                        <Trash2 size={15} />
                    </button>
                    {expanded ? <ChevronUp size={16} className="text-ink/50" /> : <ChevronDown size={16} className="text-ink/50" />}
                </div>
            </div>

            {expanded && (
                <div className="border-t border-ink/10 px-4 pb-4 pt-3 bg-paper/30">
                    {question.options?.length > 0 && (
                        <ul className="space-y-1.5 mt-1">
                            {question.options.map((opt) => (
                                <li
                                    key={opt.id}
                                    className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm ${
                                        opt.is_correct
                                            ? 'bg-green-50 text-green-800 font-semibold ring-1 ring-green-300'
                                            : 'bg-white text-ink/80'
                                    }`}
                                >
                                    <span className="font-bold text-xs w-5 shrink-0">{opt.label}.</span>
                                    <span>{opt.body}</span>
                                    {opt.is_correct && <CheckCircle2 size={14} className="ml-auto text-green-600" />}
                                </li>
                            ))}
                        </ul>
                    )}
                    {question.answer_key && (
                        <p className="mt-2 text-xs text-ink/60">
                            <span className="font-semibold">Kunci Jawaban:</span> {question.answer_key}
                        </p>
                    )}
                    {question.explanation && (
                        <p className="mt-1 text-xs text-ink/60 italic">
                            <span className="font-semibold">Pembahasan:</span> {question.explanation}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

export default function Show({ quiz, availableQuestions }) {
    const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);
    const [points, setPoints] = useState(10);

    const handleRemoveQuestion = async (question) => {
        const confirmed = await confirmAction({
            title: 'Keluarkan soal dari kuis?',
            text: 'Soal akan dikembalikan ke bank soal dan tidak mempengaruhi data bank soal.',
            confirmText: 'Ya, keluarkan',
            danger: true,
        });
        if (confirmed) {
            router.delete(`/teacher/quizzes/${quiz.id}/questions/${question.id}`);
        }
    };

    const handleAddQuestions = () => {
        if (selectedQuestionIds.length === 0) return;
        router.post(
            `/teacher/quizzes/${quiz.id}/questions`,
            { question_ids: selectedQuestionIds, points },
            {
                onSuccess: () => setSelectedQuestionIds([]),
            }
        );
    };

    const toggleSelect = (id) => {
        setSelectedQuestionIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const classroom = quiz.teacher_subject?.classroom;
    const subject = quiz.teacher_subject?.subject;

    return (
        <AppLayout title={quiz.title}>
            {/* Back link */}
            <div className="mb-4">
                <Link
                    href="/teacher/quizzes"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 hover:text-brand-900"
                >
                    <ArrowLeft size={14} />
                    <span>Kembali ke Daftar Kuis</span>
                </Link>
            </div>

            {/* Quiz info header */}
            <div className="mb-6 rounded-xl border border-ink/10 bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <Badge tone={quiz.type === 'exam' ? 'danger' : 'info'}>
                                {quiz.type === 'exam' ? 'Ujian Resmi' : 'Kuis Harian'}
                            </Badge>
                            <Badge tone={quiz.is_published ? 'success' : 'neutral'}>
                                {quiz.is_published ? 'Aktif' : 'Draft'}
                            </Badge>
                            {classroom && <span className="text-xs text-ink/60">{classroom.name}</span>}
                            {subject && <span className="text-xs font-semibold text-brand-700">{subject.name}</span>}
                        </div>
                        <h1 className="mt-2 text-2xl font-bold tracking-tight text-brand-950">{quiz.title}</h1>
                        {quiz.instructions && (
                            <p className="mt-1 text-sm text-ink/70 max-w-2xl">{quiz.instructions}</p>
                        )}
                    </div>
                    <div className="flex gap-4 text-center shrink-0">
                        <div>
                            <p className="text-xs text-ink/50">Durasi</p>
                            <p className="text-lg font-bold text-brand-950">{quiz.duration_minutes} Menit</p>
                        </div>
                        <div>
                            <p className="text-xs text-ink/50">Jumlah Soal</p>
                            <p className="text-lg font-bold text-brand-950">{quiz.questions?.length ?? 0}</p>
                        </div>
                        <div>
                            <p className="text-xs text-ink/50">Percobaan</p>
                            <p className="text-lg font-bold text-brand-950">{quiz.attempts?.length ?? 0}×</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Left: Soal dalam kuis */}
                <div className="lg:col-span-2 space-y-4">
                    <PageHeader
                        title="Butir Soal dalam Kuis"
                        subtitle={`${quiz.questions?.length ?? 0} soal telah ditambahkan`}
                        compact
                    />

                    {quiz.questions?.length === 0 ? (
                        <Card>
                            <EmptyState
                                icon={<ListChecks size={32} />}
                                title="Belum ada soal"
                                description="Tambahkan soal dari bank soal di sebelah kanan untuk mulai menyusun kuis ini."
                            />
                        </Card>
                    ) : (
                        <div className="space-y-3">
                            {quiz.questions.map((q, idx) => (
                                <QuestionCard
                                    key={q.id}
                                    question={q}
                                    index={idx}
                                    onRemove={handleRemoveQuestion}
                                />
                            ))}
                        </div>
                    )}

                    {/* Riwayat Pengerjaan Siswa */}
                    {quiz.attempts?.length > 0 && (
                        <div className="mt-8">
                            <PageHeader
                                title="Riwayat Pengerjaan Siswa"
                                subtitle={`${quiz.attempts.length} pengerjaan`}
                                compact
                            />
                            <Card padded={false}>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-ink/10 bg-paper/50">
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink/60">
                                                    Siswa
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink/60">
                                                    Waktu Mulai
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink/60">
                                                    Status
                                                </th>
                                                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-ink/60">
                                                    Nilai
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-ink/10">
                                            {quiz.attempts.map((attempt) => {
                                                const cfg = STATUS_CONFIG[attempt.status] ?? {
                                                    label: attempt.status,
                                                    tone: 'neutral',
                                                };
                                                return (
                                                    <tr key={attempt.id} className="hover:bg-paper/40 transition">
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-2">
                                                                <User size={14} className="text-ink/40 shrink-0" />
                                                                <span className="font-medium text-brand-950">
                                                                    {attempt.student?.user?.name}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-ink/50 ml-5">
                                                                NIS: {attempt.student?.nis}
                                                            </p>
                                                        </td>
                                                        <td className="px-4 py-3 text-xs text-ink/70">
                                                            {attempt.started_at}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <Badge tone={cfg.tone}>{cfg.label}</Badge>
                                                        </td>
                                                        <td className="px-4 py-3 text-right font-bold text-brand-950">
                                                            {attempt.total_score !== null
                                                                ? attempt.total_score
                                                                : attempt.auto_score !== null
                                                                ? `${attempt.auto_score} *`
                                                                : '—'}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </div>
                    )}
                </div>

                {/* Right: Bank soal yang bisa ditambahkan */}
                <div className="space-y-4">
                    <div className="rounded-xl border border-ink/10 bg-white p-5 shadow-sm sticky top-4">
                        <h2 className="text-base font-bold text-brand-950 mb-1 flex items-center gap-2">
                            <BookOpen size={16} className="text-brand-600" />
                            Bank Soal Tersedia
                        </h2>
                        <p className="text-xs text-ink/60 mb-4">
                            {availableQuestions.length} soal dari bank soal mapel ini belum masuk kuis.
                        </p>

                        {availableQuestions.length === 0 ? (
                            <div className="rounded-lg bg-paper/60 py-6 text-center text-xs text-ink/50">
                                Semua soal sudah dimasukkan ke kuis, atau belum ada soal di bank soal.
                            </div>
                        ) : (
                            <>
                                <div className="mb-3">
                                    <label className="block text-xs font-semibold text-ink/70 mb-1">
                                        Poin per soal yang dipilih
                                    </label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={100}
                                        value={points}
                                        onChange={(e) => setPoints(parseInt(e.target.value, 10) || 10)}
                                        className="w-full rounded-lg border border-ink/20 px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none"
                                    />
                                </div>

                                <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                                    {availableQuestions.map((q) => (
                                        <label
                                            key={q.id}
                                            className={`flex items-start gap-2.5 rounded-lg border p-3 cursor-pointer transition ${
                                                selectedQuestionIds.includes(q.id)
                                                    ? 'border-brand-400 bg-brand-50'
                                                    : 'border-ink/10 hover:border-brand-200 hover:bg-paper/60'
                                            }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedQuestionIds.includes(q.id)}
                                                onChange={() => toggleSelect(q.id)}
                                                className="mt-0.5 size-4 rounded border-ink/20 text-brand-600 focus:ring-brand-500"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium text-brand-950 line-clamp-2">
                                                    {q.body}
                                                </p>
                                                <Badge tone="neutral" className="mt-1">
                                                    {TYPE_LABEL[q.type] ?? q.type}
                                                </Badge>
                                            </div>
                                        </label>
                                    ))}
                                </div>

                                <button
                                    type="button"
                                    onClick={handleAddQuestions}
                                    disabled={selectedQuestionIds.length === 0}
                                    className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 transition disabled:opacity-40"
                                >
                                    <Plus size={16} />
                                    Tambahkan {selectedQuestionIds.length > 0 ? `${selectedQuestionIds.length} Soal` : 'Soal'}
                                </button>
                            </>
                        )}

                        <div className="mt-4 border-t border-ink/10 pt-4 space-y-1 text-xs text-ink/60">
                            <div className="flex items-center gap-1.5">
                                <Hash size={12} />
                                <span>Acak soal: {quiz.shuffle_questions ? 'Ya' : 'Tidak'}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Hash size={12} />
                                <span>Acak pilihan: {quiz.shuffle_options ? 'Ya' : 'Tidak'}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Clock size={12} />
                                <span>Maks. percobaan: {quiz.max_attempts}×</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
