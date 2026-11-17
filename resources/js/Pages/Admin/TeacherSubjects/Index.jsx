import { router, useForm } from '@inertiajs/react';
import { BookOpen, Edit2, Plus, School, Trash2, Users } from 'lucide-react';
import { useState } from 'react';
import DataTable from '../../../Components/DataTable';
import Modal from '../../../Components/Modal';
import { Badge, Card, PageHeader } from '../../../Components/ui';
import AppLayout from '../../../Layouts/AppLayout';
import { confirmAction } from '../../../lib/swal';

export default function Index({ teacherSubjects, teachers, subjects, classes, semesters, filters, activeSemester }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const defaultSemester = semesters.find((s) => s.is_active)?.id || semesters[0]?.id || '';

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        teacher_id: teachers[0]?.id || '',
        subject_id: subjects[0]?.id || '',
        class_id: classes[0]?.id || '',
        semester_id: defaultSemester,
    });

    const handleFilterChange = (key, value) => {
        router.get(
            '/admin/teacher-subjects',
            { ...filters, [key]: value },
            { preserveState: true, replace: true }
        );
    };

    const openCreateModal = () => {
        setEditingItem(null);
        setData({
            teacher_id: teachers[0]?.id || '',
            subject_id: subjects[0]?.id || '',
            class_id: filters.class_id !== 'all' ? filters.class_id : (classes[0]?.id || ''),
            semester_id: filters.semester_id !== 'all' ? filters.semester_id : defaultSemester,
        });
        clearErrors();
        setModalOpen(true);
    };

    const openEditModal = (item) => {
        setEditingItem(item);
        setData({
            teacher_id: item.teacher_id,
            subject_id: item.subject_id,
            class_id: item.class_id,
            semester_id: item.semester_id,
        });
        clearErrors();
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingItem(null);
        reset();
        clearErrors();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingItem) {
            put(`/admin/teacher-subjects/${editingItem.id}`, {
                onSuccess: () => closeModal(),
            });
        } else {
            post('/admin/teacher-subjects', {
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = async (item) => {
        const confirmed = await confirmAction({
            title: 'Hapus Penugasan Guru?',
            text: `Hapus penugasan ${item.teacher?.user?.name} untuk ${item.subject?.name} di kelas ${item.classroom?.name}?`,
            confirmText: 'Ya, hapus',
            danger: true,
        });

        if (confirmed) {
            router.delete(`/admin/teacher-subjects/${item.id}`);
        }
    };

    const columns = [
        {
            key: 'classroom',
            label: 'Kelas',
            render: (row) => (
                <span className="font-bold text-brand-950">
                    {row.classroom?.name}
                </span>
            ),
        },
        {
            key: 'subject',
            label: 'Mata Pelajaran',
            render: (row) => (
                <div>
                    <span className="font-semibold text-brand-950 block">{row.subject?.name}</span>
                    <span className="font-mono text-xs text-brand-700 bg-brand-50 px-1.5 py-0.2 rounded">
                        {row.subject?.code}
                    </span>
                </div>
            ),
        },
        {
            key: 'teacher',
            label: 'Guru Pengampu',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-100 font-bold text-[11px] text-brand-800">
                        {row.teacher?.user?.name?.substring(0, 2)?.toUpperCase()}
                    </span>
                    <div>
                        <span className="font-medium text-brand-950 block text-sm">{row.teacher?.user?.name}</span>
                        {row.teacher?.nip && <span className="font-mono text-[11px] text-ink/50">NIP: {row.teacher.nip}</span>}
                    </div>
                </div>
            ),
        },
        {
            key: 'semester',
            label: 'Semester / Periode',
            render: (row) => (
                <span className="text-xs text-ink/70">
                    Semester {row.semester?.name} ({row.semester?.academic_year?.name})
                </span>
            ),
        },
        {
            key: 'content_count',
            label: 'Konten Pembelajaran',
            render: (row) => (
                <div className="flex flex-wrap items-center gap-1 text-xs">
                    <Badge tone="info">{row.materials_count} Materi</Badge>
                    <Badge tone="warning">{row.assignments_count} Tugas</Badge>
                    <Badge tone="neutral">{row.quizzes_count} Kuis</Badge>
                </div>
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
                        title="Edit Penugasan"
                        className="grid size-8 place-items-center rounded-lg text-ink/70 hover:bg-brand-50 hover:text-brand-700 transition"
                    >
                        <Edit2 size={16} />
                    </button>
                    <button
                        type="button"
                        onClick={() => handleDelete(row)}
                        title="Hapus Penugasan"
                        className="grid size-8 place-items-center rounded-lg text-red-600 hover:bg-red-50 transition"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <AppLayout title="Pembagian Guru & Mapel">
            <PageHeader
                title="Pembagian Guru & Mata Pelajaran"
                subtitle={`Atur penugasan mengajar untuk setiap kelas dan mata pelajaran ${activeSemester ? `(Semester Aktif: ${activeSemester})` : ''}.`}
            >
                <button
                    type="button"
                    onClick={openCreateModal}
                    className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 transition"
                >
                    <Plus size={18} />
                    <span>Tugaskan Guru</span>
                </button>
            </PageHeader>

            {/* Filter Bar */}
            <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-ink/10 bg-white p-4">
                <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-ink/70">Semester:</label>
                    <select
                        value={filters.semester_id}
                        onChange={(e) => handleFilterChange('semester_id', e.target.value)}
                        className="rounded-lg border border-ink/20 px-3 py-1.5 text-xs focus:border-brand-500 focus:outline-none"
                    >
                        <option value="all">Semua Semester</option>
                        {semesters.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.name} {s.is_active ? '(Aktif)' : ''}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-ink/70">Kelas:</label>
                    <select
                        value={filters.class_id}
                        onChange={(e) => handleFilterChange('class_id', e.target.value)}
                        className="rounded-lg border border-ink/20 px-3 py-1.5 text-xs focus:border-brand-500 focus:outline-none"
                    >
                        <option value="all">Semua Kelas</option>
                        {classes.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-ink/70">Guru:</label>
                    <select
                        value={filters.teacher_id}
                        onChange={(e) => handleFilterChange('teacher_id', e.target.value)}
                        className="rounded-lg border border-ink/20 px-3 py-1.5 text-xs focus:border-brand-500 focus:outline-none"
                    >
                        <option value="all">Semua Guru</option>
                        {teachers.map((t) => (
                            <option key={t.id} value={t.id}>
                                {t.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <Card padded={false}>
                <DataTable
                    columns={columns}
                    rows={teacherSubjects}
                    searchKeys={['classroom.name', 'subject.name', 'subject.code', 'teacher.user.name']}
                    pageSize={10}
                    emptyTitle="Belum ada pembagian guru"
                    emptyText="Klik Tugaskan Guru untuk menambahkan penugasan mengajar."
                />
            </Card>

            <Modal
                open={modalOpen}
                onClose={closeModal}
                title={editingItem ? 'Edit Penugasan Guru' : 'Tugaskan Guru ke Kelas & Mapel'}
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
                            {processing ? 'Menyimpan…' : editingItem ? 'Perbarui Penugasan' : 'Simpan Penugasan'}
                        </button>
                    </>
                }
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-brand-950 mb-1">Pilih Kelas</label>
                        <select
                            value={data.class_id}
                            onChange={(e) => setData('class_id', e.target.value)}
                            className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                            required
                        >
                            {classes.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                        {errors.class_id && <p className="mt-1 text-xs text-red-600">{errors.class_id}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-brand-950 mb-1">Mata Pelajaran</label>
                        <select
                            value={data.subject_id}
                            onChange={(e) => setData('subject_id', e.target.value)}
                            className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                            required
                        >
                            {subjects.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name} ({s.code})
                                </option>
                            ))}
                        </select>
                        {errors.subject_id && <p className="mt-1 text-xs text-red-600">{errors.subject_id}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-brand-950 mb-1">Guru Pengampu</label>
                        <select
                            value={data.teacher_id}
                            onChange={(e) => setData('teacher_id', e.target.value)}
                            className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                            required
                        >
                            {teachers.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.name} {t.nip ? `(${t.nip})` : ''}
                                </option>
                            ))}
                        </select>
                        {errors.teacher_id && <p className="mt-1 text-xs text-red-600">{errors.teacher_id}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-brand-950 mb-1">Semester</label>
                        <select
                            value={data.semester_id}
                            onChange={(e) => setData('semester_id', e.target.value)}
                            className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                            required
                        >
                            {semesters.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name} {s.is_active ? '(Aktif)' : ''}
                                </option>
                            ))}
                        </select>
                        {errors.semester_id && <p className="mt-1 text-xs text-red-600">{errors.semester_id}</p>}
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
