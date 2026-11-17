import { Link, router, useForm } from '@inertiajs/react';
import { Edit2, Eye, Plus, School, Trash2 } from 'lucide-react';
import { useState } from 'react';
import DataTable from '../../../Components/DataTable';
import Modal from '../../../Components/Modal';
import { Badge, Card, PageHeader } from '../../../Components/ui';
import AppLayout from '../../../Layouts/AppLayout';
import { confirmAction } from '../../../lib/swal';

export default function Index({ classes, departments, academicYears, teachers, filters }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingClass, setEditingClass] = useState(null);

    const defaultYear = academicYears.find((y) => y.is_active)?.id || academicYears[0]?.id || '';

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        grade_level: 'X',
        department_id: departments[0]?.id || '',
        academic_year_id: defaultYear,
        homeroom_teacher_id: '',
    });

    const handleFilterChange = (key, value) => {
        router.get(
            '/admin/classes',
            { ...filters, [key]: value },
            { preserveState: true, replace: true }
        );
    };

    const openCreateModal = () => {
        setEditingClass(null);
        setData({
            name: '',
            grade_level: 'X',
            department_id: departments[0]?.id || '',
            academic_year_id: filters.academic_year_id !== 'all' ? filters.academic_year_id : defaultYear,
            homeroom_teacher_id: '',
        });
        clearErrors();
        setModalOpen(true);
    };

    const openEditModal = (c) => {
        setEditingClass(c);
        setData({
            name: c.name,
            grade_level: c.grade_level,
            department_id: c.department_id,
            academic_year_id: c.academic_year_id,
            homeroom_teacher_id: c.homeroom_teacher_id || '',
        });
        clearErrors();
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingClass(null);
        reset();
        clearErrors();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingClass) {
            put(`/admin/classes/${editingClass.id}`, {
                onSuccess: () => closeModal(),
            });
        } else {
            post('/admin/classes', {
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = async (c) => {
        const confirmed = await confirmAction({
            title: `Hapus Kelas ${c.name}?`,
            text: 'Kelas yang memiliki siswa atau mata pelajaran tidak dapat dihapus.',
            confirmText: 'Ya, hapus',
            danger: true,
        });

        if (confirmed) {
            router.delete(`/admin/classes/${c.id}`);
        }
    };

    const columns = [
        {
            key: 'name',
            label: 'Nama Kelas',
            render: (row) => (
                <Link
                    href={`/admin/classes/${row.id}`}
                    className="font-bold text-brand-700 hover:text-brand-900 hover:underline"
                >
                    {row.name}
                </Link>
            ),
        },
        {
            key: 'grade_level',
            label: 'Tingkat',
            render: (row) => <Badge tone="neutral">Kelas {row.grade_level}</Badge>,
        },
        {
            key: 'department',
            label: 'Jurusan',
            render: (row) => <span className="font-medium text-ink/80">{row.department?.name}</span>,
        },
        {
            key: 'homeroom_teacher',
            label: 'Wali Kelas',
            render: (row) => (
                <span className="text-sm text-ink/80">
                    {row.homeroom_teacher?.user?.name || <span className="text-ink/40 italic">Belum ditentukan</span>}
                </span>
            ),
        },
        {
            key: 'enrollments_count',
            label: 'Siswa',
            render: (row) => <Badge tone="info">{row.enrollments_count} Siswa</Badge>,
        },
        {
            key: 'academic_year',
            label: 'Tahun Ajaran',
            render: (row) => (
                <span className="text-xs text-ink/60">
                    {row.academic_year?.name} {row.academic_year?.is_active && '• Aktif'}
                </span>
            ),
        },
        {
            key: 'actions',
            label: 'Aksi',
            render: (row) => (
                <div className="flex items-center gap-1.5">
                    <Link
                        href={`/admin/classes/${row.id}`}
                        title="Detail Kelas & Siswa"
                        className="grid size-8 place-items-center rounded-lg text-ink/70 hover:bg-brand-50 hover:text-brand-700 transition"
                    >
                        <Eye size={16} />
                    </Link>
                    <button
                        type="button"
                        onClick={() => openEditModal(row)}
                        title="Edit Kelas"
                        className="grid size-8 place-items-center rounded-lg text-ink/70 hover:bg-brand-50 hover:text-brand-700 transition"
                    >
                        <Edit2 size={16} />
                    </button>
                    <button
                        type="button"
                        onClick={() => handleDelete(row)}
                        title="Hapus Kelas"
                        className="grid size-8 place-items-center rounded-lg text-red-600 hover:bg-red-50 transition"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <AppLayout title="Data Kelas">
            <PageHeader
                title="Data Kelas"
                subtitle="Kelola rombongan belajar dan penetapan wali kelas."
            >
                <button
                    type="button"
                    onClick={openCreateModal}
                    className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 transition"
                >
                    <Plus size={18} />
                    <span>Tambah Kelas</span>
                </button>
            </PageHeader>

            {/* Filter Bar */}
            <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-ink/10 bg-white p-4">
                <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-ink/70">Tahun Ajaran:</label>
                    <select
                        value={filters.academic_year_id}
                        onChange={(e) => handleFilterChange('academic_year_id', e.target.value)}
                        className="rounded-lg border border-ink/20 px-3 py-1.5 text-xs focus:border-brand-500 focus:outline-none"
                    >
                        <option value="all">Semua Tahun</option>
                        {academicYears.map((y) => (
                            <option key={y.id} value={y.id}>
                                {y.name} {y.is_active ? '(Aktif)' : ''}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-ink/70">Jurusan:</label>
                    <select
                        value={filters.department_id}
                        onChange={(e) => handleFilterChange('department_id', e.target.value)}
                        className="rounded-lg border border-ink/20 px-3 py-1.5 text-xs focus:border-brand-500 focus:outline-none"
                    >
                        <option value="all">Semua Jurusan</option>
                        {departments.map((d) => (
                            <option key={d.id} value={d.id}>
                                {d.code} - {d.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-ink/70">Tingkat:</label>
                    <select
                        value={filters.grade_level}
                        onChange={(e) => handleFilterChange('grade_level', e.target.value)}
                        className="rounded-lg border border-ink/20 px-3 py-1.5 text-xs focus:border-brand-500 focus:outline-none"
                    >
                        <option value="all">Semua Tingkat</option>
                        <option value="X">Kelas X</option>
                        <option value="XI">Kelas XI</option>
                        <option value="XII">Kelas XII</option>
                    </select>
                </div>
            </div>

            <Card padded={false}>
                <DataTable
                    columns={columns}
                    rows={classes}
                    searchKeys={['name', 'grade_level']}
                    pageSize={10}
                    emptyTitle="Belum ada data kelas"
                    emptyText="Sesuaikan filter atau tambahkan kelas baru."
                />
            </Card>

            <Modal
                open={modalOpen}
                onClose={closeModal}
                title={editingClass ? 'Edit Data Kelas' : 'Tambah Kelas Baru'}
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
                            {processing ? 'Menyimpan…' : editingClass ? 'Perbarui Kelas' : 'Simpan Kelas'}
                        </button>
                    </>
                }
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-brand-950 mb-1">Nama Kelas</label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Contoh: X TKJ 1, XI RPL 2"
                            className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                            required
                        />
                        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-semibold text-brand-950 mb-1">Tingkat Kelas</label>
                            <select
                                value={data.grade_level}
                                onChange={(e) => setData('grade_level', e.target.value)}
                                className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                                required
                            >
                                <option value="X">Kelas X</option>
                                <option value="XI">Kelas XI</option>
                                <option value="XII">Kelas XII</option>
                            </select>
                            {errors.grade_level && (
                                <p className="mt-1 text-xs text-red-600">{errors.grade_level}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-brand-950 mb-1">Jurusan</label>
                            <select
                                value={data.department_id}
                                onChange={(e) => setData('department_id', e.target.value)}
                                className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                                required
                            >
                                {departments.map((d) => (
                                    <option key={d.id} value={d.id}>
                                        {d.code} - {d.name}
                                    </option>
                                ))}
                            </select>
                            {errors.department_id && (
                                <p className="mt-1 text-xs text-red-600">{errors.department_id}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-brand-950 mb-1">Tahun Ajaran</label>
                        <select
                            value={data.academic_year_id}
                            onChange={(e) => setData('academic_year_id', e.target.value)}
                            className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                            required
                        >
                            {academicYears.map((y) => (
                                <option key={y.id} value={y.id}>
                                    {y.name} {y.is_active ? '(Aktif)' : ''}
                                </option>
                            ))}
                        </select>
                        {errors.academic_year_id && (
                            <p className="mt-1 text-xs text-red-600">{errors.academic_year_id}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-brand-950 mb-1">Wali Kelas (Opsional)</label>
                        <select
                            value={data.homeroom_teacher_id}
                            onChange={(e) => setData('homeroom_teacher_id', e.target.value)}
                            className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                        >
                            <option value="">-- Pilih Wali Kelas --</option>
                            {teachers.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.name} {t.nip ? `(${t.nip})` : ''}
                                </option>
                            ))}
                        </select>
                        {errors.homeroom_teacher_id && (
                            <p className="mt-1 text-xs text-red-600">{errors.homeroom_teacher_id}</p>
                        )}
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
