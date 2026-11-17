import { useForm, router } from '@inertiajs/react';
import {
    Calendar,
    Edit2,
    Megaphone,
    Plus,
    School,
    Trash2,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import Modal from '../../../Components/Modal';
import { Badge, Card, EmptyState, PageHeader } from '../../../Components/ui';
import AppLayout from '../../../Layouts/AppLayout';
import { confirmAction } from '../../../lib/swal';

export default function Index({ announcements, classes }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        class_id: '',
        title: '',
        body: '',
        published_at: '',
    });

    const openCreateModal = () => {
        setEditingAnnouncement(null);
        setData({
            class_id: classes[0]?.id || '',
            title: '',
            body: '',
            published_at: new Date().toISOString().slice(0, 16),
        });
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
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingAnnouncement(null);
        reset();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingAnnouncement) {
            put(`/teacher/announcements/${editingAnnouncement.id}`, {
                onSuccess: () => closeModal(),
            });
        } else {
            post('/teacher/announcements', {
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = async (ann) => {
        const confirmed = await confirmAction({
            title: `Hapus Pengumuman?`,
            text: `Pengumuman "${ann.title}" akan dihapus.`,
            confirmText: 'Ya, hapus',
            danger: true,
        });

        if (confirmed) {
            router.delete(`/teacher/announcements/${ann.id}`);
        }
    };

    return (
        <AppLayout title="Pengumuman Kelas">
            <PageHeader
                title="Papan Pengumuman"
                subtitle="Sampaikan informasi penting, jadwal, dan pengumuman kegiatan kepada siswa di kelas."
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

            {announcements.length === 0 ? (
                <Card>
                    <EmptyState
                        icon={<Megaphone size={32} />}
                        title="Belum ada pengumuman"
                        description="Klik Buat Pengumuman untuk menyiarkan informasi ke kelas Anda."
                    />
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {announcements.map((ann) => (
                        <div
                            key={ann.id}
                            className="flex flex-col justify-between rounded-xl border border-ink/10 bg-white p-5 shadow-sm hover:border-brand-200 transition"
                        >
                            <div>
                                <div className="flex items-start justify-between gap-3 mb-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge tone={ann.class_id ? 'info' : 'primary'}>
                                            {ann.class_name}
                                        </Badge>
                                        {ann.is_mine && <Badge tone="success">Dibuat oleh Saya</Badge>}
                                    </div>

                                    {ann.is_mine && (
                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() => openEditModal(ann)}
                                                className="grid size-7 place-items-center rounded text-ink/50 hover:bg-brand-50 hover:text-brand-700 transition"
                                                title="Edit"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(ann)}
                                                className="grid size-7 place-items-center rounded text-red-500 hover:bg-red-50 transition"
                                                title="Hapus"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <h3 className="text-base font-bold text-brand-950 mb-2">{ann.title}</h3>
                                <p className="text-sm text-ink/80 whitespace-pre-wrap leading-relaxed">
                                    {ann.body}
                                </p>
                            </div>

                            <div className="mt-4 pt-3 border-t border-ink/10 flex items-center justify-between text-xs text-ink/50">
                                <span>Oleh: <strong className="text-brand-950">{ann.author_name}</strong></span>
                                <span className="flex items-center gap-1">
                                    <Calendar size={12} />
                                    {ann.published_at}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Form Pengumuman */}
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
                        <label className="block text-sm font-semibold text-brand-950 mb-1">Target Kelas</label>
                        <select
                            value={data.class_id}
                            onChange={(e) => setData('class_id', e.target.value)}
                            className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                            required
                        >
                            {classes.map((c) => (
                                <option key={c.id} value={c.id}>
                                    Kelas {c.name}
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
                            placeholder="Contoh: Pengingat Tugas Praktikum Jaringan..."
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
                            placeholder="Tuliskan isi pengumuman secara rinci..."
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
