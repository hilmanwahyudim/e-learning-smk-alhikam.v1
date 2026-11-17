import { Link, router, useForm } from '@inertiajs/react';
import { AlertCircle, CheckCircle, ClipboardList, Download, Edit2, Eye, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import DataTable from '../../../Components/DataTable';
import Modal from '../../../Components/Modal';
import { Badge, Card, PageHeader } from '../../../Components/ui';
import AppLayout from '../../../Layouts/AppLayout';
import { confirmAction } from '../../../lib/swal';

export default function Index({ assignments, classes, filters }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingAssignment, setEditingAssignment] = useState(null);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        teacher_subject_id: classes[0]?.id || '',
        title: '',
        description: '',
        start_at: '',
        deadline_at: '',
        max_score: 100,
        allow_late: true,
        files: [],
    });

    const handleFilterChange = (key, value) => {
        router.get(
            '/teacher/assignments',
            { ...filters, [key]: value },
            { preserveState: true, replace: true }
        );
    };

    const openCreateModal = () => {
        setEditingAssignment(null);
        setData({
            teacher_subject_id: filters.teacher_subject_id !== 'all' ? filters.teacher_subject_id : (classes[0]?.id || ''),
            title: '',
            description: '',
            start_at: '',
            deadline_at: '',
            max_score: 100,
            allow_late: true,
            files: [],
        });
        clearErrors();
        setModalOpen(true);
    };

    const openEditModal = (a) => {
        setEditingAssignment(a);
        setData({
            teacher_subject_id: a.teacher_subject_id,
            title: a.title,
            description: a.description || '',
            start_at: a.start_at ? a.start_at.substring(0, 16) : '',
            deadline_at: a.deadline_at ? a.deadline_at.substring(0, 16) : '',
            max_score: a.max_score,
            allow_late: a.allow_late,
            files: [],
        });
        clearErrors();
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingAssignment(null);
        reset();
        clearErrors();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingAssignment) {
            router.post(`/teacher/assignments/${editingAssignment.id}`, {
                _method: 'put',
                ...data,
            }, {
                onSuccess: () => closeModal(),
            });
        } else {
            post('/teacher/assignments', {
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = async (a) => {
        const confirmed = await confirmAction({
            title: `Hapus Tugas ${a.title}?`,
            text: 'Data tugas beserta berkas lampiran dan pengumpulan siswa akan dihapus.',
            confirmText: 'Ya, hapus',
            danger: true,
        });

        if (confirmed) {
            router.delete(`/teacher/assignments/${a.id}`);
        }
    };

    const columns = [
        {
            key: 'title',
            label: 'Judul Tugas',
            render: (row) => (
                <div>
                    <Link
                        href={`/teacher/assignments/${row.id}`}
                        className="font-bold text-brand-950 hover:text-brand-700 hover:underline block"
                    >
                        {row.title}
                    </Link>
                    <span className="text-xs text-ink/60">
                        {row.class_name} • {row.subject_name}
                    </span>
                </div>
            ),
        },
        {
            key: 'deadline_at',
            label: 'Tenggat Waktu',
            render: (row) => (
                <div>
                    <span className="text-xs font-semibold block text-brand-950">
                        {row.deadline_at}
                    </span>
                    {row.is_past_deadline ? (
                        <span className="text-[11px] font-medium text-red-600 flex items-center gap-1">
                            <AlertCircle size={12} /> Lewat deadline
                        </span>
                    ) : (
                        <span className="text-[11px] font-medium text-brand-700 flex items-center gap-1">
                            <CheckCircle size={12} /> Masih aktif
                        </span>
                    )}
                </div>
            ),
        },
        {
            key: 'submissions_count',
            label: 'Pengumpulan',
            render: (row) => (
                <div className="space-y-0.5">
                    <Badge tone="info">
                        {row.submissions_count} / {row.total_students} Siswa
                    </Badge>
                </div>
            ),
        },
        {
            key: 'rules',
            label: 'Pengaturan',
            render: (row) => (
                <div className="text-xs text-ink/70">
                    <p>Maks. Skor: {row.max_score}</p>
                    <p className="text-[11px] text-ink/50">
                        {row.allow_late ? 'Boleh terlambat' : 'Tolak terlambat'}
                    </p>
                </div>
            ),
        },
        {
            key: 'actions',
            label: 'Aksi',
            render: (row) => (
                <div className="flex items-center gap-1.5">
                    <Link
                        href={`/teacher/assignments/${row.id}`}
                        title="Periksa Pengumpulan Siswa"
                        className="grid size-8 place-items-center rounded-lg text-ink/70 hover:bg-brand-50 hover:text-brand-700 transition"
                    >
                        <Eye size={16} />
                    </Link>
                    <button
                        type="button"
                        onClick={() => openEditModal(row)}
                        title="Edit Tugas"
                        className="grid size-8 place-items-center rounded-lg text-ink/70 hover:bg-brand-50 hover:text-brand-700 transition"
                    >
                        <Edit2 size={16} />
                    </button>
                    <button
                        type="button"
                        onClick={() => handleDelete(row)}
                        title="Hapus Tugas"
                        className="grid size-8 place-items-center rounded-lg text-red-600 hover:bg-red-50 transition"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <AppLayout title="Tugas Online">
            <PageHeader
                title="Tugas Online"
                subtitle="Kelola penugasan belajar, batas waktu pengumpulan, dan pantau pengumpulan tugas siswa."
            >
                <button
                    type="button"
                    onClick={openCreateModal}
                    disabled={classes.length === 0}
                    className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 transition disabled:opacity-50"
                >
                    <Plus size={18} />
                    <span>Tambah Tugas Baru</span>
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
                    rows={assignments}
                    searchKeys={['title', 'class_name', 'subject_name']}
                    pageSize={10}
                    emptyTitle="Belum ada tugas online"
                    emptyText="Klik Tambah Tugas Baru untuk memberikan tugas mandiri ke kelas."
                />
            </Card>

            <Modal
                open={modalOpen}
                onClose={closeModal}
                title={editingAssignment ? 'Edit Tugas Online' : 'Tambah Tugas Online Baru'}
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
                            {processing ? 'Menyimpan…' : editingAssignment ? 'Perbarui Tugas' : 'Simpan & Bagikan'}
                        </button>
                    </>
                }
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
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
                        <label className="block text-sm font-semibold text-brand-950 mb-1">Judul Tugas</label>
                        <input
                            type="text"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            placeholder="Contoh: Latihan 1 - Konfigurasi Router MikroTik"
                            className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                            required
                        />
                        {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-brand-950 mb-1">Instruksi & Petunjuk Tugas</label>
                        <textarea
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            rows={3}
                            placeholder="Tuliskan petunjuk pengerjaan dan format laporan..."
                            className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-semibold text-brand-950 mb-1">Tenggat Waktu (Deadline)</label>
                            <input
                                type="datetime-local"
                                value={data.deadline_at}
                                onChange={(e) => setData('deadline_at', e.target.value)}
                                className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                                required
                            />
                            {errors.deadline_at && (
                                <p className="mt-1 text-xs text-red-600">{errors.deadline_at}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-brand-950 mb-1">Nilai Maksimal</label>
                            <input
                                type="number"
                                min={10}
                                max={100}
                                value={data.max_score}
                                onChange={(e) => setData('max_score', parseInt(e.target.value, 10) || 100)}
                                className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-brand-950 mb-1">Berkas Lampiran Soal / Panduan</label>
                        <input
                            type="file"
                            multiple
                            onChange={(e) => setData('files', Array.from(e.target.files))}
                            className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-brand-50 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-brand-700 hover:file:bg-brand-100"
                        />
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer pt-1">
                        <input
                            type="checkbox"
                            checked={data.allow_late}
                            onChange={(e) => setData('allow_late', e.target.checked)}
                            className="size-4 rounded border-ink/20 text-brand-600 focus:ring-brand-500"
                        />
                        <span className="text-sm font-medium text-brand-950">Izinkan pengumpulan setelah tenggat waktu (diberi status Terlambat)</span>
                    </label>
                </form>
            </Modal>
        </AppLayout>
    );
}
