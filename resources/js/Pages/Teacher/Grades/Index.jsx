import { Link, router } from '@inertiajs/react';
import {
    Award,
    CheckCircle2,
    Download,
    FileSpreadsheet,
    FileText,
    GraduationCap,
    Printer,
    Search,
    TrendingUp,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import { Badge, Card, PageHeader } from '../../../Components/ui';
import AppLayout from '../../../Layouts/AppLayout';

export default function Index({ classes, selectedId, selectedSubject, recap }) {
    const [searchQuery, setSearchQuery] = useState('');

    const handleClassChange = (id) => {
        router.get('/teacher/grades', { teacher_subject_id: id }, { preserveState: true });
    };

    const students = (recap?.students || []).filter((st) =>
        st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        st.nis.includes(searchQuery)
    );

    const assignments = recap?.assignments || [];
    const quizzes = recap?.quizzes || [];

    // Statistik agregat kelas
    const validFinalScores = (recap?.students || [])
        .map((s) => s.final_score)
        .filter((s) => s !== null);

    const classAverage = validFinalScores.length > 0
        ? Math.round((validFinalScores.reduce((a, b) => a + b, 0) / validFinalScores.length) * 10) / 10
        : 0;

    const passedCount = (recap?.students || []).filter((s) => s.final_score >= 75).length;
    const totalStudents = recap?.students?.length || 0;
    const passRate = totalStudents > 0 ? Math.round((passedCount / totalStudents) * 100) : 0;

    return (
        <AppLayout title="Rekap Nilai Siswa">
            <PageHeader
                title="Rekapitulasi Nilai Siswa"
                subtitle="Matriks komprehensif nilai tugas, kuis, ujian, dan penghitungan nilai akhir semester."
            >
                {selectedSubject && (
                    <div className="flex items-center gap-2">
                        <a
                            href={`/teacher/grades/export-csv?teacher_subject_id=${selectedSubject.id}`}
                            className="inline-flex items-center gap-2 rounded-lg border border-emerald-600/30 bg-emerald-50 px-3.5 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 transition shadow-sm"
                        >
                            <FileSpreadsheet size={16} />
                            <span>Ekspor Excel (.csv)</span>
                        </a>
                        <Link
                            href={`/teacher/grades/print?teacher_subject_id=${selectedSubject.id}`}
                            target="_blank"
                            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-brand-700 transition shadow-sm"
                        >
                            <Printer size={16} />
                            <span>Cetak Laporan</span>
                        </Link>
                    </div>
                )}
            </PageHeader>

            {/* Filter Rombel & Search */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-ink/10 bg-white p-4">
                <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-ink/70">Pilih Kelas & Mapel:</label>
                    <select
                        value={selectedId || ''}
                        onChange={(e) => handleClassChange(e.target.value)}
                        className="rounded-lg border border-ink/20 px-3 py-1.5 text-xs font-semibold text-brand-950 focus:border-brand-500 focus:outline-none"
                    >
                        {classes.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="relative w-64">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari siswa atau NIS..."
                        className="w-full rounded-lg border border-ink/20 pl-8 pr-3 py-1.5 text-xs focus:border-brand-500 focus:outline-none"
                    />
                </div>
            </div>

            {/* Statistik Kartu Kelas */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
                <div className="rounded-xl border border-ink/10 bg-white p-4 shadow-sm">
                    <p className="text-xs text-ink/60">Total Siswa Terdaftar</p>
                    <p className="text-2xl font-bold text-brand-950 mt-1">{totalStudents} Siswa</p>
                </div>
                <div className="rounded-xl border border-ink/10 bg-white p-4 shadow-sm">
                    <p className="text-xs text-ink/60">Rata-rata Kelas</p>
                    <p className="text-2xl font-bold text-brand-700 mt-1">{classAverage}</p>
                </div>
                <div className="rounded-xl border border-ink/10 bg-white p-4 shadow-sm">
                    <p className="text-xs text-ink/60">Siswa Tuntas KKM (≥75)</p>
                    <p className="text-2xl font-bold text-emerald-600 mt-1">
                        {passedCount} <span className="text-xs font-normal text-ink/50">/ {totalStudents}</span>
                    </p>
                </div>
                <div className="rounded-xl border border-ink/10 bg-white p-4 shadow-sm">
                    <p className="text-xs text-ink/60">Tingkat Ketuntasan</p>
                    <p className="text-2xl font-bold text-brand-950 mt-1">{passRate}%</p>
                </div>
            </div>

            {/* Matriks Tabel Rekapitulasi Nilai */}
            <Card padded={false}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-paper border-b border-ink/10 text-ink/70">
                            <tr>
                                <th className="px-3 py-3 font-semibold w-10 text-center border-r border-ink/10">No</th>
                                <th className="px-3 py-3 font-semibold w-24 border-r border-ink/10">NIS</th>
                                <th className="px-3 py-3 font-semibold min-w-[160px] border-r border-ink/10">Nama Siswa</th>

                                {/* Kolom Tugas */}
                                {assignments.map((a) => (
                                    <th
                                        key={a.id}
                                        className="px-2.5 py-3 font-semibold text-center border-r border-ink/10 min-w-[80px]"
                                        title={a.title}
                                    >
                                        <span className="block truncate max-w-[80px]">{a.title}</span>
                                        <span className="text-[10px] text-ink/40 font-normal">Tgs</span>
                                    </th>
                                ))}
                                <th className="px-3 py-3 font-bold text-center bg-brand-50/50 text-brand-950 border-r border-ink/10 min-w-[70px]">
                                    Rata Tgs
                                </th>

                                {/* Kolom Kuis & Ujian */}
                                {quizzes.map((q) => (
                                    <th
                                        key={q.id}
                                        className="px-2.5 py-3 font-semibold text-center border-r border-ink/10 min-w-[80px]"
                                        title={q.title}
                                    >
                                        <span className="block truncate max-w-[80px]">{q.title}</span>
                                        <span className="text-[10px] text-ink/40 font-normal">
                                            {q.type === 'exam' ? 'Ujian' : 'Kuis'}
                                        </span>
                                    </th>
                                ))}
                                <th className="px-3 py-3 font-bold text-center bg-brand-50/50 text-brand-950 border-r border-ink/10 min-w-[70px]">
                                    Rata Kuis
                                </th>

                                {/* Nilai Akhir & Predikat */}
                                <th className="px-3 py-3 font-black text-center bg-brand-100 text-brand-950 border-r border-ink/10 min-w-[70px]">
                                    NA
                                </th>
                                <th className="px-3 py-3 font-bold text-center border-r border-ink/10 w-16">Predikat</th>
                                <th className="px-3 py-3 font-bold text-center w-24">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-ink/10">
                            {students.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={assignments.length + quizzes.length + 8}
                                        className="px-4 py-8 text-center text-ink/50"
                                    >
                                        Tidak ada data siswa untuk kriteria ini.
                                    </td>
                                </tr>
                            ) : (
                                students.map((st, i) => (
                                    <tr key={st.student_id} className="hover:bg-brand-50/40 transition">
                                        <td className="px-3 py-2.5 text-center text-ink/50 border-r border-ink/10">
                                            {i + 1}
                                        </td>
                                        <td className="px-3 py-2.5 font-mono text-ink/70 border-r border-ink/10">
                                            {st.nis}
                                        </td>
                                        <td className="px-3 py-2.5 font-semibold text-brand-950 border-r border-ink/10">
                                            {st.name}
                                        </td>

                                        {/* Nilai Tiap Tugas */}
                                        {assignments.map((a) => (
                                            <td
                                                key={a.id}
                                                className="px-2 py-2.5 text-center border-r border-ink/10 font-mono"
                                            >
                                                {st.assignment_scores[a.id] !== null ? (
                                                    <span className="font-semibold text-brand-950">
                                                        {st.assignment_scores[a.id]}
                                                    </span>
                                                ) : (
                                                    <span className="text-ink/30">-</span>
                                                )}
                                            </td>
                                        ))}
                                        <td className="px-2 py-2.5 text-center font-bold font-mono bg-brand-50/30 text-brand-950 border-r border-ink/10">
                                            {st.avg_assignment !== null ? st.avg_assignment : '-'}
                                        </td>

                                        {/* Nilai Tiap Kuis/Ujian */}
                                        {quizzes.map((q) => (
                                            <td
                                                key={q.id}
                                                className="px-2 py-2.5 text-center border-r border-ink/10 font-mono"
                                            >
                                                {st.quiz_scores[q.id] !== null ? (
                                                    <span className="font-semibold text-brand-950">
                                                        {st.quiz_scores[q.id]}
                                                    </span>
                                                ) : (
                                                    <span className="text-ink/30">-</span>
                                                )}
                                            </td>
                                        ))}
                                        <td className="px-2 py-2.5 text-center font-bold font-mono bg-brand-50/30 text-brand-950 border-r border-ink/10">
                                            {st.avg_quiz !== null ? st.avg_quiz : '-'}
                                        </td>

                                        {/* Nilai Akhir */}
                                        <td className="px-3 py-2.5 text-center font-black font-mono text-sm bg-brand-100/60 text-brand-800 border-r border-ink/10">
                                            {st.final_score !== null ? st.final_score : '-'}
                                        </td>
                                        <td className="px-3 py-2.5 text-center font-bold border-r border-ink/10">
                                            {st.predicate}
                                        </td>
                                        <td className="px-3 py-2.5 text-center">
                                            {st.final_score !== null ? (
                                                <Badge tone={st.final_score >= 75 ? 'success' : 'danger'}>
                                                    {st.status_label}
                                                </Badge>
                                            ) : (
                                                <span className="text-ink/40">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </AppLayout>
    );
}
