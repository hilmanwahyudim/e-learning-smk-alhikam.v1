import { useForm, router } from '@inertiajs/react';
import { Edit2, Library, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import DataTable from '../../../Components/DataTable';
import Modal from '../../../Components/Modal';
import { Badge, Card, PageHeader } from '../../../Components/ui';
import AppLayout from '../../../Layouts/AppLayout';
import { confirmAction } from '../../../lib/swal';

export default function Index({ departments }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingDept, setEditingDept] = useState(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        code: '',
        name: '',
        description: '',
    });

    const openCreateModal = () => {
        setEditingDept(null);
        setData({ code: '', name: '', description: '' });
        clearErrors();
        setModalOpen(true);
    };

    const openEditModal = (dept) => {
        setEditingDept(dept);
        setData({
            code: dept.code,
            name: dept.name,
            description: dept.description || '',
        });
        clearErrors();
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingDept(null);
        reset();
        clearErrors();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingDept) {
            put(`/admin/departments/${editingDept.id}`, {
                onSuccess: () => closeModal(),
            });
        } else {
            post('/admin/departments', {
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = async (dept) => {
        const confirmed = await confirmAction({
            title: `Hapus Jurusan ${dept.name}?`,
            text: 'Data jurusan yang masih terhubung dengan kelas atau mata pelajaran tidak dapat dihapus.',
            confirmText: 'Ya, hapus',
            danger: true,
        });

        if (confirmed) {
            router.delete(`/admin/departments/${dept.id}`);
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
            label: 'Nama Program Keahlian',
            render: (row) => (
                <div>
                    <span className="font-semibold text-brand-950">{row.name}</span>
                    {row.description && <p className="text-xs text-ink/60 line-clamp-1">{row.description}</p>}
                </div>
            ),
        },
        {
            key: 'classes_count',
            label: 'Kelas',
            render: (row) => <Badge tone="info">{row.classes_count} Kelas</Badge>,
        },
        {
            key: 'subjects_count',
            label: 'Mapel Kejuruan',
            render: (row) => <Badge tone="neutral">{row.subjects_count} Mapel</Badge>,
        },
        {
            key: 'actions',
            label: 'Aksi',
            render: (row) => (
                <div className="flex items-center gap-1.5">
                    <button
                        type="button"
                        onClick={() => openEditModal(row)}
                        title="Edit Jurusan"
                        className="grid size-8 place-items-center rounded-lg text-ink/70 hover:bg-brand-50 hover:text-brand-700 transition"
                    >
                        <Edit2 size={16} />
                    </button>
                    <button
                        type="button"
                        onClick={() => handleDelete(row)}
                        title="Hapus Jurusan"
                        className="grid size-8 place-items-center rounded-lg text-red-600 hover:bg-red-50 transition"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <AppLayout title="Data Jurusan">
            <PageHeader
                title="Jurusan / Program Keahlian"
                subtitle="Kelola jurusan dan kompetensi keahlian di SMK Al Hikam."
            >
                <button
                    type="button"
                    onClick={openCreateModal}
                    className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 transition"
                >
                    <Plus size={18} />
                    <span>Tambah Jurusan</span>
                </button>
            </PageHeader>

            <Card padded={false}>
                <DataTable
                    columns={columns}
                    rows={departments}
                    searchKeys={['code', 'name', 'description']}
                    pageSize={10}
                    emptyTitle="Belum ada data jurusan"
                    emptyText="Klik tombol Tambah Jurusan untuk menambahkan program keahlian baru."
                />
            </Card>

            <Modal
                open={modalOpen}
                onClose={closeModal}
                title={editingDept ? 'Edit Data Jurusan' : 'Tambah Jurusan Baru'}
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
                            {processing ? 'Menyimpan…' : editingDept ? 'Perbarui Jurusan' : 'Simpan Jurusan'}
                        </button>
                    </>
                }
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-brand-950 mb-1">Kode Jurusan</label>
                        <input
                            type="text"
                            value={data.code}
                            onChange={(e) => setData('code', e.target.value.toUpperCase())}
                            placeholder="Misal: TKJ, RPL, AKL"
                            maxLength={10}
                            className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 font-mono uppercase"
                            required
                        />
                        {errors.code && <p className="mt-1 text-xs text-red-600">{errors.code}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-brand-950 mb-1">Nama Jurusan</label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Misal: Teknik Komputer dan Jaringan"
                            className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                            required
                        />
                        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-brand-950 mb-1">Deskripsi (Opsional)</label>
                        <textarea
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Deskripsi singkat mengenai kompetensi keahlian..."
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
