import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, CheckCircle, Clock, Download, FileText, HelpCircle, PenLine, XCircle } from 'lucide-react';
import { useState } from 'react';
import Modal from '../../../Components/Modal';
import { Badge, Card, EmptyState, PageHeader } from '../../../Components/ui';
import AppLayout from '../../../Layouts/AppLayout';

export default function Show({ assignment, students }) {
    const submittedCount = students.filter((s) => s.status !== 'not_submitted').length;
    const gradedCount = students.filter((s) => s.status === 'graded').length;

    const [selectedStudent, setSelectedStudent] = useState(null);
    const [gradingModalOpen, setGradingModalOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        score: '',
        feedback: '',
    });

    const openGradeModal = (st) => {
        if (!st.submission_id) return;
        setSelectedStudent(st);
        setData({
            score: st.score !== null ? st.score : '',
            feedback: st.feedback || '',
        });
        setGradingModalOpen(true);
    };

    const closeGradeModal = () => {
        setGradingModalOpen(false);
        setSelectedStudent(null);
        reset();
    };

    const submitGrading = (e) => {
        e.preventDefault();
        if (!selectedStudent?.submission_id) return;

        post(`/teacher/grading/assignment/${selectedStudent.submission_id}`, {
            onSuccess: () => closeGradeModal(),
        });
    };

    return (
        <AppLayout title={`Pengumpulan: ${assignment.title}`}>
            <div className="mb-4">
                <Link
                    href="/teacher/assignments"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 hover:text-brand-900"
                >
                    <ArrowLeft size={14} />
                    <span>Kembali ke Daftar Tugas</span>
                </Link>
            </div>

            <div className="rounded-xl border border-ink/10 bg-white p-6 shadow-sm mb-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <Badge tone="info">Kelas {assignment.class_name}</Badge>
                            <span className="font-semibold text-xs text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                                {assignment.subject_name}
                            </span>
                        </div>
                        <h1 className="mt-2 text-2xl font-bold tracking-tight text-brand-950">
                            {assignment.title}
                        </h1>
                        <p className="mt-1 text-xs text-ink/60">
                            Tenggat Waktu: <span className="font-semibold text-brand-950">{assignment.deadline_at}</span> • Maksimal Nilai: {assignment.max_score}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <p className="text-xs text-ink/60">Progres Pengumpulan</p>
                            <p className="text-lg font-bold text-brand-950">
                                {submittedCount} / {students.length} Siswa
                            </p>
                        </div>
                    </div>
                </div>

                {assignment.description && (
                    <div className="mt-4 rounded-lg bg-paper/60 p-4 text-sm text-ink/80 prose max-w-none border border-ink/10">
                        <p className="font-semibold text-xs uppercase tracking-wider text-ink/50 mb-1">Instruksi Tugas:</p>
                        {assignment.description}
                    </div>
                )}

                {/* Lampiran Panduan Guru */}
                {assignment.files?.length > 0 && (
                    <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-ink/10 pt-3">
                        <span className="text-xs font-semibold text-ink/70">Lampiran Soal:</span>
                        {assignment.files.map((file) => (
                            <a
                                key={file.id}
                                href={`/teacher/assignments/${assignment.id}/download/${file.id}`}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-ink/20 bg-white px-2.5 py-1 text-xs font-medium text-brand-700 hover:bg-brand-50"
                            >
                                <Download size={13} />
                                <span>{file.original_name}</span>
                            </a>
                        ))}
                    </div>
                )}
            </div>

            {/* Tabel Monitoring Seluruh Siswa Rombel */}
            <Card title={`Daftar Pengumpulan Siswa (${students.length})`} padded={false}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-ink/[0.03] text-ink/70">
                            <tr>
                                <th className="px-4 py-2.5 font-semibold">No</th>
                                <th className="px-4 py-2.5 font-semibold">NIS</th>
                                <th className="px-4 py-2.5 font-semibold">Nama Siswa</th>
                                <th className="px-4 py-2.5 font-semibold">Status Pengumpulan</th>
                                <th className="px-4 py-2.5 font-semibold">Waktu Pengumpulan</th>
                                <th className="px-4 py-2.5 font-semibold">Berkas Jawaban</th>
                                <th className="px-4 py-2.5 font-semibold text-right">Nilai & Catatan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-ink/10">
                            {students.map((st, i) => (
                                <tr key={st.student_id} className="hover:bg-brand-50/50">
                                    <td className="px-4 py-3 text-xs text-ink/50">{i + 1}</td>
                                    <td className="px-4 py-3 font-mono font-medium text-brand-950">{st.nis}</td>
                                    <td className="px-4 py-3 font-semibold text-brand-950">{st.name}</td>
                                    <td className="px-4 py-3">
                                        {st.status === 'not_submitted' && (
                                            <Badge tone="danger">Belum mengumpulkan</Badge>
                                        )}
                                        {st.status === 'submitted' && (
                                            <Badge tone="success">Tepat waktu</Badge>
                                        )}
                                        {st.status === 'late' && (
                                            <Badge tone="warning">Terlambat</Badge>
                                        )}
                                        {st.status === 'graded' && (
                                            <Badge tone="info">Sudah dinilai</Badge>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-xs text-ink/70">
                                        {st.submitted_at || '-'}
                                    </td>
                                    <td className="px-4 py-3">
                                        {st.has_file ? (
                                            <a
                                                href={`/teacher/submissions/${st.submission_id}/download`}
                                                className="inline-flex items-center gap-1.5 rounded-lg border border-brand-500/30 bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-100 transition"
                                            >
                                                <Download size={13} />
                                                <span className="max-w-[140px] truncate">{st.original_name || 'Unduh Jawaban'}</span>
                                            </a>
                                        ) : st.notes ? (
                                            <span className="text-xs text-ink/70 italic">&quot;{st.notes.substring(0, 30)}...&quot;</span>
                                        ) : (
                                            <span className="text-xs text-ink/40">-</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {st.score !== null ? (
                                                <div className="text-right">
                                                    <span className="font-bold text-sm text-brand-700">{st.score}</span>
                                                    <span className="text-xs text-ink/50"> / {assignment.max_score}</span>
                                                    {st.feedback && (
                                                        <p className="text-[11px] text-ink/60 truncate max-w-[120px] ml-auto">
                                                            {st.feedback}
                                                        </p>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-ink/40 italic">Belum dinilai</span>
                                            )}

                                            {st.submission_id && (
                                                <button
                                                    type="button"
                                                    onClick={() => openGradeModal(st)}
                                                    className="inline-flex items-center gap-1 rounded bg-brand-50 border border-brand-500/30 px-2 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-100 transition"
                                                >
                                                    <PenLine size={12} />
                                                    <span>{st.score !== null ? 'Edit' : 'Nilai'}</span>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Modal Beri Nilai Tugas */}
            <Modal
                open={gradingModalOpen}
                onClose={closeGradeModal}
                title={`Beri Nilai Tugas: ${selectedStudent?.name || ''}`}
                footer={
                    <>
                        <button
                            type="button"
                            onClick={closeGradeModal}
                            disabled={processing}
                            className="rounded-lg border border-ink/20 px-4 py-2 text-sm font-medium text-ink/80 hover:bg-ink/5"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            onClick={submitGrading}
                            disabled={processing}
                            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
                        >
                            {processing ? 'Menyimpan…' : 'Simpan Nilai'}
                        </button>
                    </>
                }
            >
                {selectedStudent && (
                    <form onSubmit={submitGrading} className="space-y-4">
                        <div className="rounded-lg bg-paper p-3 text-xs border border-ink/10 space-y-1">
                            <p>
                                <span className="font-semibold text-ink/60">Siswa:</span>{' '}
                                <strong className="text-brand-950">{selectedStudent.name}</strong> (NIS: {selectedStudent.nis})
                            </p>
                            <p>
                                <span className="font-semibold text-ink/60">Waktu Pengumpulan:</span>{' '}
                                {selectedStudent.submitted_at || '-'}
                            </p>
                            {selectedStudent.notes && (
                                <p>
                                    <span className="font-semibold text-ink/60">Catatan Siswa:</span>{' '}
                                    <span className="italic text-brand-900">&quot;{selectedStudent.notes}&quot;</span>
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-brand-950 mb-1">
                                Nilai (Maks. {assignment.max_score})
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                min="0"
                                max={assignment.max_score}
                                value={data.score}
                                onChange={(e) => setData('score', e.target.value)}
                                placeholder="Masukkan nilai..."
                                className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm font-semibold text-brand-950 focus:border-brand-500 focus:outline-none"
                                required
                            />
                            {errors.score && <p className="mt-1 text-xs text-red-600">{errors.score}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-brand-950 mb-1">
                                Feedback / Catatan untuk Siswa
                            </label>
                            <textarea
                                rows={3}
                                value={data.feedback}
                                onChange={(e) => setData('feedback', e.target.value)}
                                placeholder="Berikan komentar perbaikan atau evaluasi..."
                                className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                            />
                            {errors.feedback && <p className="mt-1 text-xs text-red-600">{errors.feedback}</p>}
                        </div>
                    </form>
                )}
            </Modal>
        </AppLayout>
    );
}
