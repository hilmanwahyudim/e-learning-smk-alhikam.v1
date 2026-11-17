import { Link, router } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    BookOpen,
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    ChevronUp,
    Clock,
    Download,
    ExternalLink,
    GraduationCap,
    HelpCircle,
    Play,
    Star,
    Video,
} from 'lucide-react';
import { useState } from 'react';
import { Badge, ProgressBar } from '../../../Components/ui';
import AppLayout from '../../../Layouts/AppLayout';

const ASSIGNMENT_STATUS_CONFIG = {
    not_submitted: { label: 'Belum Dikerjakan', tone: 'neutral' },
    submitted: { label: 'Dikumpulkan', tone: 'info' },
    late: { label: 'Terlambat', tone: 'warning' },
    graded: { label: 'Sudah Dinilai', tone: 'success' },
};

function MaterialCard({ material, courseId, index }) {
    const [expanded, setExpanded] = useState(false);
    const videoFiles = material.files?.filter((f) => f.type === 'video' || f.url);
    const docFiles = material.files?.filter((f) => f.type !== 'video' && !f.url && f.id);

    const handleToggleProgress = () => {
        router.post(`/student/materials/${material.id}/toggle-progress`, {}, { preserveScroll: true });
    };

    return (
        <div
            className={`rounded-xl border overflow-hidden transition ${
                material.is_completed ? 'border-green-200 bg-green-50/30' : 'border-ink/10 bg-white'
            }`}
        >
            {/* Header */}
            <div
                className="flex items-center gap-3 p-4 cursor-pointer hover:bg-paper/60 transition"
                onClick={() => setExpanded(!expanded)}
            >
                {/* Number badge */}
                <span
                    className={`grid size-9 shrink-0 place-items-center rounded-lg text-sm font-bold ${
                        material.is_completed
                            ? 'bg-green-500 text-white'
                            : 'bg-brand-100 text-brand-700'
                    }`}
                >
                    {material.is_completed ? <CheckCircle2 size={18} /> : index + 1}
                </span>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-brand-950 truncate">{material.title}</p>
                    <p className="text-xs text-ink/50">
                        {material.files?.length ?? 0} lampiran
                        {material.is_completed && (
                            <span className="ml-2 text-green-600 font-semibold">Selesai</span>
                        )}
                    </p>
                </div>
                <span className={`grid size-7 place-items-center rounded-full transition ${expanded ? 'bg-brand-100 text-brand-600' : 'text-ink/40'}`}>
                    {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </span>
            </div>

            {/* Expanded content */}
            {expanded && (
                <div className="border-t border-ink/10 px-4 pb-4 pt-3 bg-paper/30">
                    {material.description && (
                        <p className="text-sm text-ink/70 mb-3">{material.description}</p>
                    )}

                    {material.content && (
                        <div className="mb-4 rounded-lg bg-white p-4 border border-ink/10 prose prose-sm max-w-none shadow-sm">
                            <div dangerouslySetInnerHTML={{ __html: material.content }} />
                        </div>
                    )}

                    {/* Video links */}
                    {videoFiles?.length > 0 && (
                        <div className="mb-3">
                            <p className="text-xs font-bold text-ink/60 mb-2 uppercase tracking-wider">Video Pembelajaran</p>
                            <div className="space-y-2">
                                {videoFiles.map((f, idx) => (
                                    <a
                                        key={f.id ?? idx}
                                        href={f.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 transition"
                                    >
                                        <Video size={13} />
                                        {f.original_name ?? 'Tonton Video'}
                                        <ExternalLink size={11} className="ml-auto" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Document/file downloads */}
                    {docFiles?.length > 0 && (
                        <div className="mb-3">
                            <p className="text-xs font-bold text-ink/60 mb-2 uppercase tracking-wider">Unduh Materi</p>
                            <div className="flex flex-wrap gap-2">
                                {docFiles.map((f) => (
                                    <a
                                        key={f.id}
                                        href={`/student/subjects/${courseId}/materials/${material.id}/files/${f.id}/download`}
                                        className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100 transition"
                                    >
                                        <Download size={12} />
                                        {f.original_name}
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Toggle progress button */}
                    <div className="mt-4 border-t border-ink/10 pt-3">
                        <button
                            type="button"
                            onClick={handleToggleProgress}
                            className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition ${
                                material.is_completed
                                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                    : 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm'
                            }`}
                        >
                            <CheckCircle2 size={13} />
                            {material.is_completed ? 'Tandai Belum Selesai' : 'Tandai Selesai Dibaca'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function Show({ course, materials, assignments, quizzes }) {
    const completedCount = materials.filter((m) => m.is_completed).length;
    const progressPercent = materials.length > 0 ? Math.round((completedCount / materials.length) * 100) : 0;

    return (
        <AppLayout title={course.name}>
            {/* Back link */}
            <div className="mb-4">
                <Link
                    href="/student/subjects"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 hover:text-brand-900 transition"
                >
                    <ArrowLeft size={14} />
                    <span>Kembali ke Mata Pelajaran</span>
                </Link>
            </div>

            {/* Course header - gradient card like the design */}
            <div className="mb-6 overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-sm">
                <div className="relative bg-gradient-to-r from-slate-800 via-slate-700 to-teal-700 px-6 py-8 text-white">
                    <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="rounded-full bg-white/15 px-3 py-0.5 text-xs font-semibold uppercase tracking-widest">
                                    {course.code}
                                </span>
                                <span className="text-white/60">|</span>
                                <span className="text-xs text-white/70">{course.class_name}</span>
                            </div>
                            <h1 className="text-2xl font-black">{course.name}</h1>
                            {course.description && (
                                <p className="mt-2 text-sm text-white/70 max-w-xl">{course.description}</p>
                            )}
                        </div>
                        {/* Progress circle */}
                        <div className="flex flex-col items-center gap-1.5 shrink-0">
                            <div className="relative flex items-center justify-center size-20">
                                <svg className="size-20 -rotate-90" viewBox="0 0 36 36">
                                    <path
                                        className="stroke-white/15"
                                        fill="none"
                                        strokeWidth="3.5"
                                        d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831 15.9155 15.9155 0 0 1 0 -31.831"
                                    />
                                    <path
                                        className="stroke-gold-400"
                                        fill="none"
                                        strokeWidth="3.5"
                                        strokeLinecap="round"
                                        strokeDasharray={`${progressPercent}, 100`}
                                        d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831 15.9155 15.9155 0 0 1 0 -31.831"
                                    />
                                </svg>
                                <span className="absolute text-lg font-black text-white">{progressPercent}%</span>
                            </div>
                            <span className="text-xs text-white/60">Selesai</span>
                        </div>
                    </div>
                    {/* Decorative */}
                    <div className="absolute -right-8 -top-8 size-36 rounded-full bg-white/5" />
                    <div className="absolute right-12 -bottom-6 size-24 rounded-full bg-white/5" />
                </div>

                {/* Teacher & progress bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <span className="grid size-10 place-items-center rounded-full bg-brand-100 text-brand-600">
                            <GraduationCap size={18} />
                        </span>
                        <div>
                            <p className="text-xs text-ink/50">Guru Pengampu</p>
                            <p className="text-sm font-bold text-brand-950">{course.teacher.name}</p>
                        </div>
                    </div>
                    <div className="flex-1 max-w-xs">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-ink/60">Progres Materi</span>
                            <span className="text-xs font-bold text-brand-700">
                                {completedCount}/{materials.length}
                            </span>
                        </div>
                        <ProgressBar value={progressPercent} label="Progres materi" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Left: Materials */}
                <div className="lg:col-span-2 space-y-6">
                    <section>
                        <h2 className="text-base font-bold text-brand-950 mb-3 flex items-center gap-2">
                            <span className="grid size-7 place-items-center rounded-lg bg-brand-100 text-brand-600">
                                <BookOpen size={15} />
                            </span>
                            Materi Pembelajaran
                            <span className="ml-auto text-xs font-normal text-ink/50">
                                {materials.length} Materi
                            </span>
                        </h2>
                        {materials.length === 0 ? (
                            <div className="rounded-xl border border-ink/10 bg-white p-8 text-center text-sm text-ink/50">
                                Belum ada materi yang diunggah.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {materials.map((m, idx) => (
                                    <MaterialCard key={m.id} material={m} courseId={course.id} index={idx} />
                                ))}
                            </div>
                        )}
                    </section>
                </div>

                {/* Right: Assignments & Quizzes */}
                <div className="space-y-6">
                    {/* Assignments */}
                    <section>
                        <h2 className="text-sm font-bold text-brand-950 mb-3 flex items-center gap-2">
                            <span className="grid size-7 place-items-center rounded-lg bg-amber-100 text-amber-600">
                                <AlertCircle size={14} />
                            </span>
                            Tugas
                            <span className="ml-auto text-xs font-normal text-ink/50">
                                {assignments.length} Tugas
                            </span>
                        </h2>
                        {assignments.length === 0 ? (
                            <div className="rounded-xl border border-ink/10 bg-white p-5 text-center text-xs text-ink/50">
                                Belum ada tugas.
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {assignments.map((a) => {
                                    const cfg = ASSIGNMENT_STATUS_CONFIG[a.status] ?? ASSIGNMENT_STATUS_CONFIG.not_submitted;
                                    return (
                                        <Link
                                            key={a.id}
                                            href={`/student/assignments/${a.id}`}
                                            className="flex items-center gap-3 rounded-xl border border-ink/10 bg-white p-3.5 hover:border-brand-200 hover:shadow-sm transition"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold text-brand-950 truncate">{a.title}</p>
                                                {a.deadline_at && (
                                                    <p className="text-xs text-ink/50 mt-0.5 flex items-center gap-1">
                                                        <Clock size={10} />
                                                        {a.deadline_at}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                {a.status === 'graded' && a.score !== null && (
                                                    <span className="text-xs font-bold text-brand-700">
                                                        {a.score}/{a.max_score}
                                                    </span>
                                                )}
                                                <Badge tone={cfg.tone}>{cfg.label}</Badge>
                                                <ChevronRight size={14} className="text-ink/30" />
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                    {/* Quizzes */}
                    <section>
                        <h2 className="text-sm font-bold text-brand-950 mb-3 flex items-center gap-2">
                            <span className="grid size-7 place-items-center rounded-lg bg-sky-100 text-sky-600">
                                <HelpCircle size={14} />
                            </span>
                            Kuis & Ujian
                            <span className="ml-auto text-xs font-normal text-ink/50">
                                {quizzes.length} Item
                            </span>
                        </h2>
                        {quizzes.length === 0 ? (
                            <div className="rounded-xl border border-ink/10 bg-white p-5 text-center text-xs text-ink/50">
                                Belum ada kuis atau ujian.
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {quizzes.map((q) => {
                                    const hasInProgress = q.has_in_progress;
                                    const isExhausted = q.attempts_used >= q.max_attempts;

                                    return (
                                        <Link
                                            key={q.id}
                                            href={
                                                hasInProgress
                                                    ? `/student/attempts/${q.in_progress_id}`
                                                    : `/student/quizzes/${q.id}`
                                            }
                                            className="flex items-center gap-3 rounded-xl border border-ink/10 bg-white p-3.5 hover:border-brand-200 hover:shadow-sm transition"
                                        >
                                            <div
                                                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                                                    q.type === 'exam'
                                                        ? 'bg-red-100 text-red-600'
                                                        : 'bg-brand-100 text-brand-600'
                                                }`}
                                            >
                                                {q.type === 'exam' ? <AlertCircle size={15} /> : <HelpCircle size={15} />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold text-brand-950 truncate">{q.title}</p>
                                                <p className="text-xs text-ink/50">
                                                    {q.duration_minutes} mnt •{' '}
                                                    {q.attempts_used}/{q.max_attempts} coba
                                                    {q.best_score !== null && q.best_score !== undefined && (
                                                        <span className="ml-1 text-brand-600 font-semibold">
                                                            <Star size={9} className="inline fill-brand-500 text-brand-500" />{' '}
                                                            {q.best_score}
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                            <div className="shrink-0">
                                                {hasInProgress ? (
                                                    <Badge tone="warning">Lanjutkan</Badge>
                                                ) : isExhausted ? (
                                                    <Badge tone="success">Selesai</Badge>
                                                ) : (
                                                    <ChevronRight size={14} className="text-ink/30" />
                                                )}
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </AppLayout>
    );
}
