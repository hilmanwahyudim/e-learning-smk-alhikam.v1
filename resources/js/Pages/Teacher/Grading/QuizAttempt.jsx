import { Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCircle2,
    HelpCircle,
    Save,
    Star,
    User,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { Badge, Card, PageHeader } from '../../../Components/ui';
import AppLayout from '../../../Layouts/AppLayout';

export default function QuizAttempt({ attempt, answers }) {
    // Inisialisasi form dengan nilai esai yang sudah ada
    const initialAnswers = answers
        .filter((a) => a.type === 'essay')
        .map((a) => ({
            question_id: a.question_id,
            score: a.score !== null ? a.score : 0,
            feedback: a.feedback || '',
        }));

    const { data, setData, post, processing, errors } = useForm({
        answers: initialAnswers,
    });

    const handleScoreChange = (qId, val) => {
        const num = parseFloat(val) || 0;
        setData(
            'answers',
            data.answers.map((ans) =>
                ans.question_id === qId ? { ...ans, score: num } : ans
            )
        );
    };

    const handleFeedbackChange = (qId, text) => {
        setData(
            'answers',
            data.answers.map((ans) =>
                ans.question_id === qId ? { ...ans, feedback: text } : ans
            )
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(`/teacher/grading/quiz-attempt/${attempt.id}`);
    };

    // Hitung live total score: skor objektif + skor esai yang diinput saat ini
    const objectiveScore = answers
        .filter((a) => a.type !== 'essay')
        .reduce((sum, a) => sum + (parseFloat(a.score) || 0), 0);

    const currentEssayScore = data.answers.reduce(
        (sum, a) => sum + (parseFloat(a.score) || 0),
        0
    );

    const liveTotalScore = Math.round((objectiveScore + currentEssayScore) * 10) / 10;

    return (
        <AppLayout title={`Koreksi Ujian: ${attempt.quiz_title}`}>
            <div className="mb-4">
                <Link
                    href="/teacher/grading?tab=quizzes"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 hover:text-brand-900"
                >
                    <ArrowLeft size={14} />
                    <span>Kembali ke Antrean Koreksi</span>
                </Link>
            </div>

            {/* Header Informasi Siswa & Ujian */}
            <div className="mb-6 rounded-xl border border-ink/10 bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Badge tone={attempt.quiz_type === 'exam' ? 'danger' : 'info'}>
                                {attempt.quiz_type === 'exam' ? 'Ujian Resmi' : 'Kuis Harian'}
                            </Badge>
                            <span className="text-xs text-brand-700 font-semibold">{attempt.subject_name}</span>
                            <span className="text-xs text-ink/40">•</span>
                            <span className="text-xs text-ink/60">{attempt.class_name}</span>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-brand-950">
                            {attempt.quiz_title}
                        </h1>
                        <p className="mt-1 text-sm text-ink/70 flex items-center gap-1.5">
                            <User size={14} />
                            <span>Siswa:</span>
                            <strong className="text-brand-950">{attempt.student_name}</strong>
                            <span className="text-xs text-ink/50">(NIS: {attempt.student_nis})</span>
                        </p>
                    </div>

                    {/* Skor Preview Box */}
                    <div className="flex items-center gap-4 text-center rounded-xl bg-brand-50 p-4 border border-brand-200">
                        <div>
                            <p className="text-xs text-ink/60">Skor Objektif</p>
                            <p className="text-lg font-bold text-brand-950">{objectiveScore}</p>
                        </div>
                        <div className="h-8 w-px bg-brand-200" />
                        <div>
                            <p className="text-xs text-ink/60">Skor Esai</p>
                            <p className="text-lg font-bold text-brand-950">{currentEssayScore}</p>
                        </div>
                        <div className="h-8 w-px bg-brand-200" />
                        <div>
                            <p className="text-xs text-brand-700 font-bold">Total Nilai Akhir</p>
                            <p className="text-2xl font-black text-brand-700">{liveTotalScore}</p>
                        </div>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <PageHeader
                    title="Daftar Butir Soal & Jawaban Siswa"
                    subtitle="Periksa jawaban esai di bawah ini dan masukkan skor yang sesuai dengan rubrik penilaian."
                    compact
                >
                    <button
                        type="submit"
                        disabled={processing}
                        className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 transition disabled:opacity-50"
                    >
                        <Save size={16} />
                        <span>{processing ? 'Menyimpan…' : 'Simpan Seluruh Penilaian'}</span>
                    </button>
                </PageHeader>

                <div className="space-y-4">
                    {answers.map((ans, idx) => {
                        const isEssay = ans.type === 'essay';
                        const currentFormAns = data.answers.find((a) => a.question_id === ans.question_id);

                        return (
                            <div
                                key={ans.id}
                                className={`rounded-xl border p-5 shadow-sm transition ${
                                    isEssay
                                        ? 'border-brand-200 bg-white ring-1 ring-brand-100'
                                        : ans.is_correct
                                        ? 'border-green-200 bg-green-50/40'
                                        : 'border-red-200 bg-red-50/40'
                                }`}
                            >
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="flex size-7 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                                            {idx + 1}
                                        </span>
                                        <Badge tone={isEssay ? 'info' : 'neutral'}>{ans.type_label}</Badge>
                                        <span className="text-xs text-ink/50">Maks. {ans.max_score} Poin</span>
                                    </div>

                                    {!isEssay && (
                                        <div className="flex items-center gap-1.5">
                                            {ans.is_correct ? (
                                                <Badge tone="success">
                                                    <CheckCircle2 size={13} className="mr-1 inline" /> Benar (+{ans.score})
                                                </Badge>
                                            ) : (
                                                <Badge tone="danger">
                                                    <XCircle size={13} className="mr-1 inline" /> Salah (0)
                                                </Badge>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Body Soal */}
                                <p className="text-sm font-semibold text-brand-950 mb-3">{ans.body}</p>

                                {/* Jawaban Siswa */}
                                <div className="rounded-lg bg-paper/60 p-3.5 border border-ink/10 mb-3">
                                    <p className="text-xs font-semibold text-ink/50 uppercase tracking-wider mb-1">
                                        Jawaban Siswa:
                                    </p>
                                    <p className="text-sm text-brand-950 whitespace-pre-wrap">
                                        {ans.student_answer || <span className="italic text-ink/40">Tidak dijawab</span>}
                                    </p>
                                </div>

                                {ans.explanation && (
                                    <p className="text-xs text-ink/60 italic mb-3">
                                        <strong className="not-italic text-ink/70">Pembahasan/Kunci:</strong>{' '}
                                        {ans.explanation}
                                    </p>
                                )}

                                {/* Input Nilai Esai */}
                                {isEssay && (
                                    <div className="mt-3 border-t border-brand-100 pt-3 grid grid-cols-1 md:grid-cols-4 gap-3">
                                        <div>
                                            <label className="block text-xs font-bold text-brand-950 mb-1">
                                                Skor Soal (0 - {ans.max_score}):
                                            </label>
                                            <input
                                                type="number"
                                                step="0.5"
                                                min="0"
                                                max={ans.max_score}
                                                value={currentFormAns?.score ?? 0}
                                                onChange={(e) => handleScoreChange(ans.question_id, e.target.value)}
                                                className="w-full rounded-lg border border-ink/20 px-3 py-1.5 text-sm font-bold text-brand-950 focus:border-brand-500 focus:outline-none"
                                                required
                                            />
                                        </div>
                                        <div className="md:col-span-3">
                                            <label className="block text-xs font-bold text-brand-950 mb-1">
                                                Catatan Koreksi / Evaluasi:
                                            </label>
                                            <input
                                                type="text"
                                                value={currentFormAns?.feedback ?? ''}
                                                onChange={(e) => handleFeedbackChange(ans.question_id, e.target.value)}
                                                placeholder="Tambahkan feedback untuk jawaban esai ini..."
                                                className="w-full rounded-lg border border-ink/20 px-3 py-1.5 text-xs text-brand-950 focus:border-brand-500 focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={processing}
                        className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-brand-700 transition disabled:opacity-50"
                    >
                        <Save size={18} />
                        <span>{processing ? 'Menyimpan…' : 'Simpan Seluruh Penilaian'}</span>
                    </button>
                </div>
            </form>
        </AppLayout>
    );
}
