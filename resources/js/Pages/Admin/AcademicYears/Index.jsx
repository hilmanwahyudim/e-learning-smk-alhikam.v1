import { router, useForm } from '@inertiajs/react';
import { Calendar, Check, CheckCircle2, Edit2, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import Modal from '../../../Components/Modal';
import { Badge, Card, EmptyState, PageHeader } from '../../../Components/ui';
import AppLayout from '../../../Layouts/AppLayout';
import { confirmAction } from '../../../lib/swal';

export default function Index({ academicYears }) {
    const [yearModalOpen, setYearModalOpen] = useState(false);
    const [editingYear, setEditingYear] = useState(null);

    const [semesterModalOpen, setSemesterModalOpen] = useState(false);
    const [editingSemester, setEditingSemester] = useState(null);
    const [targetYear, setTargetYear] = useState(null);

    const yearForm = useForm({
        name: '',
        start_date: '',
        end_date: '',
        is_active: false,
    });

    const semesterForm = useForm({
        name: '',
        start_date: '',
        end_date: '',
        is_active: false,
    });

    const openCreateYearModal = () => {
        setEditingYear(null);
        yearForm.setData({
            name: '',
            start_date: '',
            end_date: '',
            is_active: false,
        });
        yearForm.clearErrors();
        setYearModalOpen(true);
    };

    const openEditYearModal = (year) => {
        setEditingYear(year);
        yearForm.setData({
            name: year.name,
            start_date: year.start_date ? year.start_date.substring(0, 10) : '',
            end_date: year.end_date ? year.end_date.substring(0, 10) : '',
            is_active: year.is_active,
        });
        yearForm.clearErrors();
        setYearModalOpen(true);
    };

    const handleYearSubmit = (e) => {
        e.preventDefault();
        if (editingYear) {
            yearForm.put(`/admin/academic-years/${editingYear.id}`, {
                onSuccess: () => setYearModalOpen(false),
            });
        } else {
            yearForm.post('/admin/academic-years', {
                onSuccess: () => setYearModalOpen(false),
            });
        }
    };

    const handleActivateYear = async (year) => {
        const confirmed = await confirmAction({
            title: `Aktifkan Tahun Ajaran ${year.name}?`,
            text: 'Tahun ajaran aktif saat ini akan dinonaktifkan otomatis.',
            confirmText: 'Ya, aktifkan',
        });
        if (confirmed) {
            router.post(`/admin/academic-years/${year.id}/set-active`);
        }
    };

    const handleDeleteYear = async (year) => {
        const confirmed = await confirmAction({
            title: `Hapus Tahun Ajaran ${year.name}?`,
            text: 'Tahun ajaran yang memiliki kelas terdaftar tidak dapat dihapus.',
            confirmText: 'Ya, hapus',
            danger: true,
        });
        if (confirmed) {
            router.delete(`/admin/academic-years/${year.id}`);
        }
    };

    const openAddSemesterModal = (year) => {
        setTargetYear(year);
        setEditingSemester(null);
        semesterForm.setData({
            name: '',
            start_date: year.start_date ? year.start_date.substring(0, 10) : '',
            end_date: year.end_date ? year.end_date.substring(0, 10) : '',
            is_active: false,
        });
        semesterForm.clearErrors();
        setSemesterModalOpen(true);
    };

    const openEditSemesterModal = (year, semester) => {
        setTargetYear(year);
        setEditingSemester(semester);
        semesterForm.setData({
            name: semester.name,
            start_date: semester.start_date ? semester.start_date.substring(0, 10) : '',
            end_date: semester.end_date ? semester.end_date.substring(0, 10) : '',
            is_active: semester.is_active,
        });
        semesterForm.clearErrors();
        setSemesterModalOpen(true);
    };

    const handleSemesterSubmit = (e) => {
        e.preventDefault();
        if (editingSemester) {
            semesterForm.put(`/admin/semesters/${editingSemester.id}`, {
                onSuccess: () => setSemesterModalOpen(false),
            });
        } else {
            semesterForm.post(`/admin/academic-years/${targetYear.id}/semesters`, {
                onSuccess: () => setSemesterModalOpen(false),
            });
        }
    };

    const handleActivateSemester = async (semester) => {
        const confirmed = await confirmAction({
            title: `Aktifkan Semester ${semester.name}?`,
            text: 'Semester ini beserta tahun ajarannya akan diset aktif.',
            confirmText: 'Ya, aktifkan',
        });
        if (confirmed) {
            router.post(`/admin/semesters/${semester.id}/set-active`);
        }
    };

    return (
        <AppLayout title="Tahun Ajaran & Semester">
            <PageHeader
                title="Tahun Ajaran & Semester"
                subtitle="Atur periode tahun ajaran aktif dan semester berjalan SMK Al Hikam."
            >
                <button
                    type="button"
                    onClick={openCreateYearModal}
                    className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 transition"
                >
                    <Plus size={18} />
                    <span>Tambah Tahun Ajaran</span>
                </button>
            </PageHeader>

            {academicYears.length === 0 ? (
                <Card>
                    <EmptyState
                        icon={Calendar}
                        title="Belum ada tahun ajaran"
                        text="Klik tombol Tambah Tahun Ajaran untuk memulai."
                    />
                </Card>
            ) : (
                <div className="space-y-6">
                    {academicYears.map((year) => (
                        <div
                            key={year.id}
                            className={`rounded-xl border bg-white shadow-sm transition ${
                                year.is_active ? 'border-brand-500 ring-2 ring-brand-500/20' : 'border-ink/10'
                            }`}
                        >
                            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink/10 px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <span className="grid size-10 place-items-center rounded-lg bg-brand-50 text-brand-700">
                                        <Calendar size={20} />
                                    </span>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-lg font-bold text-brand-950">{year.name}</h2>
                                            {year.is_active ? (
                                                <Badge tone="success">Aktif Berjalan</Badge>
                                            ) : (
                                                <Badge tone="neutral">Tidak Aktif</Badge>
                                            )}
                                        </div>
                                        <p className="text-xs text-ink/60">
                                            Periode: {year.start_date?.substring(0, 10)} s/d {year.end_date?.substring(0, 10)} • {year.classes_count} Kelas Terdaftar
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {!year.is_active && (
                                        <button
                                            type="button"
                                            onClick={() => handleActivateYear(year)}
                                            className="inline-flex items-center gap-1.5 rounded-lg border border-brand-600/30 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100 transition"
                                        >
                                            <Check size={14} />
                                            <span>Jadikan Aktif</span>
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => openAddSemesterModal(year)}
                                        className="inline-flex items-center gap-1 rounded-lg border border-ink/20 px-3 py-1.5 text-xs font-medium text-ink/80 hover:bg-ink/5"
                                    >
                                        <Plus size={14} />
                                        <span>Semester</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => openEditYearModal(year)}
                                        title="Edit Tahun Ajaran"
                                        className="grid size-8 place-items-center rounded-lg text-ink/70 hover:bg-ink/5"
                                    >
                                        <Edit2 size={15} />
                                    </button>
                                    {!year.is_active && year.classes_count === 0 && (
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteYear(year)}
                                            title="Hapus Tahun Ajaran"
                                            className="grid size-8 place-items-center rounded-lg text-red-600 hover:bg-red-50"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="p-6">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-ink/50 mb-3">
                                    Daftar Semester
                                </h3>
                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                    {year.semesters.map((sem) => (
                                        <div
                                            key={sem.id}
                                            className={`flex items-center justify-between rounded-lg border p-3.5 ${
                                                sem.is_active
                                                    ? 'border-brand-400 bg-brand-50/50'
                                                    : 'border-ink/10 bg-paper/50'
                                            }`}
                                        >
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-sm text-brand-950">
                                                        Semester {sem.name}
                                                    </span>
                                                    {sem.is_active && (
                                                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-700">
                                                            <CheckCircle2 size={13} /> Aktif
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="mt-0.5 text-xs text-ink/60">
                                                    {sem.start_date?.substring(0, 10)} - {sem.end_date?.substring(0, 10)}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-1">
                                                {!sem.is_active && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleActivateSemester(sem)}
                                                        title="Aktifkan Semester"
                                                        className="rounded px-2 py-1 text-xs font-medium text-brand-700 hover:bg-brand-100"
                                                    >
                                                        Aktifkan
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => openEditSemesterModal(year, sem)}
                                                    title="Edit Semester"
                                                    className="grid size-7 place-items-center rounded text-ink/60 hover:bg-ink/5"
                                                >
                                                    <Edit2 size={13} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Tahun Ajaran */}
            <Modal
                open={yearModalOpen}
                onClose={() => setYearModalOpen(false)}
                title={editingYear ? 'Edit Tahun Ajaran' : 'Tambah Tahun Ajaran Baru'}
                footer={
                    <>
                        <button
                            type="button"
                            onClick={() => setYearModalOpen(false)}
                            className="rounded-lg border border-ink/20 px-4 py-2 text-sm font-medium text-ink/80 hover:bg-ink/5"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            onClick={handleYearSubmit}
                            disabled={yearForm.processing}
                            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
                        >
                            {yearForm.processing ? 'Menyimpan…' : 'Simpan'}
                        </button>
                    </>
                }
            >
                <form onSubmit={handleYearSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-brand-950 mb-1">Nama Tahun Ajaran</label>
                        <input
                            type="text"
                            value={yearForm.data.name}
                            onChange={(e) => yearForm.setData('name', e.target.value)}
                            placeholder="Contoh: 2026/2027"
                            className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                            required
                        />
                        {yearForm.errors.name && <p className="mt-1 text-xs text-red-600">{yearForm.errors.name}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-semibold text-brand-950 mb-1">Tanggal Mulai</label>
                            <input
                                type="date"
                                value={yearForm.data.start_date}
                                onChange={(e) => yearForm.setData('start_date', e.target.value)}
                                className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                                required
                            />
                            {yearForm.errors.start_date && (
                                <p className="mt-1 text-xs text-red-600">{yearForm.errors.start_date}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-brand-950 mb-1">Tanggal Selesai</label>
                            <input
                                type="date"
                                value={yearForm.data.end_date}
                                onChange={(e) => yearForm.setData('end_date', e.target.value)}
                                className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                                required
                            />
                            {yearForm.errors.end_date && (
                                <p className="mt-1 text-xs text-red-600">{yearForm.errors.end_date}</p>
                            )}
                        </div>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer pt-2">
                        <input
                            type="checkbox"
                            checked={yearForm.data.is_active}
                            onChange={(e) => yearForm.setData('is_active', e.target.checked)}
                            className="size-4 rounded border-ink/20 text-brand-600 focus:ring-brand-500"
                        />
                        <span className="text-sm font-medium text-brand-950">Jadikan sebagai tahun ajaran aktif</span>
                    </label>
                </form>
            </Modal>

            {/* Modal Semester */}
            <Modal
                open={semesterModalOpen}
                onClose={() => setSemesterModalOpen(false)}
                title={editingSemester ? 'Edit Data Semester' : `Tambah Semester (${targetYear?.name})`}
                footer={
                    <>
                        <button
                            type="button"
                            onClick={() => setSemesterModalOpen(false)}
                            className="rounded-lg border border-ink/20 px-4 py-2 text-sm font-medium text-ink/80 hover:bg-ink/5"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            onClick={handleSemesterSubmit}
                            disabled={semesterForm.processing}
                            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
                        >
                            {semesterForm.processing ? 'Menyimpan…' : 'Simpan Semester'}
                        </button>
                    </>
                }
            >
                <form onSubmit={handleSemesterSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-brand-950 mb-1">Nama Semester</label>
                        <input
                            type="text"
                            value={semesterForm.data.name}
                            onChange={(e) => semesterForm.setData('name', e.target.value)}
                            placeholder="Misal: Ganjil, Genap, Pendek"
                            className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                            required
                        />
                        {semesterForm.errors.name && (
                            <p className="mt-1 text-xs text-red-600">{semesterForm.errors.name}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-semibold text-brand-950 mb-1">Tanggal Mulai</label>
                            <input
                                type="date"
                                value={semesterForm.data.start_date}
                                onChange={(e) => semesterForm.setData('start_date', e.target.value)}
                                className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                                required
                            />
                            {semesterForm.errors.start_date && (
                                <p className="mt-1 text-xs text-red-600">{semesterForm.errors.start_date}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-brand-950 mb-1">Tanggal Selesai</label>
                            <input
                                type="date"
                                value={semesterForm.data.end_date}
                                onChange={(e) => semesterForm.setData('end_date', e.target.value)}
                                className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                                required
                            />
                            {semesterForm.errors.end_date && (
                                <p className="mt-1 text-xs text-red-600">{semesterForm.errors.end_date}</p>
                            )}
                        </div>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
