import { router } from '@inertiajs/react';
import {
    Award,
    CheckCircle2,
    Download,
    FileSpreadsheet,
    FileText,
    GraduationCap,
    School,
    TrendingUp,
} from 'lucide-react';
import { Badge, Card, PageHeader } from '../../../Components/ui';
import AppLayout from '../../../Layouts/AppLayout';

export default function Index({ classes, selectedClassId, selectedClass, activeSemester, activeYear, reports }) {
    const handleClassChange = (id) => {
        router.get('/admin/reports', { class_id: id }, { preserveState: true });
    };

    // Rata-rata capaian seluruh mapel di kelas terpilih
    const validScores = reports.map((r) => r.average_score).filter((s) => s !== null);
    const overallClassAverage = validScores.length > 0
        ? Math.round((validScores.reduce((a, b) => a + b, 0) / validScores.length) * 10) / 10
        : null;

    const overallPassRate = reports.length > 0
        ? Math.round(reports.reduce((a, b) => a + b.pass_rate, 0) / reports.length)
        : 0;

    return (
        <AppLayout title="Laporan Nilai Akademik">
            <PageHeader
                title="Laporan Capaian Nilai Akademik"
                subtitle={`Rekapitulasi pencapaian nilai per kelas pada ${activeSemester || '-'} Tahun Pelajaran ${activeYear || '-'}.`}
            >
                {selectedClass && (
                    <a
                        href={`/admin/reports/export-csv?class_id=${selectedClass.id}`}
                        className="inline-flex items-center gap-2 rounded-lg border border-emerald-600/30 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 transition shadow-sm"
                    >
                        <FileSpreadsheet size={16} />
                        <span>Ekspor Laporan (.csv)</span>
                    </a>
                )}
            </PageHeader>

            {/* Selector Kelas */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-ink/10 bg-white p-4">
                <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-ink/70">Pilih Kelas:</label>
                    <select
                        value={selectedClassId || ''}
                        onChange={(e) => handleClassChange(e.target.value)}
                        className="rounded-lg border border-ink/20 px-3 py-1.5 text-xs font-semibold text-brand-950 focus:border-brand-500 focus:outline-none"
                    >
                        {classes.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name} {c.department ? `(${c.department})` : ''}
                            </option>
                        ))}
                    </select>
                </div>

                {selectedClass && (
                    <div className="text-xs text-ink/60">
                        Program Keahlian: <strong className="text-brand-950">{selectedClass.department || '-'}</strong>
                    </div>
                )}
            </div>

            {/* Statistik Ringkasan Kelas */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-ink/10 bg-white p-5 shadow-sm">
                    <span className="text-xs font-semibold text-ink/60">Total Mata Pelajaran</span>
                    <p className="mt-2 text-3xl font-black text-brand-950">{reports.length} Mapel</p>
                    <p className="mt-1 text-xs text-ink/50">Mata pelajaran aktif semester ini</p>
                </div>
                <div className="rounded-xl border border-ink/10 bg-white p-5 shadow-sm">
                    <span className="text-xs font-semibold text-ink/60">Rata-rata Capaian Kelas</span>
                    <p className="mt-2 text-3xl font-black text-brand-700">
                        {overallClassAverage !== null ? overallClassAverage : '—'}
                    </p>
                    <p className="mt-1 text-xs text-ink/50">Skala 0 - 100 lintas seluruh mapel</p>
                </div>
                <div className="rounded-xl border border-ink/10 bg-white p-5 shadow-sm">
                    <span className="text-xs font-semibold text-ink/60">Rata-rata Ketuntasan KKM</span>
                    <p className="mt-2 text-3xl font-black text-emerald-600">{overallPassRate}%</p>
                    <p className="mt-1 text-xs text-ink/50">Persentase siswa tuntas nilai minimal 75</p>
                </div>
            </div>

            {/* Tabel Laporan Capaian Per Mapel */}
            <Card padded={false}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-paper border-b border-ink/10 text-xs font-semibold uppercase tracking-wider text-ink/70">
                            <tr>
                                <th className="px-4 py-3 w-10 text-center">No</th>
                                <th className="px-4 py-3">Kode & Mata Pelajaran</th>
                                <th className="px-4 py-3">Guru Pengampu</th>
                                <th className="px-4 py-3 text-center">Total Nilai Masuk</th>
                                <th className="px-4 py-3 text-center">Rata-rata Nilai</th>
                                <th className="px-4 py-3 text-center">Tingkat Ketuntasan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-ink/10">
                            {reports.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-ink/50">
                                        Belum ada data mata pelajaran untuk kelas ini.
                                    </td>
                                </tr>
                            ) : (
                                reports.map((r, idx) => (
                                    <tr key={r.id} className="hover:bg-brand-50/40 transition">
                                        <td className="px-4 py-3.5 text-center text-xs text-ink/50">{idx + 1}</td>
                                        <td className="px-4 py-3.5">
                                            <span className="font-bold text-brand-950 block">{r.subject_name}</span>
                                            <span className="text-xs font-mono text-brand-700">{r.subject_code}</span>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <span className="text-xs font-semibold text-ink/80">{r.teacher_name}</span>
                                        </td>
                                        <td className="px-4 py-3.5 text-center font-mono text-xs">
                                            {r.total_entries} entri
                                        </td>
                                        <td className="px-4 py-3.5 text-center">
                                            {r.average_score !== null ? (
                                                <span className="font-bold font-mono text-brand-700 text-sm">
                                                    {r.average_score}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-ink/40">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3.5 text-center">
                                            <Badge tone={r.pass_rate >= 75 ? 'success' : r.pass_rate >= 50 ? 'warning' : 'danger'}>
                                                {r.pass_rate}% Tuntas
                                            </Badge>
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
