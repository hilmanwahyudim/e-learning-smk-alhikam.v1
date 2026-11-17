import { Link, router, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    Award,
    CheckCircle2,
    ChevronRight,
    Clock,
    Download,
    Eye,
    FileText,
    GraduationCap,
    PenLine,
    Search,
} from 'lucide-react';
import { useState } from 'react';
import DataTable from '../../../Components/DataTable';
import Modal from '../../../Components/Modal';
import { Badge, Card, PageHeader } from '../../../Components/ui';
import AppLayout from '../../../Layouts/AppLayout';

export default function Index({ assignmentSubmissions, quizAttempts, classes, filters }) {
    const [activeTab, setActiveTab] = useState(filters.tab || 'assignments');
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [gradingModalOpen, setGradingModalOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        score: '',
        feedback: '',
    });

    const handleFilterChange = (key, value) => {
        router.get(
            '/teacher/grading',
            { ...filters, [key]: value, tab: activeTab },
            { preserveState: true, replace: true }
        );
    };

    const openGradeModal = (sub) => {
        setSelectedSubmission(sub);
        setData({
            score: sub.score !== null ? sub.score : '',
            feedback: sub.feedback || '',
        });
        setGradingModalOpen(true);
    };

    const closeGradeModal = () => {
        setGradingModalOpen(false);
        setSelectedSubmission(null);
        reset();
    };

    const submitGrading = (e) => {
        e.preventDefault();
        if (!selectedSubmission) return;

        post(`/teacher/grading/assignment/${selectedSubmission.id}`, {
            onSuccess: () => closeGradeModal(),
        });
    };

    const assignmentColumns = [
        {
            key: 'student',
            label: 'Siswa & Rombel',
            render: (row) => (
                <div>
                    <span className="font-bold text-brand-950 block">{row.student_name}</span>
                    <span className="text-xs text-ink/60">
                        NIS: {row.student_nis} • {row.class_name}
                    </span>
                </div>
            ),
        },
        {
            key: 'title',
            label: 'Tugas & Mapel',
            render: (row) => (
                <div>
                    <span className="font-semibold text-brand-950 block">{row.title}</span>
                    <span className="text-xs text-brand-700">{row.subject_name}</span>
                </div>
            ),
        },
        {
            key: 'status',
            label: 'Pengumpulan',
            render: (row) => (
                <div>
                    <Badge tone={row.is_late ? 'warning' : 'success'}>
                        {row.is_late ? 'Terlambat' : 'Tepat Waktu'}
                    </Badge>
                    <span className="text-[11px] text-ink/50 block mt-0.5">{row.submitted_at}</span>
                </div>
            ),
        },
        {
            key: 'file',
            label: 'Berkas Jawaban',
            render: (row) => (
                <div>
                    {row.has_file ? (
                        <a
                            href={`/teacher/submissions/${row.id}/download`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-brand-500/30 bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-100 transition"
                        >
                            <Download size={13} />
                            <span className="max-w-[120px] truncate">{row.original_name || 'Unduh Berkas'}</span>
                        </a>
                    ) : row.notes ? (
                        <span className="text-xs text-ink/70 italic">&quot;{row.notes.substring(0, 25)}...&quot;</span>
                    ) : (
                        <span className="text-xs text-ink/40">Tidak ada berkas</span>
                    )}
                </div>
            ),
        },
        {
            key: 'score',
            label: 'Nilai & Catatan',
            render: (row) => (
                <div>
                    {row.is_graded ? (
                        <div>
                            <span className="font-bold text-brand-700 text-sm">{row.score}</span>
                            <span className="text-xs text-ink/50"> / {row.max_score}</span>
                            {row.feedback && (
                                <p className="text-[11px] text-ink/60 truncate max-w-[140px] italic">
                                    &quot;{row.feedback}&quot;
                                </p>
                            )}
                        </div>
                    ) : (
                        <Badge tone="danger">Belum dinilai</Badge>
                    )}
                </div>
            ),
        },
        {
            key: 'actions',
            label: 'Aksi',
            render: (row) => (
                <button
                    type="button"
                    onClick={() => openGradeModal(row)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 transition"
                >
                    <PenLine size={13} />
                    <span>{row.is_graded ? 'Edit Nilai' : 'Beri Nilai'}</span>
                </button>
            ),
        },
    ];

    const quizColumns = [
        {
            key: 'student',
            label: 'Siswa & Rombel',
            render: (row) => (
                <div>
                    <span className="font-bold text-brand-950 block">{row.student_name}</span>
                    <span className="text-xs text-ink/60">
                        NIS: {row.student_nis} • {row.class_name}
                    </span>
                </div>
            ),
        },
        {
            key: 'title',
            label: 'Kuis/Ujian & Mapel',
            render: (row) => (
                <div>
                    <span className="font-semibold text-brand-950 block">{row.title}</span>
                    <span className="text-xs text-brand-700">
                        {row.subject_name} • {row.quiz_type === 'exam' ? 'Ujian Resmi' : 'Kuis Harian'}
                    </span>
                </div>
            ),
        },
        {
            key: 'finished_at',
            label: 'Waktu Selesai',
            render: (row) => <span className="text-xs text-ink/70">{row.finished_at || '-'}</span>,
        },
        {
            key: 'status',
            label: 'Status Penilaian',
            render: (row) => (
                <div>
                    {row.status === 'graded' ? (
                        <Badge tone="success">Sudah dinilai</Badge>
                    ) : (
                        <Badge tone="warning">Menunggu Koreksi Esai</Badge>
                    )}
                </div>
            ),
        },
        {
            key: 'score',
            label: 'Total Nilai',
            render: (row) => (
                <div>
                    {row.total_score !== null ? (
                        <span className="font-bold text-brand-700 text-sm">{row.total_score}</span>
                    ) : row.auto_score !== null ? (
                        <span className="text-xs text-ink/60 font-medium">Auto: {row.auto_score} (Esai pending)</span>
                    ) : (
                        <span className="text-xs text-ink/40">-</span>
                    )}
                </div>
            ),
        },
        {
            key: 'actions',
            label: 'Aksi',
            render: (row) => (
                <Link
                    href={`/teacher/grading/quiz-attempt/${row.id}`}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 transition"
                >
                    <PenLine size={13} />
                    <span>Koreksi Esai</span>
                </Link>
            ),
        },
    ];

    return (
        <AppLayout title="Koreksi Tugas & Ujian">
            <PageHeader
                title="Koreksi Tugas & Penilaian Ujian"
                subtitle="Periksa hasil pekerjaan siswa, berikan nilai capaian, dan sertakan umpan balik edukatif."
            />

            {/* Filter Rombel & Mapel */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink/10 bg-white p-4">
                <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-ink/70">Pilih Rombel / Mapel:</label>
                    <select
                        value={filters.teacher_subject_id}
                        onChange={(e) => handleFilterChange('teacher_subject_id', e.target.value)}
                        className="rounded-lg border border-ink/20 px-3 py-1.5 text-xs focus:border-brand-500 focus:outline-none"
                    >
                        <option value="all">Semua Kelas & Mapel</option>
                        {classes.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Tab Switcher */}
                <div className="flex items-center gap-1.5 rounded-lg bg-paper p-1 border border-ink/10">
                    <button
                        type="button"
                        onClick={() => setActiveTab('assignments')}
                        className={`rounded-md px-3 py-1.5 text-xs font-bold transition ${
                            activeTab === 'assignments'
                                ? 'bg-white text-brand-900 shadow-sm'
                                : 'text-ink/60 hover:text-brand-900'
                        }`}
                    >
                        Tugas Siswa ({assignmentSubmissions.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('quizzes')}
                        className={`rounded-md px-3 py-1.5 text-xs font-bold transition ${
                            activeTab === 'quizzes'
                                ? 'bg-white text-brand-900 shadow-sm'
                                : 'text-ink/60 hover:text-brand-900'
                        }`}
                    >
                        Kuis & Ujian Esai ({quizAttempts.length})
                    </button>
                </div>
            </div>

            {/* Table Content */}
            <Card padded={false}>
                {activeTab === 'assignments' ? (
                    <DataTable
                        columns={assignmentColumns}
                        rows={assignmentSubmissions}
                        searchKeys={['student_name', 'student_nis', 'title', 'class_name', 'subject_name']}
                        pageSize={10}
                        emptyTitle="Belum ada pengumpulan tugas"
                        emptyText="Siswa yang telah mengumpulkan tugas akan muncul di sini untuk dikoreksi."
                    />
                ) : (
                    <DataTable
                        columns={quizColumns}
                        rows={quizAttempts}
                        searchKeys={['student_name', 'student_nis', 'title', 'class_name', 'subject_name']}
                        pageSize={10}
                        emptyTitle="Belum ada pengerjaan kuis/ujian"
                        emptyText="Riwayat ujian siswa yang membutuhkan penilaian esai akan tampil di sini."
                    />
                )}
            </Card>

            {/* Modal Beri Nilai Tugas */}
            <Modal
                open={gradingModalOpen}
                onClose={closeGradeModal}
                title={`Koreksi Tugas: ${selectedSubmission?.title || ''}`}
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
                {selectedSubmission && (
                    <form onSubmit={submitGrading} className="space-y-4">
                        <div className="rounded-lg bg-paper p-3 text-xs border border-ink/10 space-y-1">
                            <p>
                                <span className="font-semibold text-ink/60">Siswa:</span>{' '}
                                <strong className="text-brand-950">{selectedSubmission.student_name}</strong> (NIS:{' '}
                                {selectedSubmission.student_nis})
                            </p>
                            <p>
                                <span className="font-semibold text-ink/60">Mata Pelajaran:</span>{' '}
                                {selectedSubmission.subject_name} ({selectedSubmission.class_name})
                            </p>
                            <p>
                                <span className="font-semibold text-ink/60">Waktu Pengumpulan:</span>{' '}
                                {selectedSubmission.submitted_at}
                            </p>
                            {selectedSubmission.notes && (
                                <p>
                                    <span className="font-semibold text-ink/60">Catatan Siswa:</span>{' '}
                                    <span className="italic text-brand-900">&quot;{selectedSubmission.notes}&quot;</span>
                                </p>
                            )}
                        </div>

                        {selectedSubmission.has_file && (
                            <div className="flex items-center justify-between rounded-lg border border-brand-200 bg-brand-50/50 p-3">
                                <span className="text-xs font-semibold text-brand-950">
                                    Berkas: {selectedSubmission.original_name}
                                </span>
                                <a
                                    href={`/teacher/submissions/${selectedSubmission.id}/download`}
                                    className="inline-flex items-center gap-1 rounded bg-brand-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-brand-700"
                                >
                                    <Download size={12} /> Unduh
                                </a>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-semibold text-brand-950 mb-1">
                                Nilai (0 - {selectedSubmission.max_score})
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                min="0"
                                max={selectedSubmission.max_score}
                                value={data.score}
                                onChange={(e) => setData('score', e.target.value)}
                                placeholder="Masukkan nilai angka..."
                                className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm font-semibold text-brand-950 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                                required
                            />
                            {errors.score && <p className="mt-1 text-xs text-red-600">{errors.score}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-brand-950 mb-1">
                                Catatan Guru / Feedback Edukatif
                            </label>
                            <textarea
                                rows={3}
                                value={data.feedback}
                                onChange={(e) => setData('feedback', e.target.value)}
                                placeholder="Berikan komentar perbaikan, apresiasi, atau poin evaluasi..."
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
