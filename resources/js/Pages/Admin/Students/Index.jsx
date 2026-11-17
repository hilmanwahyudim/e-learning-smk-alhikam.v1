import { router, useForm } from '@inertiajs/react';
import { Edit2, GraduationCap, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import DataTable from '../../../Components/DataTable';
import Modal from '../../../Components/Modal';
import { Badge, Card, PageHeader } from '../../../Components/ui';
import AppLayout from '../../../Layouts/AppLayout';
import { confirmAction } from '../../../lib/swal';

export default function Index({ students, classes, filters, activeYear }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        username: '',
        email: '',
        password: '',
        is_active: true,
        nis: '',
        nisn: '',
        gender: 'L',
        birth_place: '',
        birth_date: '',
        phone: '',
        address: '',
        guardian_name: '',
        guardian_phone: '',
        class_id: '',
    });

    const handleFilterChange = (classId) => {
        router.get(
            '/admin/students',
            { class_id: classId },
            { preserveState: true, replace: true }
        );
    };

    const openCreateModal = () => {
        setEditingStudent(null);
        setData({
            name: '',
            username: '',
            email: '',
            password: 'password', // default password
            is_active: true,
            nis: '',
            nisn: '',
            gender: 'L',
            birth_place: '',
            birth_date: '',
            phone: '',
            address: '',
            guardian_name: '',
            guardian_phone: '',
            class_id: filters.class_id !== 'all' ? filters.class_id : (classes[0]?.id || ''),
        });
        clearErrors();
        setModalOpen(true);
    };

    const openEditModal = (s) => {
        setEditingStudent(s);
        setData({
            name: s.name || '',
            username: s.username || '',
            email: s.email || '',
            password: '',
            is_active: s.is_active ?? true,
            nis: s.nis || '',
            nisn: s.nisn || '',
            gender: s.gender || 'L',
            birth_place: s.birth_place || '',
            birth_date: s.birth_date || '',
            phone: s.phone || '',
            address: s.address || '',
            guardian_name: s.guardian_name || '',
            guardian_phone: s.guardian_phone || '',
            class_id: s.class_id || '',
        });
        clearErrors();
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingStudent(null);
        reset();
        clearErrors();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingStudent) {
            put(`/admin/students/${editingStudent.id}`, {
                onSuccess: () => closeModal(),
            });
        } else {
            post('/admin/students', {
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = async (s) => {
        const confirmed = await confirmAction({
            title: `Hapus Siswa ${s.name}?`,
            text: 'Akun login dan data riwayat siswa akan dinonaktifkan.',
            confirmText: 'Ya, hapus',
            danger: true,
        });

        if (confirmed) {
            router.delete(`/admin/students/${s.id}`);
        }
    };

    const columns = [
        {
            key: 'name',
            label: 'Siswa & Akun',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-100 font-bold text-xs text-brand-800">
                        {row.name?.substring(0, 2)?.toUpperCase()}
                    </span>
                    <div>
                        <span className="font-bold text-brand-950 block">{row.name}</span>
                        <div className="text-xs text-ink/60 flex items-center gap-2">
                            <span>@{row.username}</span>
                            <span>•</span>
                            <span>{row.email}</span>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            key: 'nis',
            label: 'NIS / NISN',
            render: (row) => (
                <div>
                    <span className="font-mono text-xs font-semibold text-brand-950 block">NIS: {row.nis}</span>
                    {row.nisn && <span className="font-mono text-[11px] text-ink/50">NISN: {row.nisn}</span>}
                </div>
            ),
        },
        {
            key: 'classroom',
            label: 'Kelas Saat Ini',
            render: (row) =>
                row.classroom ? (
                    <Badge tone="info">{row.classroom.name}</Badge>
                ) : (
                    <Badge tone="warning">Belum ada kelas</Badge>
                ),
        },
        {
            key: 'gender',
            label: 'JK',
            render: (row) => (
                <span className="text-xs text-ink/70">
                    {row.gender === 'L' ? 'Laki-laki' : row.gender === 'P' ? 'Perempuan' : '-'}
                </span>
            ),
        },
        {
            key: 'guardian',
            label: 'Wali & Kontak',
            render: (row) => (
                <div className="text-xs">
                    <p className="font-medium text-ink/80">{row.guardian_name || '-'}</p>
                    <p className="text-ink/50">{row.phone || row.guardian_phone || '-'}</p>
                </div>
            ),
        },
        {
            key: 'status',
            label: 'Status',
            render: (row) =>
                row.is_active ? (
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
                        title="Edit Siswa"
                        className="grid size-8 place-items-center rounded-lg text-ink/70 hover:bg-brand-50 hover:text-brand-700 transition"
                    >
                        <Edit2 size={16} />
                    </button>
                    <button
                        type="button"
                        onClick={() => handleDelete(row)}
                        title="Hapus Siswa"
                        className="grid size-8 place-items-center rounded-lg text-red-600 hover:bg-red-50 transition"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <AppLayout title="Data Siswa">
            <PageHeader
                title="Data Siswa"
                subtitle={`Kelola data peserta didik dan penempatan kelas ${activeYear ? `(TA ${activeYear})` : ''}.`}
            >
                <button
                    type="button"
                    onClick={openCreateModal}
                    className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 transition"
                >
                    <Plus size={18} />
                    <span>Tambah Siswa</span>
                </button>
            </PageHeader>

            {/* Filter Bar */}
            <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-ink/10 bg-white p-4">
                <span className="text-xs font-semibold text-ink/70">Filter Rombel:</span>
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={() => handleFilterChange('all')}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                            filters.class_id === 'all'
                                ? 'bg-brand-600 text-white'
                                : 'border border-ink/20 text-ink/80 hover:bg-ink/5'
                        }`}
                    >
                        Semua Siswa ({students.length})
                    </button>
                    {classes.map((c) => (
                        <button
                            key={c.id}
                            type="button"
                            onClick={() => handleFilterChange(c.id)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                                String(filters.class_id) === String(c.id)
                                    ? 'bg-brand-600 text-white'
                                    : 'border border-ink/20 text-ink/80 hover:bg-ink/5'
                            }`}
                        >
                            {c.name}
                        </button>
                    ))}
                </div>
            </div>

            <Card padded={false}>
                <DataTable
                    columns={columns}
                    rows={students}
                    searchKeys={['name', 'username', 'nis', 'nisn', 'guardian_name']}
                    pageSize={10}
                    emptyTitle="Belum ada data siswa"
                    emptyText="Klik Tambah Siswa untuk menambahkan peserta didik baru."
                />
            </Card>

            <Modal
                open={modalOpen}
                onClose={closeModal}
                title={editingStudent ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
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
                            {processing ? 'Menyimpan…' : editingStudent ? 'Perbarui Siswa' : 'Simpan Siswa'}
                        </button>
                    </>
                }
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-brand-950 mb-1">Nama Lengkap Siswa</label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Contoh: Muhammad Rizki"
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
                                placeholder="Contoh: siswa01"
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
                                placeholder="siswa@smkalhikam.sch.id"
                                className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                                required
                            />
                            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-semibold text-brand-950 mb-1">NIS (Nomor Induk Siswa)</label>
                            <input
                                type="text"
                                value={data.nis}
                                onChange={(e) => setData('nis', e.target.value)}
                                placeholder="Contoh: 260101"
                                className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm font-mono focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                                required
                            />
                            {errors.nis && <p className="mt-1 text-xs text-red-600">{errors.nis}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-brand-950 mb-1">NISN (Nasional)</label>
                            <input
                                type="text"
                                value={data.nisn}
                                onChange={(e) => setData('nisn', e.target.value)}
                                placeholder="10 digit NISN"
                                className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm font-mono focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                            />
                            {errors.nisn && <p className="mt-1 text-xs text-red-600">{errors.nisn}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-semibold text-brand-950 mb-1">Penempatan Kelas</label>
                            <select
                                value={data.class_id}
                                onChange={(e) => setData('class_id', e.target.value)}
                                className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                            >
                                <option value="">-- Belum Masuk Kelas --</option>
                                {classes.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                            {errors.class_id && <p className="mt-1 text-xs text-red-600">{errors.class_id}</p>}
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
                            <label className="block text-sm font-semibold text-brand-950 mb-1">Tempat Lahir</label>
                            <input
                                type="text"
                                value={data.birth_place}
                                onChange={(e) => setData('birth_place', e.target.value)}
                                placeholder="Kota / Kabupaten"
                                className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-brand-950 mb-1">Tanggal Lahir</label>
                            <input
                                type="date"
                                value={data.birth_date}
                                onChange={(e) => setData('birth_date', e.target.value)}
                                className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-semibold text-brand-950 mb-1">Nama Orang Tua / Wali</label>
                            <input
                                type="text"
                                value={data.guardian_name}
                                onChange={(e) => setData('guardian_name', e.target.value)}
                                placeholder="Nama ayah / ibu / wali"
                                className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-brand-950 mb-1">No. Telp Wali / WhatsApp</label>
                            <input
                                type="text"
                                value={data.guardian_phone}
                                onChange={(e) => setData('guardian_phone', e.target.value)}
                                placeholder="08xxxxxxxxxx"
                                className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-brand-950 mb-1">
                            Kata Sandi {editingStudent && <span className="text-xs font-normal text-ink/60">(Kosongkan jika tidak diubah)</span>}
                        </label>
                        <input
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder={editingStudent ? '••••••••' : 'Minimal 6 karakter (default: password)'}
                            className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                            required={!editingStudent}
                        />
                        {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-brand-950 mb-1">Alamat Tempat Tinggal</label>
                        <textarea
                            value={data.address}
                            onChange={(e) => setData('address', e.target.value)}
                            rows={2}
                            placeholder="Alamat domisili siswa..."
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
                        <span className="text-sm font-medium text-brand-950">Akun Siswa Aktif</span>
                    </label>
                </form>
            </Modal>
        </AppLayout>
    );
}
