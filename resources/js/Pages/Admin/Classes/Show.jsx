import { Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, BookOpen, GraduationCap, Plus, School, Trash2, UserCheck, Users } from 'lucide-react';
import { useState } from 'react';
import Modal from '../../../Components/Modal';
import { Badge, Card, EmptyState, PageHeader } from '../../../Components/ui';
import AppLayout from '../../../Layouts/AppLayout';
import { confirmAction } from '../../../lib/swal';

export default function Show({ classroom, availableStudents }) {
    const [enrollModalOpen, setEnrollModalOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        student_id: availableStudents[0]?.id || '',
    });

    const handleEnroll = (e) => {
        e.preventDefault();
        post(`/admin/classes/${classroom.id}/enroll`, {
            onSuccess: () => {
                setEnrollModalOpen(false);
                reset();
            },
        });
    };

    const handleRemoveStudent = async (enrollment) => {
        const studentName = enrollment.student?.user?.name || 'Siswa';
        const confirmed = await confirmAction({
            title: `Keluarkan ${studentName}?`,
            text: `Siswa ini akan dikeluarkan dari kelas ${classroom.name}.`,
            confirmText: 'Ya, keluarkan',
            danger: true,
        });

        if (confirmed) {
            router.delete(`/admin/enrollments/${enrollment.id}`);
        }
    };

    return (
        <AppLayout title={`Kelas ${classroom.name}`}>
            <div className="mb-4">
                <Link
                    href="/admin/classes"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 hover:text-brand-900"
                >
                    <ArrowLeft size={14} />
                    <span>Kembali ke Data Kelas</span>
                </Link>
            </div>

            <PageHeader
                title={`Kelas ${classroom.name}`}
                subtitle={`Tingkat ${classroom.grade_level} • ${classroom.department?.name} • TA ${classroom.academic_year?.name}`}
            >
                <button
                    type="button"
                    onClick={() => setEnrollModalOpen(true)}
                    disabled={availableStudents.length === 0}
                    className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 transition disabled:opacity-50"
                >
                    <Plus size={18} />
                    <span>Masukkan Siswa</span>
                </button>
            </PageHeader>

            {/* Ringkasan Kelas */}
            <div className="mb-6 grid gap-4 sm:grid-cols-3">
                <div className="flex items-center gap-3 rounded-xl border border-ink/10 bg-white p-4">
                    <span className="grid size-10 place-items-center rounded-lg bg-brand-50 text-brand-700">
                        <School size={20} />
                    </span>
                    <div>
                        <p className="text-xs text-ink/60">Wali Kelas</p>
                        <p className="font-bold text-brand-950">
                            {classroom.homeroom_teacher?.user?.name || <span className="italic text-ink/40">Belum ada</span>}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-ink/10 bg-white p-4">
                    <span className="grid size-10 place-items-center rounded-lg bg-sky-50 text-sky-700">
                        <GraduationCap size={20} />
                    </span>
                    <div>
                        <p className="text-xs text-ink/60">Jumlah Siswa Terdaftar</p>
                        <p className="font-bold text-brand-950">{classroom.enrollments?.length ?? 0} Siswa</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-ink/10 bg-white p-4">
                    <span className="grid size-10 place-items-center rounded-lg bg-gold-50 text-gold-700">
                        <BookOpen size={20} />
                    </span>
                    <div>
                        <p className="text-xs text-ink/60">Mata Pelajaran Aktif</p>
                        <p className="font-bold text-brand-950">{classroom.teacher_subjects?.length ?? 0} Mapel</p>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Tabel Siswa */}
                <div className="lg:col-span-2">
                    <Card
                        title={`Daftar Siswa Kelas (${classroom.enrollments?.length ?? 0})`}
                        padded={false}
                    >
                        {!classroom.enrollments || classroom.enrollments.length === 0 ? (
                            <EmptyState
                                icon={GraduationCap}
                                title="Belum ada siswa di kelas ini"
                                text="Klik Masukkan Siswa untuk mendaftarkan siswa ke kelas ini."
                            />
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-ink/[0.03] text-ink/70">
                                        <tr>
                                            <th className="px-4 py-2.5 font-semibold">No</th>
                                            <th className="px-4 py-2.5 font-semibold">NIS</th>
                                            <th className="px-4 py-2.5 font-semibold">Nama Siswa</th>
                                            <th className="px-4 py-2.5 font-semibold">Jenis Kelamin</th>
                                            <th className="px-4 py-2.5 text-right font-semibold">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-ink/10">
                                        {classroom.enrollments.map((en, idx) => (
                                            <tr key={en.id} className="hover:bg-brand-50/50">
                                                <td className="px-4 py-3 text-xs text-ink/50">{idx + 1}</td>
                                                <td className="px-4 py-3 font-mono font-medium text-brand-950">
                                                    {en.student?.nis}
                                                </td>
                                                <td className="px-4 py-3 font-semibold text-brand-950">
                                                    {en.student?.user?.name}
                                                </td>
                                                <td className="px-4 py-3 text-ink/70">
                                                    {en.student?.gender === 'L' ? 'Laki-laki' : en.student?.gender === 'P' ? 'Perempuan' : '-'}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveStudent(en)}
                                                        title="Keluarkan dari Kelas"
                                                        className="inline-grid size-7 place-items-center rounded text-red-600 hover:bg-red-50"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Daftar Guru & Mata Pelajaran */}
                <div>
                    <Card
                        title="Mata Pelajaran & Pengampu"
                        padded={false}
                    >
                        {!classroom.teacher_subjects || classroom.teacher_subjects.length === 0 ? (
                            <EmptyState
                                icon={BookOpen}
                                title="Belum ada penugasan mapel"
                                text="Atur pembagian mapel di menu Pembagian Guru."
                            />
                        ) : (
                            <ul className="divide-y divide-ink/10">
                                {classroom.teacher_subjects.map((ts) => (
                                    <li key={ts.id} className="px-4 py-3">
                                        <div className="flex items-start justify-between gap-2">
                                            <span className="font-semibold text-brand-950 text-sm">
                                                {ts.subject?.name}
                                            </span>
                                            <span className="font-mono text-xs text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded">
                                                {ts.subject?.code}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-xs text-ink/70">
                                            Guru: <span className="font-medium text-ink/90">{ts.teacher?.user?.name}</span>
                                        </p>
                                        <p className="text-[11px] text-ink/50">
                                            Semester {ts.semester?.name}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Card>
                </div>
            </div>

            {/* Modal Enroll Siswa */}
            <Modal
                open={enrollModalOpen}
                onClose={() => setEnrollModalOpen(false)}
                title={`Masukkan Siswa ke ${classroom.name}`}
                footer={
                    <>
                        <button
                            type="button"
                            onClick={() => setEnrollModalOpen(false)}
                            className="rounded-lg border border-ink/20 px-4 py-2 text-sm font-medium text-ink/80 hover:bg-ink/5"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            onClick={handleEnroll}
                            disabled={processing || availableStudents.length === 0}
                            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
                        >
                            {processing ? 'Menyimpan…' : 'Masukkan ke Kelas'}
                        </button>
                    </>
                }
            >
                <form onSubmit={handleEnroll} className="space-y-4">
                    {availableStudents.length === 0 ? (
                        <p className="text-sm text-ink/70">
                            Semua siswa yang terdaftar sudah ditempatkan di kelas untuk tahun ajaran ini.
                        </p>
                    ) : (
                        <div>
                            <label className="block text-sm font-semibold text-brand-950 mb-1">Pilih Siswa</label>
                            <select
                                value={data.student_id}
                                onChange={(e) => setData('student_id', e.target.value)}
                                className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                                required
                            >
                                {availableStudents.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name} (NIS: {s.nis})
                                    </option>
                                ))}
                            </select>
                            {errors.student_id && (
                                <p className="mt-1 text-xs text-red-600">{errors.student_id}</p>
                            )}
                        </div>
                    )}
                </form>
            </Modal>
        </AppLayout>
    );
}
