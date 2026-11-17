import { router, useForm } from '@inertiajs/react';
import { Archive, BookOpen, Download, Edit2, ExternalLink, Plus, Trash2, Video } from 'lucide-react';
import { useState } from 'react';
import DataTable from '../../../Components/DataTable';
import Modal from '../../../Components/Modal';
import { Badge, Card, PageHeader } from '../../../Components/ui';
import AppLayout from '../../../Layouts/AppLayout';
import { confirmAction } from '../../../lib/swal';

export default function Index({ materials, classes, filters }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingMaterial, setEditingMaterial] = useState(null);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        teacher_subject_id: classes[0]?.id || '',
        title: '',
        description: '',
        content: '',
        video_url: '',
        sort_order: 1,
        is_published: true,
        files: [],
    });

    const handleFilterChange = (key, value) => {
        router.get(
            '/teacher/materials',
            { ...filters, [key]: value },
            { preserveState: true, replace: true }
        );
    };

    const openCreateModal = () => {
        setEditingMaterial(null);
        setData({
            teacher_subject_id: filters.teacher_subject_id !== 'all' ? filters.teacher_subject_id : (classes[0]?.id || ''),
            title: '',
            description: '',
            content: '',
            video_url: '',
            sort_order: materials.length + 1,
            is_published: true,
            files: [],
        });
        clearErrors();
        setModalOpen(true);
    };

    const openEditModal = (m) => {
        setEditingMaterial(m);
        const videoFile = m.files?.find((f) => f.type === 'video');
        setData({
            teacher_subject_id: m.teacher_subject_id,
            title: m.title,
            description: m.description || '',
            content: m.content || '',
            video_url: videoFile?.url || '',
            sort_order: m.sort_order,
            is_published: m.is_published,
            files: [],
        });
        clearErrors();
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingMaterial(null);
        reset();
        clearErrors();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingMaterial) {
            router.post(`/teacher/materials/${editingMaterial.id}`, {
                _method: 'put',
                ...data,
            }, {
                onSuccess: () => closeModal(),
            });
        } else {
            post('/teacher/materials', {
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = async (m) => {
        const confirmed = await confirmAction({
            title: `Hapus Materi ${m.title}?`,
            text: 'Materi beserta berkas lampirannya akan dihapus.',
            confirmText: 'Ya, hapus',
            danger: true,
        });

        if (confirmed) {
            router.delete(`/teacher/materials/${m.id}`);
        }
    };

    const handleArchive = async (m) => {
        const actionText = m.archived_at ? 'pulihkan dari arsip' : 'arsipkan';
        const confirmed = await confirmAction({
            title: `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} Materi?`,
            text: `Materi "${m.title}" akan di-${actionText}.`,
            confirmText: `Ya, ${actionText}`,
        });

        if (confirmed) {
            router.post(`/teacher/materials/${m.id}/archive`);
        }
    };

    const columns = [
        {
            key: 'sort_order',
            label: 'Pert.',
            render: (row) => (
                <span className="font-bold text-xs text-brand-700 bg-brand-50 px-2 py-1 rounded">
                    P-{row.sort_order}
                </span>
            ),
        },
        {
            key: 'title',
            label: 'Materi Pembelajaran',
            render: (row) => (
                <div>
                    <span className="font-bold text-brand-950 block">{row.title}</span>
                    <span className="text-xs text-ink/60">
                        {row.teacher_subject?.classroom?.name} • {row.teacher_subject?.subject?.name}
                    </span>
                    {row.description && <p className="mt-1 text-xs text-ink/70 line-clamp-1">{row.description}</p>}
                </div>
            ),
        },
        {
            key: 'files',
            label: 'Lampiran & Media',
            render: (row) => (
                <div className="flex flex-wrap gap-1 text-xs">
                    {row.files?.map((f) => (
                        <span key={f.id} className="inline-flex items-center gap-1 rounded bg-ink/5 px-2 py-0.5 text-[11px] text-ink/70">
                            {f.type === 'video' ? <Video size={12} className="text-red-600" /> : <BookOpen size={12} />}
                            <span className="max-w-[120px] truncate">{f.original_name}</span>
                        </span>
                    ))}
                    {(!row.files || row.files.length === 0) && <span className="text-xs text-ink/40 italic">Tidak ada</span>}
                </div>
            ),
        },
        {
            key: 'progress_count',
            label: 'Siswa Mempelajari',
            render: (row) => <Badge tone="info">{row.progress_count} Siswa</Badge>,
        },
        {
            key: 'status',
            label: 'Status',
            render: (row) =>
                row.is_published ? (
                    <Badge tone="success">Dipublikasi</Badge>
                ) : (
                    <Badge tone="neutral">Draft</Badge>
                ),
        },
        {
            key: 'actions',
            label: 'Aksi',
            render: (row) => (
                <div className="flex items-center gap-1.5">
                    <button
                        type="button"
                        onClick={() => openEditModal(row)}
                        title="Edit Materi"
                        className="grid size-8 place-items-center rounded-lg text-ink/70 hover:bg-brand-50 hover:text-brand-700 transition"
                    >
                        <Edit2 size={16} />
                    </button>
                    <button
                        type="button"
                        onClick={() => handleArchive(row)}
                        title={row.archived_at ? 'Pulihkan dari Arsip' : 'Pindahkan ke Arsip'}
                        className="grid size-8 place-items-center rounded-lg text-ink/70 hover:bg-gold-50 hover:text-gold-700 transition"
                    >
                        <Archive size={16} />
                    </button>
                    <button
                        type="button"
                        onClick={() => handleDelete(row)}
                        title="Hapus Materi"
                        className="grid size-8 place-items-center rounded-lg text-red-600 hover:bg-red-50 transition"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <AppLayout title="Materi Pembelajaran">
            <PageHeader
                title="Materi Pembelajaran"
                subtitle="Kelola modul pembelajaran, dokumen presentasi, dan tautan video per kelas."
            >
                <button
                    type="button"
                    onClick={openCreateModal}
                    disabled={classes.length === 0}
                    className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 transition disabled:opacity-50"
                >
                    <Plus size={18} />
                    <span>Tambah Materi</span>
                </button>
            </PageHeader>

            {/* Filter Bar */}
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

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => handleFilterChange('archived', false)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                            !filters.archived ? 'bg-brand-600 text-white' : 'border border-ink/20 text-ink/80 hover:bg-ink/5'
                        }`}
                    >
                        Materi Aktif
                    </button>
                    <button
                        type="button"
                        onClick={() => handleFilterChange('archived', true)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                            filters.archived ? 'bg-brand-600 text-white' : 'border border-ink/20 text-ink/80 hover:bg-ink/5'
                        }`}
                    >
                        Arsip Materi
                    </button>
                </div>
            </div>

            <Card padded={false}>
                <DataTable
                    columns={columns}
                    rows={materials}
                    searchKeys={['title', 'description', 'teacher_subject.classroom.name', 'teacher_subject.subject.name']}
                    pageSize={10}
                    emptyTitle="Belum ada materi pembelajaran"
                    emptyText="Klik Tambah Materi untuk mengunggah bahan ajar baru."
                />
            </Card>

            <Modal
                open={modalOpen}
                onClose={closeModal}
                title={editingMaterial ? 'Edit Materi Pembelajaran' : 'Tambah Materi Baru'}
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
                            {processing ? 'Menyimpan…' : editingMaterial ? 'Perbarui Materi' : 'Simpan & Publikasikan'}
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

                    <div className="grid grid-cols-4 gap-3">
                        <div className="col-span-3">
                            <label className="block text-sm font-semibold text-brand-950 mb-1">Judul Materi</label>
                            <input
                                type="text"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                placeholder="Contoh: Pengenalan Routing Dinamis OSPF"
                                className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                                required
                            />
                            {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-brand-950 mb-1">Pertemuan Ke</label>
                            <input
                                type="number"
                                min={1}
                                value={data.sort_order}
                                onChange={(e) => setData('sort_order', parseInt(e.target.value, 10) || 1)}
                                className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-brand-950 mb-1">Ringkasan Materi (Opsional)</label>
                        <input
                            type="text"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Deskripsi singkat capaian atau tujuan materi..."
                            className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-brand-950 mb-1">Isi / Uraian Materi</label>
                        <textarea
                            value={data.content}
                            onChange={(e) => setData('content', e.target.value)}
                            rows={4}
                            placeholder="Tuliskan materi teks atau instruksi belajar di sini..."
                            className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-brand-950 mb-1">Tautan Video Pembelajaran (YouTube / Embed)</label>
                        <input
                            type="url"
                            value={data.video_url}
                            onChange={(e) => setData('video_url', e.target.value)}
                            placeholder="https://www.youtube.com/watch?v=..."
                            className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                        />
                        {errors.video_url && <p className="mt-1 text-xs text-red-600">{errors.video_url}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-brand-950 mb-1">Unggah Berkas Lampiran (PDF, PPTX, DOCX, ZIP)</label>
                        <input
                            type="file"
                            multiple
                            onChange={(e) => setData('files', Array.from(e.target.files))}
                            className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-brand-50 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-brand-700 hover:file:bg-brand-100"
                        />
                        <p className="mt-1 text-xs text-ink/50">Maksimal 25MB per berkas.</p>
                        {errors['files.0'] && <p className="mt-1 text-xs text-red-600">{errors['files.0']}</p>}
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer pt-1">
                        <input
                            type="checkbox"
                            checked={data.is_published}
                            onChange={(e) => setData('is_published', e.target.checked)}
                            className="size-4 rounded border-ink/20 text-brand-600 focus:ring-brand-500"
                        />
                        <span className="text-sm font-medium text-brand-950">Publikasikan langsung agar dapat diakses siswa</span>
                    </label>
                </form>
            </Modal>
        </AppLayout>
    );
}
