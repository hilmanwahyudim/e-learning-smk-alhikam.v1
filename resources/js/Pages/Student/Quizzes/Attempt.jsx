import { router } from '@inertiajs/react';
import { AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, Clock, Send } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

/** Format detik menjadi MM:SS */
function formatTime(seconds) {
    if (seconds <= 0) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/** Simpan jawaban satu soal ke server (auto-save) */
async function saveAnswer(attemptId, questionId, payload) {
    try {
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content ?? '';
        await fetch(`/student/attempts/${attemptId}/answer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken,
                Accept: 'application/json',
            },
            body: JSON.stringify({ question_id: questionId, ...payload }),
        });
    } catch {
        // Silent fail — will retry on next change
    }
}

export default function Attempt({ attempt, questions, savedAnswers }) {
    // State jawaban — { [questionId]: { option_id, answer_text } }
    const [answers, setAnswers] = useState(() => {
        const init = {};
        Object.entries(savedAnswers ?? {}).forEach(([qId, ans]) => {
            init[qId] = { option_id: ans.option_id ?? null, answer_text: ans.answer_text ?? '' };
        });
        return init;
    });

    const [currentIndex, setCurrentIndex] = useState(0);
    const [remaining, setRemaining] = useState(attempt.remaining_seconds);
    const [isFinishing, setIsFinishing] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const autoFinishTriggered = useRef(false);

    // Countdown timer
    useEffect(() => {
        if (remaining <= 0) return;
        const interval = setInterval(() => {
            setRemaining((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Auto-submit when time runs out
    useEffect(() => {
        if (remaining === 0 && !autoFinishTriggered.current) {
            autoFinishTriggered.current = true;
            handleFinish(true);
        }
    }, [remaining]);

    const currentQuestion = questions[currentIndex];
    const totalQuestions = questions.length;

    const getAnswer = (qId) => answers[qId] ?? { option_id: null, answer_text: '' };

    const handleOptionSelect = useCallback(
        (questionId, optionId) => {
            setAnswers((prev) => ({ ...prev, [questionId]: { ...prev[questionId], option_id: optionId } }));
            saveAnswer(attempt.id, questionId, { option_id: optionId });
        },
        [attempt.id]
    );

    const handleTextChange = useCallback((questionId, text) => {
        setAnswers((prev) => ({ ...prev, [questionId]: { ...prev[questionId], answer_text: text } }));
    }, []);

    // Debounced save for text inputs
    const textSaveTimer = useRef({});
    const handleTextSave = useCallback(
        (questionId, text) => {
            clearTimeout(textSaveTimer.current[questionId]);
            textSaveTimer.current[questionId] = setTimeout(() => {
                saveAnswer(attempt.id, questionId, { answer_text: text });
            }, 800);
        },
        [attempt.id]
    );

    const handleFinish = (autoSubmit = false) => {
        setIsFinishing(true);
        setShowConfirm(false);
        router.post(`/student/attempts/${attempt.id}/finish`, {}, {
            onError: () => setIsFinishing(false),
        });
    };

    const answeredCount = questions.filter((q) => {
        const ans = getAnswer(q.id);
        return ans.option_id || (ans.answer_text && ans.answer_text.trim() !== '');
    }).length;

    const isWarning = remaining <= 300 && remaining > 0; // <= 5 minutes
    const isDanger = remaining <= 60 && remaining > 0;   // <= 1 minute

    return (
        <div className="min-h-screen bg-paper flex flex-col">
            {/* Top bar */}
            <div className={`sticky top-0 z-30 border-b shadow-sm ${isDanger ? 'bg-red-600' : isWarning ? 'bg-yellow-500' : 'bg-brand-900'}`}>
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
                    <div className="flex flex-col">
                        <h1 className="text-sm font-bold text-white leading-tight truncate max-w-xs sm:max-w-md">
                            {attempt.quiz_title}
                        </h1>
                        <span className="text-xs text-white/70">
                            {attempt.type === 'exam' ? 'Ujian Resmi' : 'Kuis Harian'}
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Progress */}
                        <div className="hidden sm:flex flex-col items-end">
                            <span className="text-xs text-white/70">Dijawab</span>
                            <span className="text-sm font-bold text-white">
                                {answeredCount}/{totalQuestions}
                            </span>
                        </div>

                        {/* Timer */}
                        <div className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 ${isDanger ? 'bg-red-700' : isWarning ? 'bg-yellow-600' : 'bg-brand-800'}`}>
                            <Clock size={14} className="text-white" />
                            <span className={`text-base font-bold tabular-nums ${isDanger ? 'text-white animate-pulse' : 'text-white'}`}>
                                {remaining === 0 ? 'Waktu Habis!' : formatTime(remaining)}
                            </span>
                        </div>

                        {/* Finish button */}
                        <button
                            type="button"
                            onClick={() => setShowConfirm(true)}
                            disabled={isFinishing}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-sm font-bold text-brand-900 hover:bg-brand-50 transition disabled:opacity-50"
                        >
                            <Send size={14} />
                            <span className="hidden sm:inline">Selesai & Kumpulkan</span>
                            <span className="sm:hidden">Selesai</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Confirm dialog overlay */}
            {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 text-yellow-600 mx-auto mb-3">
                            <AlertCircle size={24} />
                        </div>
                        <h3 className="text-center text-lg font-bold text-brand-950 mb-1">Selesaikan Ujian?</h3>
                        <p className="text-center text-sm text-ink/70 mb-2">
                            Kamu baru menjawab{' '}
                            <strong className="text-brand-950">{answeredCount}</strong> dari{' '}
                            <strong className="text-brand-950">{totalQuestions}</strong> soal.
                        </p>
                        <p className="text-center text-xs text-ink/50 mb-5">
                            Setelah dikumpulkan, kamu tidak dapat mengubah jawaban lagi.
                        </p>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setShowConfirm(false)}
                                className="flex-1 rounded-lg border border-ink/20 px-4 py-2.5 text-sm font-semibold text-ink/80 hover:bg-ink/5 transition"
                            >
                                Kembali
                            </button>
                            <button
                                type="button"
                                onClick={() => handleFinish(false)}
                                disabled={isFinishing}
                                className="flex-1 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-700 transition disabled:opacity-50"
                            >
                                {isFinishing ? 'Mengumpulkan…' : 'Ya, Kumpulkan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main content */}
            <div className="mx-auto w-full max-w-7xl flex flex-1 gap-6 px-4 py-6">
                {/* Question navigator sidebar */}
                <aside className="hidden lg:flex flex-col w-56 shrink-0">
                    <div className="rounded-xl border border-ink/10 bg-white p-4 shadow-sm sticky top-20">
                        <p className="text-xs font-bold uppercase tracking-wider text-ink/50 mb-3">Navigasi Soal</p>
                        <div className="grid grid-cols-5 gap-1.5">
                            {questions.map((q, idx) => {
                                const ans = getAnswer(q.id);
                                const isAnswered = ans.option_id || (ans.answer_text && ans.answer_text.trim() !== '');
                                const isCurrent = idx === currentIndex;
                                return (
                                    <button
                                        key={q.id}
                                        type="button"
                                        onClick={() => setCurrentIndex(idx)}
                                        className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition ${
                                            isCurrent
                                                ? 'bg-brand-600 text-white ring-2 ring-brand-400'
                                                : isAnswered
                                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                : 'bg-paper text-ink/60 border border-ink/15 hover:bg-brand-50 hover:text-brand-700'
                                        }`}
                                    >
                                        {idx + 1}
                                    </button>
                                );
                            })}
                        </div>
                        <div className="mt-4 space-y-1.5 text-xs">
                            <div className="flex items-center gap-2">
                                <span className="h-3 w-3 rounded bg-green-200 shrink-0" />
                                <span className="text-ink/60">Sudah dijawab ({answeredCount})</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="h-3 w-3 rounded border border-ink/20 bg-paper shrink-0" />
                                <span className="text-ink/60">Belum dijawab ({totalQuestions - answeredCount})</span>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Question area */}
                <main className="flex-1 min-w-0">
                    {currentQuestion && (
                        <div className="rounded-xl border border-ink/10 bg-white p-6 shadow-sm">
                            {/* Question header */}
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-2">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                                        {currentIndex + 1}
                                    </span>
                                    <span className="text-xs text-ink/50">dari {totalQuestions} soal</span>
                                </div>
                                <span className="rounded-full bg-paper px-3 py-1 text-xs font-semibold text-ink/60 border border-ink/10">
                                    {currentQuestion.type_label}
                                </span>
                            </div>

                            {/* Question body */}
                            <div className="mb-6">
                                <p className="text-base font-semibold text-brand-950 leading-relaxed whitespace-pre-wrap">
                                    {currentQuestion.body}
                                </p>
                            </div>

                            {/* Answer area */}
                            <div className="space-y-3">
                                {/* Multiple choice & True/False */}
                                {(currentQuestion.type === 'multiple_choice' || currentQuestion.type === 'true_false') &&
                                    currentQuestion.options.map((opt) => {
                                        const isSelected = getAnswer(currentQuestion.id).option_id === opt.id;
                                        return (
                                            <button
                                                key={opt.id}
                                                type="button"
                                                onClick={() => handleOptionSelect(currentQuestion.id, opt.id)}
                                                className={`w-full flex items-center gap-3 rounded-xl border-2 p-4 text-left transition ${
                                                    isSelected
                                                        ? 'border-brand-500 bg-brand-50 text-brand-900'
                                                        : 'border-ink/15 bg-white hover:border-brand-300 hover:bg-paper/60 text-brand-950'
                                                }`}
                                            >
                                                <span
                                                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition ${
                                                        isSelected
                                                            ? 'border-brand-500 bg-brand-500 text-white'
                                                            : 'border-ink/25 text-ink/60'
                                                    }`}
                                                >
                                                    {opt.label}
                                                </span>
                                                <span className="text-sm leading-relaxed">{opt.body}</span>
                                                {isSelected && (
                                                    <CheckCircle2 size={16} className="ml-auto shrink-0 text-brand-500" />
                                                )}
                                            </button>
                                        );
                                    })}

                                {/* Short answer */}
                                {currentQuestion.type === 'short_answer' && (
                                    <div>
                                        <label className="block text-xs font-semibold text-ink/60 mb-2">
                                            Jawaban Singkat:
                                        </label>
                                        <input
                                            type="text"
                                            value={getAnswer(currentQuestion.id).answer_text ?? ''}
                                            onChange={(e) => {
                                                handleTextChange(currentQuestion.id, e.target.value);
                                                handleTextSave(currentQuestion.id, e.target.value);
                                            }}
                                            placeholder="Ketik jawaban singkatmu di sini..."
                                            className="w-full rounded-xl border-2 border-ink/15 px-4 py-3 text-sm text-brand-950 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition"
                                        />
                                    </div>
                                )}

                                {/* Essay */}
                                {currentQuestion.type === 'essay' && (
                                    <div>
                                        <label className="block text-xs font-semibold text-ink/60 mb-2">
                                            Jawaban Esai:
                                        </label>
                                        <textarea
                                            rows={6}
                                            value={getAnswer(currentQuestion.id).answer_text ?? ''}
                                            onChange={(e) => {
                                                handleTextChange(currentQuestion.id, e.target.value);
                                                handleTextSave(currentQuestion.id, e.target.value);
                                            }}
                                            placeholder="Tulis jawabanmu di sini secara lengkap dan terstruktur..."
                                            className="w-full rounded-xl border-2 border-ink/15 px-4 py-3 text-sm text-brand-950 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition resize-none"
                                        />
                                        <p className="mt-1 text-xs text-ink/40">
                                            Jawaban esai akan dinilai secara manual oleh guru.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Navigation buttons */}
                            <div className="mt-8 flex items-center justify-between border-t border-ink/10 pt-5">
                                <button
                                    type="button"
                                    onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                                    disabled={currentIndex === 0}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-ink/20 px-4 py-2 text-sm font-semibold text-ink/80 hover:bg-ink/5 transition disabled:opacity-30"
                                >
                                    <ChevronLeft size={16} />
                                    Soal Sebelumnya
                                </button>

                                {/* Mobile question counter */}
                                <span className="lg:hidden text-xs text-ink/50">
                                    {currentIndex + 1} / {totalQuestions}
                                </span>

                                {currentIndex < totalQuestions - 1 ? (
                                    <button
                                        type="button"
                                        onClick={() => setCurrentIndex((i) => Math.min(totalQuestions - 1, i + 1))}
                                        className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 transition"
                                    >
                                        Soal Berikutnya
                                        <ChevronRight size={16} />
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm(true)}
                                        className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition"
                                    >
                                        <Send size={14} />
                                        Selesai & Kumpulkan
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
