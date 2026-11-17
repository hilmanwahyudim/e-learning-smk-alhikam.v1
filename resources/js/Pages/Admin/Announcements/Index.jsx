import { useForm, router } from '@inertiajs/react';
import {
    Calendar,
    Edit2,
    Megaphone,
    Plus,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import DataTable from '../../../Components/DataTable';
import Modal from '../../../Components/Modal';
import { Badge, Card, PageHeader } from '../../../Components/ui';
import AppLayout from '../../../Layouts/AppLayout';
import { confirmAction } from '../../../lib/swal';

export default function Index({ announcements, classes }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        class_id: '',
        title: '',
        body: '',
        published_at: '',
    });

    const openCreateModal = () => {
        setEditingAnnouncement(null);
        setData({
            class_id: '',
            title: '',
            body: '',
            published_at: new Date().toISOString().slice(0, 16),
        });
        clearErrors();
        setModalOpen(true);
    };

    const openEditModal = (ann) => {
        setEditingAnnouncement(ann);
        setData({
            class_id: ann.class_id || '',
            title: ann.title,
            body: ann.body,
            published_at: ann.published_at ? ann.published_at.replace(' ', 'T') : '',
        });
        clearErrors();
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingAnnouncement(null);
        reset();
        clearErrors();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingAnnouncement) {
            put(`/admin/announcements/${editingAnnouncement.id}`, {
                onSuccess: () => closeModal(),
            });
        } else {
            post('/admin/announcements', {
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = async (ann) => {
        const confirmed = await confirmAction({
            title: `Hapus Pengumuman?`,
            text: `Pengumuman "${ann.title}" akan dihapus dari sistem.`,
            confirmText: 'Ya, hapus',
            danger: true,
        });

        if (confirmed) {
            router.delete(`/admin/announcements/${ann.id}`);
        }
    };

    const columns = [
        {
            key: 'title',
            label: 'Judul & Ringkasan',
            render: (row) => (
                <div>
                    <span className="font-bold text-brand-950 block">{row.title}</span>
                    <span className="text-xs text-ink/60 line-clamp-1">{row.body}</span>
                </div>
            ),
        },
        {
            key: 'class_name',
            label: 'Target Distribusi',
            render: (row) => (
                <Badge tone={row.class_id ? 'info' : 'primary'}>
                    {row.class_name}
                </Badge>
            ),
        },
        {
            key: 'author_name',
            label: 'Penulis',
            render: (row) => <span className="text-xs font-semibold text-brand-950">{row.author_name}</span>,
        },
        {
            key: 'published_at',
            label: 'Waktu Publikasi',
            render: (row) => <span className="text-xs text-ink/70">{row.published_at}</span>,
        },
        {
            key: 'actions',
            label: 'Aksi',
            render: (row) => (
                <div className="flex items-center gap-1.5">
                    <button
                        type="button"
                        onClick={() => openEditModal(row)}
                        title="Edit"
                        className="grid size-8 place-items-center rounded-lg text-ink/70 hover:bg-brand-50 hover:text-brand-700 transition"
                    >
                        <Edit2 size={15} />
                    </button>
                    <button
                        type="button"
                        onClick={() => handleDelete(row)}
                        title="Hapus"
                        className="grid size-8 place-items-center rounded-lg text-red-600 hover:bg-red-50 transition"
                    >
                        <Trash2 size={15} />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <AppLayout title="Kelola Pengumuman Sekolah">
            <PageHeader
                title="Kelola Pengumuman Sekolah"
                subtitle="Siarkan pengumuman resmi ke seluruh civitas akademika atau kelas tertentu."
            >
                <button
                    type="button"
                    onClick={openCreateModal}
                    className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 transition"
                >
                    <Plus size={18} />
                    <span>Buat Pengumuman</span>
                </button>
            </PageHeader>

            <Card padded={false}>
                <DataTable
                    columns={columns}
                    rows={announcements}
                    searchKeys={['title', 'body', 'author_name', 'class_name']}
                    pageSize={10}
                    emptyTitle="Belum ada pengumuman"
                    emptyText="Klik Buat Pengumuman untuk menambahkan pengumuman baru."
                />
            </Card>

            <Modal
                open={modalOpen}
                onClose={closeModal}
                title={editingAnnouncement ? 'Edit Pengumuman' : 'Buat Pengumuman Baru'}
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
                            {processing ? 'Menyimpan…' : editingAnnouncement ? 'Perbarui' : 'Terbitkan'}
                        </button>
                    </>
                }
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-brand-950 mb-1">Target Sasaran</label>
                        <select
                            value={data.class_id}
                            onChange={(e) => setData('class_id', e.target.value)}
                            className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                        >
                            <option value="">Seluruh Sekolah (Semua Siswa & Guru)</option>
                            {classes.map((c) => (
                                <option key={c.id} value={c.id}>
                                    Khusus Kelas {c.name}
                                </option>
                            ))}
                        </select>
                        {errors.class_id && <p className="mt-1 text-xs text-red-600">{errors.class_id}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-brand-950 mb-1">Judul Pengumuman</label>
                        <input
                            type="text"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            placeholder="Contoh: Jadwal Penilaian Akhir Semester (PAS)..."
                            className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                            required
                        />
                        {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-brand-950 mb-1">Isi Pengumuman</label>
                        <textarea
                            rows={4}
                            value={data.body}
                            onChange={(e) => setData('body', e.target.value)}
                            placeholder="Tuliskan isi pengumuman secara lengkap..."
                            className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                            required
                        />
                        {errors.body && <p className="mt-1 text-xs text-red-600">{errors.body}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-brand-950 mb-1">Waktu Publikasi</label>
                        <input
                            type="datetime-local"
                            value={data.published_at}
                            onChange={(e) => setData('published_at', e.target.value)}
                            className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                        />
                        {errors.published_at && <p className="mt-1 text-xs text-red-600">{errors.published_at}</p>}
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
