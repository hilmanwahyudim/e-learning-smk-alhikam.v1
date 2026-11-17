import { router, useForm } from '@inertiajs/react';
import {
    CheckCircle2,
    KeyRound,
    Lock,
    Search,
    Shield,
    Trash2,
    UserX,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import DataTable from '../../../Components/DataTable';
import Modal from '../../../Components/Modal';
import { Badge, Card, PageHeader } from '../../../Components/ui';
import AppLayout from '../../../Layouts/AppLayout';
import { confirmAction } from '../../../lib/swal';

export default function Index({ users, filters }) {
    const [selectedUser, setSelectedUser] = useState(null);
    const [resetModalOpen, setResetModalOpen] = useState(false);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        password: '',
    });

    const handleFilterChange = (role) => {
        router.get('/admin/users', { role }, { preserveState: true, replace: true });
    };

    const openResetModal = (u) => {
        setSelectedUser(u);
        setData({ password: '' });
        clearErrors();
        setResetModalOpen(true);
    };

    const closeResetModal = () => {
        setResetModalOpen(false);
        setSelectedUser(null);
        reset();
        clearErrors();
    };

    const submitResetPassword = (e) => {
        e.preventDefault();
        if (!selectedUser) return;

        post(`/admin/users/${selectedUser.id}/reset-password`, {
            onSuccess: () => closeResetModal(),
        });
    };

    const handleToggleActive = async (u) => {
        const action = u.is_active ? 'menonaktifkan' : 'mengaktifkan';
        const confirmed = await confirmAction({
            title: `${u.is_active ? 'Nonaktifkan' : 'Aktifkan'} Akun?`,
            text: `Apakah Anda yakin ingin ${action} akun "${u.username}"?`,
            confirmText: `Ya, ${action}`,
            danger: u.is_active,
        });

        if (confirmed) {
            router.post(`/admin/users/${u.id}/toggle-active`);
        }
    };

    const handleDelete = async (u) => {
        const confirmed = await confirmAction({
            title: 'Hapus Akun Pengguna?',
            text: `Akun "${u.username}" (${u.name}) akan dihapus dari sistem.`,
            confirmText: 'Ya, hapus',
            danger: true,
        });

        if (confirmed) {
            router.delete(`/admin/users/${u.id}`);
        }
    };

    const columns = [
        {
            key: 'name',
            label: 'Nama & Username',
            render: (row) => (
                <div>
                    <span className="font-bold text-brand-950 block">{row.name}</span>
                    <span className="text-xs font-mono text-ink/60">@{row.username}</span>
                </div>
            ),
        },
        {
            key: 'email',
            label: 'Email & Kontak',
            render: (row) => <span className="text-xs text-ink/80">{row.email}</span>,
        },
        {
            key: 'role',
            label: 'Peran Akun',
            render: (row) => (
                <div>
                    <Badge
                        tone={
                            row.role === 'admin'
                                ? 'primary'
                                : row.role === 'teacher'
                                ? 'info'
                                : 'success'
                        }
                    >
                        {row.role_label}
                    </Badge>
                    <span className="text-[11px] text-ink/50 block mt-0.5">{row.detail}</span>
                </div>
            ),
        },
        {
            key: 'is_active',
            label: 'Status',
            render: (row) => (
                <Badge tone={row.is_active ? 'success' : 'danger'}>
                    {row.is_active ? 'Aktif' : 'Nonaktif'}
                </Badge>
            ),
        },
        {
            key: 'last_login_at',
            label: 'Login Terakhir',
            render: (row) => (
                <span className="text-xs text-ink/60">{row.last_login_at || 'Belum pernah'}</span>
            ),
        },
        {
            key: 'actions',
            label: 'Aksi',
            render: (row) => (
                <div className="flex items-center gap-1.5">
                    <button
                        type="button"
                        onClick={() => openResetModal(row)}
                        title="Reset Kata Sandi"
                        className="grid size-8 place-items-center rounded-lg text-ink/70 hover:bg-brand-50 hover:text-brand-700 transition"
                    >
                        <KeyRound size={15} />
                    </button>
                    <button
                        type="button"
                        onClick={() => handleToggleActive(row)}
                        title={row.is_active ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
                        className={`grid size-8 place-items-center rounded-lg transition ${
                            row.is_active
                                ? 'text-amber-600 hover:bg-amber-50'
                                : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                    >
                        <UserX size={15} />
                    </button>
                    <button
                        type="button"
                        onClick={() => handleDelete(row)}
                        title="Hapus Akun"
                        className="grid size-8 place-items-center rounded-lg text-red-600 hover:bg-red-50 transition"
                    >
                        <Trash2 size={15} />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <AppLayout title="Kelola Akun Pengguna">
            <PageHeader
                title="Manajemen Akun Pengguna"
                subtitle="Kelola seluruh akun administrator, guru pengajar, dan siswa yang terdaftar di E-Learning."
            />

            {/* Filter Peran */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
                {[
                    { key: 'all', label: 'Semua Akun' },
                    { key: 'admin', label: 'Administrator' },
                    { key: 'teacher', label: 'Guru' },
                    { key: 'student', label: 'Siswa' },
                ].map((item) => (
                    <button
                        key={item.key}
                        type="button"
                        onClick={() => handleFilterChange(item.key)}
                        className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
                            filters.role === item.key
                                ? 'bg-brand-600 text-white shadow-sm'
                                : 'bg-white text-ink/70 border border-ink/15 hover:border-brand-300 hover:text-brand-700'
                        }`}
                    >
                        {item.label}
                    </button>
                ))}
            </div>

            <Card padded={false}>
                <DataTable
                    columns={columns}
                    rows={users}
                    searchKeys={['name', 'username', 'email', 'detail']}
                    pageSize={10}
                    emptyTitle="Tidak ada data akun"
                    emptyText="Tidak ada akun pengguna yang sesuai dengan filter ini."
                />
            </Card>

            {/* Modal Reset Kata Sandi */}
            <Modal
                open={resetModalOpen}
                onClose={closeResetModal}
                title={`Reset Kata Sandi: ${selectedUser?.name || ''}`}
                footer={
                    <>
                        <button
                            type="button"
                            onClick={closeResetModal}
                            disabled={processing}
                            className="rounded-lg border border-ink/20 px-4 py-2 text-sm font-medium text-ink/80 hover:bg-ink/5"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            onClick={submitResetPassword}
                            disabled={processing}
                            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
                        >
                            {processing ? 'Menyimpan…' : 'Simpan Kata Sandi'}
                        </button>
                    </>
                }
            >
                {selectedUser && (
                    <form onSubmit={submitResetPassword} className="space-y-4">
                        <div className="rounded-lg bg-paper p-3 text-xs border border-ink/10 space-y-1">
                            <p>
                                <span className="font-semibold text-ink/60">Username:</span>{' '}
                                <strong className="font-mono text-brand-950">@{selectedUser.username}</strong>
                            </p>
                            <p>
                                <span className="font-semibold text-ink/60">Peran:</span>{' '}
                                {selectedUser.role_label}
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-brand-950 mb-1">
                                Kata Sandi Baru
                            </label>
                            <input
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="Masukkan kata sandi baru (minimal 6 karakter)..."
                                className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                                required
                            />
                            {errors.password && (
                                <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                            )}
                        </div>
                    </form>
                )}
            </Modal>
        </AppLayout>
    );
}
