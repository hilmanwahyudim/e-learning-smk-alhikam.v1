import { router, useForm } from '@inertiajs/react';
import { Edit2, Plus, Trash2, Users } from 'lucide-react';
import { useState } from 'react';
import DataTable from '../../../Components/DataTable';
import Modal from '../../../Components/Modal';
import { Badge, Card, PageHeader } from '../../../Components/ui';
import AppLayout from '../../../Layouts/AppLayout';
import { confirmAction } from '../../../lib/swal';

export default function Index({ teachers }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        username: '',
        email: '',
        password: '',
        is_active: true,
        nip: '',
        gender: 'L',
        phone: '',
        address: '',
        specialization: '',
    });

    const openCreateModal = () => {
        setEditingTeacher(null);
        setData({
            name: '',
            username: '',
            email: '',
            password: 'password', // default password
            is_active: true,
            nip: '',
            gender: 'L',
            phone: '',
            address: '',
            specialization: '',
        });
        clearErrors();
        setModalOpen(true);
    };

    const openEditModal = (t) => {
        setEditingTeacher(t);
        setData({
            name: t.user?.name || '',
            username: t.user?.username || '',
            email: t.user?.email || '',
            password: '',
            is_active: t.user?.is_active ?? true,
            nip: t.nip || '',
            gender: t.gender || 'L',
            phone: t.phone || '',
            address: t.address || '',
            specialization: t.specialization || '',
        });
        clearErrors();
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingTeacher(null);
        reset();
        clearErrors();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingTeacher) {
            put(`/admin/teachers/${editingTeacher.id}`, {
                onSuccess: () => closeModal(),
            });
        } else {
            post('/admin/teachers', {
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = async (t) => {
        const confirmed = await confirmAction({
            title: `Hapus Guru ${t.user?.name}?`,
            text: 'Guru yang masih terdaftar sebagai wali kelas atau memiliki penugasan aktif tidak dapat dihapus.',
            confirmText: 'Ya, hapus',
            danger: true,
        });

        if (confirmed) {
            router.delete(`/admin/teachers/${t.id}`);
        }
    };

    const columns = [
        {
            key: 'name',
            label: 'Guru & Akun',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-100 font-bold text-xs text-brand-800">
                        {row.user?.name?.substring(0, 2)?.toUpperCase()}
                    </span>
                    <div>
                        <span className="font-bold text-brand-950 block">{row.user?.name}</span>
                        <div className="text-xs text-ink/60 flex items-center gap-2">
                            <span>@{row.user?.username}</span>
                            <span>•</span>
                            <span>{row.user?.email}</span>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            key: 'nip',
            label: 'NIP',
            render: (row) => (
                <span className="font-mono text-xs text-ink/80">
                    {row.nip || <span className="text-ink/40 italic">-</span>}
                </span>
            ),
        },
        {
            key: 'specialization',
            label: 'Keahlian / Mapel',
            render: (row) => (
                <span className="text-sm font-medium text-ink/80">
                    {row.specialization || <span className="text-ink/40 italic">-</span>}
                </span>
            ),
        },
        {
            key: 'teaching_load',
            label: 'Tugas Mengajar',
            render: (row) => (
                <div className="space-y-1">
                    <Badge tone="info">{row.teacher_subjects_count} Mapel/Kelas</Badge>
                    {row.homeroom_classes_count > 0 && (
                        <div>
                            <Badge tone="warning">Wali Kelas</Badge>
                        </div>
                    )}
                </div>
            ),
        },
        {
            key: 'phone',
            label: 'Kontak',
            render: (row) => <span className="text-xs text-ink/70">{row.phone || '-'}</span>,
        },
        {
            key: 'status',
            label: 'Status',
            render: (row) =>
                row.user?.is_active ? (
                    <Badge tone="success">Aktif</Badge>
                ) : (
                    <Badge tone="danger">Nonaktif</Badge>
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
                        title="Edit Guru"
                        className="grid size-8 place-items-center rounded-lg text-ink/70 hover:bg-brand-50 hover:text-brand-700 transition"
                    >
                        <Edit2 size={16} />
                    </button>
                    <button
                        type="button"
                        onClick={() => handleDelete(row)}
                        title="Hapus Guru"
                        className="grid size-8 place-items-center rounded-lg text-red-600 hover:bg-red-50 transition"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <AppLayout title="Data Guru">
            <PageHeader
                title="Data Guru"
                subtitle="Kelola data tenaga pendidik dan akun pembelajaran SMK Al Hikam."
            >
                <button
                    type="button"
                    onClick={openCreateModal}
                    className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 transition"
                >
                    <Plus size={18} />
                    <span>Tambah Guru</span>
                </button>
            </PageHeader>

            <Card padded={false}>
                <DataTable
                    columns={columns}
                    rows={teachers}
                    searchKeys={['name', 'nip', 'specialization', 'phone']}
                    pageSize={10}
                    emptyTitle="Belum ada data guru"
                    emptyText="Klik Tambah Guru untuk memasukkan tenaga pendidik baru."
                />
            </Card>

            <Modal
                open={modalOpen}
                onClose={closeModal}
                title={editingTeacher ? 'Edit Data Guru' : 'Tambah Guru Baru'}
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
                            {processing ? 'Menyimpan…' : editingTeacher ? 'Perbarui Guru' : 'Simpan Guru'}
                        </button>
                    </>
                }
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-brand-950 mb-1">Nama Lengkap & Gelar</label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Contoh: Ahmad Fauzi, S.Kom."
                            className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                            required
                        />
                        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-semibold text-brand-950 mb-1">Username Login</label>
                            <input
                                type="text"
                                value={data.username}
                                onChange={(e) => setData('username', e.target.value.toLowerCase())}
                                placeholder="Contoh: afauzi"
                                className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                                required
                            />
                            {errors.username && <p className="mt-1 text-xs text-red-600">{errors.username}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-brand-950 mb-1">Email</label>
                            <input
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="guru@smkalhikam.sch.id"
                                className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                                required
                            />
                            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-semibold text-brand-950 mb-1">NIP (Opsional)</label>
                            <input
                                type="text"
                                value={data.nip}
                                onChange={(e) => setData('nip', e.target.value)}
                                placeholder="Nomor Induk Pegawai"
                                className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm font-mono focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                            />
                            {errors.nip && <p className="mt-1 text-xs text-red-600">{errors.nip}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-brand-950 mb-1">Jenis Kelamin</label>
                            <select
                                value={data.gender}
                                onChange={(e) => setData('gender', e.target.value)}
                                className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                            >
                                <option value="L">Laki-laki</option>
                                <option value="P">Perempuan</option>
                            </select>
                            {errors.gender && <p className="mt-1 text-xs text-red-600">{errors.gender}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-semibold text-brand-950 mb-1">No. Telepon / WhatsApp</label>
                            <input
                                type="text"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                placeholder="0812xxxxxxxx"
                                className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                            />
                            {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-brand-950 mb-1">Bidang Keahlian / Mapel</label>
                            <input
                                type="text"
                                value={data.specialization}
                                onChange={(e) => setData('specialization', e.target.value)}
                                placeholder="Misal: Rekayasa Perangkat Lunak"
                                className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                            />
                            {errors.specialization && (
                                <p className="mt-1 text-xs text-red-600">{errors.specialization}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-brand-950 mb-1">
                            Kata Sandi {editingTeacher && <span className="text-xs font-normal text-ink/60">(Kosongkan jika tidak diubah)</span>}
                        </label>
                        <input
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder={editingTeacher ? '••••••••' : 'Minimal 6 karakter (default: password)'}
                            className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                            required={!editingTeacher}
                        />
                        {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-brand-950 mb-1">Alamat Lengkap</label>
                        <textarea
                            value={data.address}
                            onChange={(e) => setData('address', e.target.value)}
                            rows={2}
                            placeholder="Alamat domisili..."
                            className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                        />
                        {errors.address && <p className="mt-1 text-xs text-red-600">{errors.address}</p>}
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer pt-1">
                        <input
                            type="checkbox"
                            checked={data.is_active}
                            onChange={(e) => setData('is_active', e.target.checked)}
                            className="size-4 rounded border-ink/20 text-brand-600 focus:ring-brand-500"
                        />
                        <span className="text-sm font-medium text-brand-950">Akun Aktif (Dapat login ke sistem)</span>
                    </label>
                </form>
            </Modal>
        </AppLayout>
    );
}
