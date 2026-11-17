import { Link, router, useForm } from '@inertiajs/react';
import { CheckCircle2, ClipboardCheck, Edit2, Eye, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import DataTable from '../../../Components/DataTable';
import Modal from '../../../Components/Modal';
import { Badge, Card, PageHeader } from '../../../Components/ui';
import AppLayout from '../../../Layouts/AppLayout';
import { confirmAction } from '../../../lib/swal';

export default function Index({ quizzes, classes, filters }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingQuiz, setEditingQuiz] = useState(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        teacher_subject_id: classes[0]?.id || '',
        title: '',
        type: 'quiz',
        instructions: '',
        start_at: '',
        end_at: '',
        duration_minutes: 60,
        shuffle_questions: true,
        shuffle_options: true,
        max_attempts: 1,
        show_result: true,
        is_published: false,
    });

    const handleFilterChange = (key, value) => {
        router.get(
            '/teacher/quizzes',
            { ...filters, [key]: value },
            { preserveState: true, replace: true }
        );
    };

    const openCreateModal = () => {
        setEditingQuiz(null);
        setData({
            teacher_subject_id: filters.teacher_subject_id !== 'all' ? filters.teacher_subject_id : (classes[0]?.id || ''),
            title: '',
            type: 'quiz',
            instructions: '',
            start_at: '',
            end_at: '',
            duration_minutes: 60,
            shuffle_questions: true,
            shuffle_options: true,
            max_attempts: 1,
            show_result: true,
            is_published: false,
        });
        clearErrors();
        setModalOpen(true);
    };

    const openEditModal = (q) => {
        setEditingQuiz(q);
        setData({
            teacher_subject_id: q.teacher_subject_id,
            title: q.title,
            type: q.type,
            instructions: q.instructions || '',
            start_at: q.start_at ? q.start_at.substring(0, 16) : '',
            end_at: q.end_at ? q.end_at.substring(0, 16) : '',
            duration_minutes: q.duration_minutes,
            shuffle_questions: q.shuffle_questions,
            shuffle_options: q.shuffle_options,
            max_attempts: q.max_attempts,
            show_result: q.show_result,
            is_published: q.is_published,
        });
        clearErrors();
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingQuiz(null);
        reset();
        clearErrors();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingQuiz) {
            put(`/teacher/quizzes/${editingQuiz.id}`, {
                onSuccess: () => closeModal(),
            });
        } else {
            post('/teacher/quizzes', {
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = async (q) => {
        const confirmed = await confirmAction({
            title: `Hapus Kuis ${q.title}?`,
            text: 'Data kuis beserta riwayat pengerjaan siswa akan dihapus.',
            confirmText: 'Ya, hapus',
            danger: true,
        });

        if (confirmed) {
            router.delete(`/teacher/quizzes/${q.id}`);
        }
    };

    const columns = [
        {
            key: 'title',
            label: 'Judul Kuis / Ujian',
            render: (row) => (
                <div>
                    <Link
                        href={`/teacher/quizzes/${row.id}`}
                        className="font-bold text-brand-950 hover:text-brand-700 hover:underline block"
                    >
                        {row.title}
                    </Link>
                    <span className="text-xs text-ink/60">
                        {row.teacher_subject?.classroom?.name} • {row.teacher_subject?.subject?.name}
                    </span>
                </div>
            ),
        },
        {
            key: 'type',
            label: 'Jenis',
            render: (row) => (
                <Badge tone={row.type === 'exam' ? 'danger' : 'info'}>
                    {row.type === 'exam' ? 'Ujian Resmi' : 'Kuis Harian'}
                </Badge>
            ),
        },
        {
            key: 'duration_minutes',
            label: 'Durasi & Soal',
            render: (row) => (
                <span className="text-xs font-medium text-ink/80">
                    {row.duration_minutes} Menit • {row.questions_count} Soal
                </span>
            ),
        },
        {
            key: 'attempts_count',
            label: 'Pengerjaan',
            render: (row) => (
                <span className="text-xs text-ink/70">
                    {row.attempts_count} kali dikerjakan
                </span>
            ),
        },
        {
            key: 'is_published',
            label: 'Status',
            render: (row) => (
                <Badge tone={row.is_published ? 'success' : 'neutral'}>
                    {row.is_published ? 'Aktif' : 'Draft'}
                </Badge>
            ),
        },
        {
            key: 'actions',
            label: 'Aksi',
            render: (row) => (
                <div className="flex items-center gap-1.5">
                    <Link
                        href={`/teacher/quizzes/${row.id}`}
                        title="Kelola Butir Soal"
                        className="grid size-8 place-items-center rounded-lg text-ink/70 hover:bg-brand-50 hover:text-brand-700 transition"
                    >
                        <Eye size={16} />
                    </Link>
                    <button
                        type="button"
                        onClick={() => openEditModal(row)}
                        title="Edit Pengaturan Kuis"
                        className="grid size-8 place-items-center rounded-lg text-ink/70 hover:bg-brand-50 hover:text-brand-700 transition"
                    >
                        <Edit2 size={16} />
                    </button>
                    <button
                        type="button"
                        onClick={() => handleDelete(row)}
                        title="Hapus Kuis"
                        className="grid size-8 place-items-center rounded-lg text-red-600 hover:bg-red-50 transition"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <AppLayout title="Kuis & Ujian Online">
            <PageHeader
                title="Kuis & Ujian Online"
                subtitle="Kelola penilaian digital, jadwal ujian, dan susun butir-butir soal ujian."
            >
                <button
                    type="button"
                    onClick={openCreateModal}
                    disabled={classes.length === 0}
                    className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 transition disabled:opacity-50"
                >
                    <Plus size={18} />
                    <span>Buat Kuis / Ujian</span>
                </button>
            </PageHeader>

            {/* Filter Bar */}
            <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-ink/10 bg-white p-4">
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
            </div>

            <Card padded={false}>
                <DataTable
                    columns={columns}
                    rows={quizzes}
                    searchKeys={['title', 'teacher_subject.classroom.name', 'teacher_subject.subject.name']}
                    pageSize={10}
                    emptyTitle="Belum ada kuis atau ujian"
                    emptyText="Klik Buat Kuis / Ujian untuk menyelenggarakan asesmen daring."
                />
            </Card>

            <Modal
                open={modalOpen}
                onClose={closeModal}
                title={editingQuiz ? 'Edit Pengaturan Kuis/Ujian' : 'Buat Kuis / Ujian Baru'}
                footer={
                    <>
                        <button
                            type="button"
                            onClick={closeModal}
                            disabled={processing}
                            className="rounded-lg border border-ink/20 px-4 py-2 text-sm font-medium text-ink/80 hover:bg-ink/5"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={processing}
                            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
                        >
                            {processing ? 'Menyimpan…' : editingQuiz ? 'Perbarui Kuis' : 'Simpan Kuis'}
                        </button>
                    </>
                }
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2">
                            <label className="block text-sm font-semibold text-brand-950 mb-1">Kelas & Mata Pelajaran</label>
                            <select
                                value={data.teacher_subject_id}
                                onChange={(e) => setData('teacher_subject_id', e.target.value)}
                                className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                                required
                            >
                                {classes.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                            {errors.teacher_subject_id && (
                                <p className="mt-1 text-xs text-red-600">{errors.teacher_subject_id}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-brand-950 mb-1">Jenis Tes</label>
                            <select
                                value={data.type}
                                onChange={(e) => setData('type', e.target.value)}
                                className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                            >
                                <option value="quiz">Kuis Harian</option>
                                <option value="exam">Ujian (UTS / UAS)</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-brand-950 mb-1">Judul Kuis / Ujian</label>
                        <input
                            type="text"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            placeholder="Contoh: Penilaian Harian Bab 1 - Jaringan Dasar"
                            className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                            required
                        />
                        {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-semibold text-brand-950 mb-1">Durasi Pengerjaan (Menit)</label>
                            <input
                                type="number"
                                min={5}
                                max={300}
                                value={data.duration_minutes}
                                onChange={(e) => setData('duration_minutes', parseInt(e.target.value, 10) || 60)}
                                className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-brand-950 mb-1">Batas Percobaan</label>
                            <input
                                type="number"
                                min={1}
                                max={10}
                                value={data.max_attempts}
                                onChange={(e) => setData('max_attempts', parseInt(e.target.value, 10) || 1)}
                                className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-brand-950 mb-1">Petunjuk Pengerjaan</label>
                        <textarea
                            value={data.instructions}
                            onChange={(e) => setData('instructions', e.target.value)}
                            rows={2}
                            placeholder="Petunjuk dan tata tertib ujian..."
                            className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                        />
                    </div>

                    <div className="space-y-2 border-t border-ink/10 pt-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.shuffle_questions}
                                onChange={(e) => setData('shuffle_questions', e.target.checked)}
                                className="size-4 rounded border-ink/20 text-brand-600 focus:ring-brand-500"
                            />
                            <span className="text-xs font-medium text-brand-950">Acak urutan soal untuk setiap siswa</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.shuffle_options}
                                onChange={(e) => setData('shuffle_options', e.target.checked)}
                                className="size-4 rounded border-ink/20 text-brand-600 focus:ring-brand-500"
                            />
                            <span className="text-xs font-medium text-brand-950">Acak pilihan jawaban (A, B, C, D)</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.show_result}
                                onChange={(e) => setData('show_result', e.target.checked)}
                                className="size-4 rounded border-ink/20 text-brand-600 focus:ring-brand-500"
                            />
                            <span className="text-xs font-medium text-brand-950">Tampilkan skor dan pembahasan setelah selesai</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.is_published}
                                onChange={(e) => setData('is_published', e.target.checked)}
                                className="size-4 rounded border-ink/20 text-brand-600 focus:ring-brand-500"
                            />
                            <span className="text-xs font-medium text-brand-950">Publikasikan agar dapat dilihat siswa</span>
                        </label>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
