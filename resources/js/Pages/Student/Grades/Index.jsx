import { Link } from '@inertiajs/react';
import {
    Award,
    BookOpen,
    CheckCircle2,
    GraduationCap,
    HelpCircle,
    Printer,
    Star,
    TrendingUp,
} from 'lucide-react';
import { Badge, Card, EmptyState, PageHeader } from '../../../Components/ui';
import AppLayout from '../../../Layouts/AppLayout';

export default function Index({ classroom, activeSemester, activeYear, subjects, overallGpa }) {
    const passedSubjectsCount = subjects.filter((s) => s.is_passed).length;
    const totalSubjects = subjects.length;

    return (
        <AppLayout title="Transkrip Nilai Saya">
            <PageHeader
                title="Transkrip Nilai Hasil Belajar"
                subtitle={
                    classroom
                        ? `Kelas ${classroom.name} • ${activeSemester || '-'} • Tahun Ajaran ${activeYear || '-'}`
                        : 'Belum terdaftar di kelas aktif'
                }
            >
                {subjects.length > 0 && (
                    <Link
                        href="/student/grades/print"
                        target="_blank"
                        className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 transition"
                    >
                        <Printer size={16} />
                        <span>Cetak Hasil Belajar (KHB)</span>
                    </Link>
                )}
            </PageHeader>

            {/* Statistik Ringkasan Capaian Siswa */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-ink/10 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-ink/60">Indeks Prestasi / Rata-rata</span>
                        <div className="flex size-9 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
                            <TrendingUp size={18} />
                        </div>
                    </div>
                    <p className="mt-2 text-3xl font-black text-brand-950">
                        {overallGpa !== null ? overallGpa : '—'}
                    </p>
                    <p className="mt-1 text-xs text-ink/50">Skala 0 - 100 berdasarkan seluruh mapel</p>
                </div>

                <div className="rounded-xl border border-ink/10 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-ink/60">Ketuntasan Mata Pelajaran</span>
                        <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                            <CheckCircle2 size={18} />
                        </div>
                    </div>
                    <p className="mt-2 text-3xl font-black text-emerald-600">
                        {passedSubjectsCount}{' '}
                        <span className="text-sm font-normal text-ink/50">/ {totalSubjects} Mapel</span>
                    </p>
                    <p className="mt-1 text-xs text-ink/50">Standar KKM Sekolah: Nilai ≥ 75</p>
                </div>

                <div className="rounded-xl border border-ink/10 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-ink/60">Predikat Umum</span>
                        <div className="flex size-9 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                            <Award size={18} />
                        </div>
                    </div>
                    <p className="mt-2 text-3xl font-black text-brand-950">
                        {overallGpa >= 90
                            ? 'Sangat Baik (A)'
                            : overallGpa >= 80
                            ? 'Baik (B)'
                            : overallGpa >= 75
                            ? 'Cukup (C)'
                            : overallGpa !== null
                            ? 'Perlu Bimbingan (D)'
                            : '—'}
                    </p>
                    <p className="mt-1 text-xs text-ink/50">Evaluasi capaian kompetensi semester</p>
                </div>
            </div>

            {/* Tabel Rincian Nilai Per Mata Pelajaran */}
            {subjects.length === 0 ? (
                <Card>
                    <EmptyState
                        icon={<Award size={32} />}
                        title="Belum ada data nilai"
                        description="Nilai tugas dan kuis akan tampil di sini setelah guru memberikan penilaian."
                    />
                </Card>
            ) : (
                <Card padded={false}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-paper border-b border-ink/10 text-xs font-semibold uppercase tracking-wider text-ink/70">
                                <tr>
                                    <th className="px-4 py-3 w-10 text-center">No</th>
                                    <th className="px-4 py-3">Mata Pelajaran & Guru</th>
                                    <th className="px-4 py-3 text-center">Rata-rata Tugas</th>
                                    <th className="px-4 py-3 text-center">Rata-rata Kuis/Ujian</th>
                                    <th className="px-4 py-3 text-center">Nilai Akhir (NA)</th>
                                    <th className="px-4 py-3 text-center">Predikat</th>
                                    <th className="px-4 py-3 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-ink/10">
                                {subjects.map((sub, idx) => (
                                    <tr key={sub.id} className="hover:bg-brand-50/40 transition">
                                        <td className="px-4 py-3.5 text-center text-xs text-ink/50">{idx + 1}</td>
                                        <td className="px-4 py-3.5">
                                            <span className="font-bold text-brand-950 block">{sub.subject_name}</span>
                                            <span className="text-xs text-ink/60 flex items-center gap-1.5 mt-0.5">
                                                <span className="font-mono text-brand-700">{sub.subject_code}</span>
                                                <span>•</span>
                                                <GraduationCap size={12} />
                                                <span>{sub.teacher_name}</span>
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 text-center">
                                            {sub.avg_assignment !== null ? (
                                                <div>
                                                    <span className="font-mono font-bold text-brand-950">
                                                        {sub.avg_assignment}
                                                    </span>
                                                    <span className="text-[11px] text-ink/40 block">
                                                        {sub.graded_assignments_count}/{sub.assignments_count} tugas
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-ink/40">Belum ada</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3.5 text-center">
                                            {sub.avg_quiz !== null ? (
                                                <div>
                                                    <span className="font-mono font-bold text-brand-950">
                                                        {sub.avg_quiz}
                                                    </span>
                                                    <span className="text-[11px] text-ink/40 block">
                                                        {sub.completed_quizzes_count}/{sub.quizzes_count} tes
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-ink/40">Belum ada</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3.5 text-center">
                                            {sub.final_score !== null ? (
                                                <span className="text-base font-black font-mono text-brand-700">
                                                    {sub.final_score}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-ink/40">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3.5 text-center">
                                            <span className="font-bold text-sm text-brand-950">{sub.predicate}</span>
                                        </td>
                                        <td className="px-4 py-3.5 text-center">
                                            {sub.final_score !== null ? (
                                                <Badge tone={sub.is_passed ? 'success' : 'danger'}>
                                                    {sub.is_passed ? 'Tuntas' : 'Remedial'}
                                                </Badge>
                                            ) : (
                                                <Badge tone="neutral">Dalam Proses</Badge>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </AppLayout>
    );
}
