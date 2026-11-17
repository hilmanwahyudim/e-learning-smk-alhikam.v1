import { Link, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    CheckCircle2,
    Clock,
    Download,
    FileText,
    GraduationCap,
    Upload,
} from 'lucide-react';
import { useRef } from 'react';
import { Badge } from '../../../Components/ui';
import AppLayout from '../../../Layouts/AppLayout';

const STATUS_CONFIG = {
    not_submitted: { label: 'Belum Dikerjakan', tone: 'neutral' },
    submitted: { label: 'Sudah Dikumpulkan', tone: 'info' },
    late: { label: 'Terlambat', tone: 'warning' },
    graded: { label: 'Sudah Dinilai', tone: 'success' },
};

export default function Show({ assignment, submission }) {
    const fileInputRef = useRef(null);

    const { data, setData, post, processing, errors, progress } = useForm({
        file: null,
        notes: submission?.notes ?? '',
    });

    const isLocked = submission?.status === 'graded';
    const canSubmit = !isLocked && (assignment.allow_late || !assignment.is_past_deadline);

    const handleFileChange = (e) => {
        setData('file', e.target.files[0] ?? null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(`/student/assignments/${assignment.id}/submit`, {
            forceFormData: true,
        });
    };

    const cfg = STATUS_CONFIG[submission?.status ?? 'not_submitted'];

    return (
        <AppLayout title={assignment.title}>
            <div className="mb-4">
                <Link
                    href="/student/assignments"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 hover:text-brand-900"
                >
                    <ArrowLeft size={14} />
                    <span>Kembali ke Daftar Tugas</span>
                </Link>
            </div>

            {/* Assignment detail header */}
            <div className="mb-6 rounded-xl border border-ink/10 bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="text-xs font-semibold text-brand-600">{assignment.subject_name}</span>
                            <span className="text-xs text-ink/40">•</span>
                            <span className="text-xs text-ink/60 flex items-center gap-1">
                                <GraduationCap size={12} /> {assignment.teacher_name}
                            </span>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-brand-950">{assignment.title}</h1>
                    </div>
                    <Badge tone={cfg.tone}>{cfg.label}</Badge>
                </div>

                <div className="mt-4 flex flex-wrap gap-4 text-sm text-ink/70">
                    <span className="flex items-center gap-1.5">
                        <Clock size={14} />
                        Deadline:{' '}
                        <strong className={assignment.is_past_deadline ? 'text-red-600' : 'text-brand-950'}>
                            {assignment.deadline_at ?? 'Tanpa Batas Waktu'}
                        </strong>
                    </span>
                    <span className="flex items-center gap-1.5">
                        <CheckCircle2 size={14} />
                        Nilai Maks: <strong className="text-brand-950">{assignment.max_score}</strong>
                    </span>
                </div>

                {assignment.is_past_deadline && !isLocked && (
                    <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 ring-1 ring-red-200">
                        <AlertCircle size={14} />
                        Deadline sudah berakhir.{' '}
                        {assignment.allow_late
                            ? 'Pengumpulan terlambat masih diizinkan.'
                            : 'Pengumpulan tidak lagi diterima.'}
                    </div>
                )}

                {assignment.description && (
                    <div className="mt-4 rounded-lg bg-paper/60 p-4 border border-ink/10">
                        <p className="text-xs font-semibold uppercase tracking-wider text-ink/50 mb-2">
                            Instruksi Tugas
                        </p>
                        <p className="text-sm text-ink/80 whitespace-pre-wrap">{assignment.description}</p>
                    </div>
                )}

                {/* Teacher attachment files */}
                {assignment.files?.length > 0 && (
                    <div className="mt-4 border-t border-ink/10 pt-4">
                        <p className="text-xs font-semibold text-ink/60 mb-2">Lampiran Soal dari Guru:</p>
                        <div className="flex flex-wrap gap-2">
                            {assignment.files.map((file) => (
                                <a
                                    key={file.id}
                                    href={`/student/assignments/${assignment.id}/files/${file.id}/download`}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100 transition"
                                >
                                    <Download size={12} />
                                    {file.original_name}
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Submission area */}
            <div className="rounded-xl border border-ink/10 bg-white p-6 shadow-sm">
                <h2 className="text-base font-bold text-brand-950 mb-4">
                    {submission ? 'Jawaban Kamu' : 'Kumpulkan Jawaban'}
                </h2>

                {/* Graded result view */}
                {isLocked && (
                    <div className="mb-6 rounded-xl bg-green-50 p-5 ring-1 ring-green-200">
                        <div className="flex items-center gap-3 mb-3">
                            <CheckCircle2 size={20} className="text-green-600" />
                            <span className="font-bold text-green-800">Tugas Sudah Dinilai</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                            <div>
                                <p className="text-xs text-ink/50">Dikumpulkan</p>
                                <p className="font-semibold text-sm text-brand-950">{submission.submitted_at}</p>
                            </div>
                            <div>
                                <p className="text-xs text-ink/50">Status</p>
                                <Badge tone={submission.is_late ? 'warning' : 'success'}>
                                    {submission.is_late ? 'Terlambat' : 'Tepat Waktu'}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-xs text-ink/50">Nilai</p>
                                <p className="text-2xl font-bold text-brand-950">
                                    {submission.score}
                                    <span className="text-sm font-normal text-ink/50"> / {assignment.max_score}</span>
                                </p>
                            </div>
                        </div>
                        {submission.feedback && (
                            <div className="mt-4 rounded-lg bg-white p-4 border border-green-200">
                                <p className="text-xs font-semibold text-ink/60 mb-1">Komentar Guru:</p>
                                <p className="text-sm text-ink/80 italic whitespace-pre-wrap">{submission.feedback}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Existing submission summary (not graded yet) */}
                {submission && !isLocked && (
                    <div className="mb-5 rounded-lg bg-blue-50 p-4 ring-1 ring-blue-200 text-sm">
                        <p className="font-semibold text-blue-800 mb-1">
                            Kamu sudah mengumpulkan tugas ini{submission.is_late ? ' (Terlambat)' : ''}.
                        </p>
                        <p className="text-xs text-blue-700">
                            Dikumpulkan: {submission.submitted_at} • Berkas:{' '}
                            {submission.has_file ? (
                                <a
                                    href={`/student/submissions/${submission.id}/download`}
                                    className="font-semibold underline hover:text-blue-900"
                                >
                                    <Download size={12} className="inline mr-0.5" />
                                    {submission.original_name}
                                </a>
                            ) : (
                                'Tidak ada berkas'
                            )}
                        </p>
                        {submission.notes && (
                            <p className="text-xs text-blue-700 mt-1">Catatan: {submission.notes}</p>
                        )}
                        <p className="text-xs text-blue-600 mt-2 font-medium">
                            Kamu masih bisa mengumpulkan ulang untuk mengganti jawaban.
                        </p>
                    </div>
                )}

                {/* Upload form */}
                {canSubmit ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* File upload */}
                        <div>
                            <label className="block text-sm font-semibold text-brand-950 mb-2">
                                Berkas Jawaban{' '}
                                <span className="font-normal text-ink/50 text-xs">
                                    (PDF, DOC, DOCX, PPT, PPTX, JPG, PNG, ZIP — Maks. 20MB)
                                </span>
                            </label>
                            <div
                                className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 cursor-pointer transition ${
                                    data.file
                                        ? 'border-brand-400 bg-brand-50'
                                        : 'border-ink/20 hover:border-brand-300 hover:bg-paper/60'
                                }`}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {data.file ? (
                                    <div className="text-center">
                                        <FileText size={28} className="mx-auto text-brand-600 mb-2" />
                                        <p className="text-sm font-semibold text-brand-950">{data.file.name}</p>
                                        <p className="text-xs text-ink/50">
                                            {(data.file.size / 1024 / 1024).toFixed(2)} MB • Klik untuk ganti
                                        </p>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <Upload size={28} className="mx-auto text-ink/40 mb-2" />
                                        <p className="text-sm font-semibold text-ink/70">
                                            Klik untuk memilih berkas
                                        </p>
                                        <p className="text-xs text-ink/50">atau seret & lepas di sini</p>
                                    </div>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.zip"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </div>
                            {errors.file && <p className="mt-1 text-xs text-red-600">{errors.file}</p>}
                            {progress && (
                                <div className="mt-2 h-1.5 w-full rounded-full bg-ink/10 overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-brand-500 transition-all"
                                        style={{ width: `${progress.percentage}%` }}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-semibold text-brand-950 mb-1">
                                Catatan untuk Guru{' '}
                                <span className="font-normal text-ink/50 text-xs">(Opsional)</span>
                            </label>
                            <textarea
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                rows={3}
                                placeholder="Tambahkan catatan, penjelasan, atau pertanyaan untuk guru..."
                                className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={processing || (!data.file && !submission)}
                            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 transition disabled:opacity-50"
                        >
                            <Upload size={16} />
                            {processing ? 'Mengumpulkan…' : submission ? 'Kumpulkan Ulang' : 'Kumpulkan Tugas'}
                        </button>
                    </form>
                ) : !isLocked ? (
                    <div className="rounded-lg bg-red-50 p-4 ring-1 ring-red-200 text-sm text-red-700 flex items-center gap-2">
                        <AlertCircle size={16} />
                        Deadline sudah berakhir dan pengumpulan terlambat tidak diizinkan.
                    </div>
                ) : null}
            </div>
        </AppLayout>
    );
}
