import { router, useForm } from '@inertiajs/react';
import { BookOpen, Edit2, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import DataTable from '../../../Components/DataTable';
import Modal from '../../../Components/Modal';
import { Badge, Card, PageHeader } from '../../../Components/ui';
import AppLayout from '../../../Layouts/AppLayout';
import { confirmAction } from '../../../lib/swal';

export default function Index({ subjects, departments, filters }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingSubject, setEditingSubject] = useState(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        code: '',
        name: '',
        department_id: '',
        description: '',
    });

    const handleFilterChange = (departmentId) => {
        router.get(
            '/admin/subjects',
            { department_id: departmentId },
            { preserveState: true, replace: true }
        );
    };

    const openCreateModal = () => {
        setEditingSubject(null);
        setData({
            code: '',
            name: '',
            department_id: filters.department_id !== 'all' && filters.department_id !== 'general' ? filters.department_id : '',
            description: '',
        });
        clearErrors();
        setModalOpen(true);
    };

    const openEditModal = (s) => {
        setEditingSubject(s);
        setData({
            code: s.code,
            name: s.name,
            department_id: s.department_id || '',
            description: s.description || '',
        });
        clearErrors();
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingSubject(null);
        reset();
        clearErrors();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingSubject) {
            put(`/admin/subjects/${editingSubject.id}`, {
                onSuccess: () => closeModal(),
            });
        } else {
            post('/admin/subjects', {
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = async (s) => {
        const confirmed = await confirmAction({
            title: `Hapus Mapel ${s.name}?`,
            text: 'Mata pelajaran yang sudah ditugaskan ke guru atau memiliki bank soal tidak dapat dihapus.',
            confirmText: 'Ya, hapus',
            danger: true,
        });

        if (confirmed) {
            router.delete(`/admin/subjects/${s.id}`);
        }
    };

    const columns = [
        {
            key: 'code',
            label: 'Kode',
            render: (row) => (
                <span className="font-mono font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                    {row.code}
                </span>
            ),
        },
        {
            key: 'name',
            label: 'Nama Mata Pelajaran',
            render: (row) => (
                <div>
                    <span className="font-semibold text-brand-950">{row.name}</span>
                    {row.description && <p className="text-xs text-ink/60 line-clamp-1">{row.description}</p>}
                </div>
            ),
        },
        {
            key: 'category',
            label: 'Kategori / Jurusan',
            render: (row) =>
                row.department ? (
                    <Badge tone="info">{row.department.name} ({row.department.code})</Badge>
                ) : (
                    <Badge tone="neutral">Mata Pelajaran Umum (Semua Jurusan)</Badge>
                ),
        },
        {
            key: 'teacher_subjects_count',
            label: 'Penugasan',
            render: (row) => <Badge tone="neutral">{row.teacher_subjects_count} Kelas/Guru</Badge>,
        },
        {
            key: 'actions',
            label: 'Aksi',
            render: (row) => (
                <div className="flex items-center gap-1.5">
                    <button
                        type="button"
                        onClick={() => openEditModal(row)}
                        title="Edit Mata Pelajaran"
                        className="grid size-8 place-items-center rounded-lg text-ink/70 hover:bg-brand-50 hover:text-brand-700 transition"
                    >
                        <Edit2 size={16} />
                    </button>
                    <button
                        type="button"
                        onClick={() => handleDelete(row)}
                        title="Hapus Mata Pelajaran"
                        className="grid size-8 place-items-center rounded-lg text-red-600 hover:bg-red-50 transition"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <AppLayout title="Mata Pelajaran">
            <PageHeader
                title="Mata Pelajaran"
                subtitle="Kelola kurikulum dan mata pelajaran umum maupun produktif kejuruan."
            >
                <button
                    type="button"
                    onClick={openCreateModal}
                    className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 transition"
                >
                    <Plus size={18} />
                    <span>Tambah Mata Pelajaran</span>
                </button>
            </PageHeader>

            {/* Filter Bar */}
            <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-ink/10 bg-white p-4">
                <span className="text-xs font-semibold text-ink/70">Filter Kategori:</span>
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={() => handleFilterChange('all')}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                            filters.department_id === 'all'
                                ? 'bg-brand-600 text-white'
                                : 'border border-ink/20 text-ink/80 hover:bg-ink/5'
                        }`}
                    >
                        Semua ({subjects.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => handleFilterChange('general')}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                            filters.department_id === 'general'
                                ? 'bg-brand-600 text-white'
                                : 'border border-ink/20 text-ink/80 hover:bg-ink/5'
                        }`}
                    >
                        Mapel Umum
                    </button>
                    {departments.map((d) => (
                        <button
                            key={d.id}
                            type="button"
                            onClick={() => handleFilterChange(d.id)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                                String(filters.department_id) === String(d.id)
                                ? 'bg-brand-600 text-white'
                                : 'border border-ink/20 text-ink/80 hover:bg-ink/5'
                            }`}
                        >
                            {d.code}
                        </button>
                    ))}
                </div>
            </div>

            <Card padded={false}>
                <DataTable
                    columns={columns}
                    rows={subjects}
                    searchKeys={['code', 'name', 'description']}
                    pageSize={10}
                    emptyTitle="Belum ada data mata pelajaran"
                    emptyText="Klik Tambah Mata Pelajaran untuk memasukkan mata pelajaran baru."
                />
            </Card>

            <Modal
                open={modalOpen}
                onClose={closeModal}
                title={editingSubject ? 'Edit Data Mata Pelajaran' : 'Tambah Mata Pelajaran Baru'}
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
                            {processing ? 'Menyimpan…' : editingSubject ? 'Perbarui Mapel' : 'Simpan Mapel'}
                        </button>
                    </>
                }
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="block text-sm font-semibold text-brand-950 mb-1">Kode Mapel</label>
                            <input
                                type="text"
                                value={data.code}
                                onChange={(e) => setData('code', e.target.value.toUpperCase())}
                                placeholder="Contoh: MTK"
                                maxLength={20}
                                className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm font-mono uppercase focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                                required
                            />
                            {errors.code && <p className="mt-1 text-xs text-red-600">{errors.code}</p>}
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-semibold text-brand-950 mb-1">Nama Mata Pelajaran</label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Contoh: Matematika Wajib"
                                className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                                required
                            />
                            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-brand-950 mb-1">Kategori Jurusan</label>
                        <select
                            value={data.department_id}
                            onChange={(e) => setData('department_id', e.target.value)}
                            className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                        >
                            <option value="">Mapel Umum (Bisa dipelajari semua jurusan)</option>
                            {departments.map((d) => (
                                <option key={d.id} value={d.id}>
                                    Khusus Jurusan {d.code} - {d.name}
                                </option>
                            ))}
                        </select>
                        {errors.department_id && (
                            <p className="mt-1 text-xs text-red-600">{errors.department_id}</p>
                        )}
                        <p className="mt-1 text-xs text-ink/50">
                            Pilih &quot;Mapel Umum&quot; jika mata pelajaran diajarkan di seluruh jurusan (misal: PAI, Bahasa Indonesia).
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-brand-950 mb-1">Deskripsi / Capaian (Opsional)</label>
                        <textarea
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Deskripsi singkat atau ringkasan capaian pembelajaran..."
                            rows={3}
                            className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                        />
                        {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
