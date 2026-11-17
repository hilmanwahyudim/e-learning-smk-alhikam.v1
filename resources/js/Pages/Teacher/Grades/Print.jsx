import { Printer, ArrowLeft } from 'lucide-react';

export default function Print({ subject, recap }) {
    const handlePrint = () => {
        window.print();
    };

    const assignments = recap?.assignments || [];
    const quizzes = recap?.quizzes || [];
    const students = recap?.students || [];

    const today = new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    return (
        <div className="min-h-screen bg-white p-8 text-black print:p-0">
            {/* Navigasi Print (Sembunyi saat cetak) */}
            <div className="mb-6 flex items-center justify-between print:hidden border-b pb-4">
                <button
                    type="button"
                    onClick={() => window.close()}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-black"
                >
                    <ArrowLeft size={16} />
                    <span>Tutup Halaman</span>
                </button>

                <button
                    type="button"
                    onClick={handlePrint}
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-800 shadow"
                >
                    <Printer size={16} />
                    <span>Cetak Sekarang (Print / PDF)</span>
                </button>
            </div>

            {/* Kop Surat Resmi SMK Al Hikam */}
            <div className="border-b-2 border-black pb-4 mb-6 text-center">
                <h2 className="text-sm font-bold tracking-wider uppercase">YAYASAN PONDOK PESANTREN AL HIKAM</h2>
                <h1 className="text-xl font-black uppercase tracking-tight">SMK AL HIKAM JOMBANG</h1>
                <p className="text-xs text-gray-700 mt-1">
                    Kompetensi Keahlian: Teknik Komputer & Jaringan • Rekayasa Perangkat Lunak • Otomatisasi Perkantoran
                </p>
                <p className="text-xs text-gray-600">
                    Alamat: Jl. Raya Al Hikam No. 01, Diwek, Jombang • Email: smk.alhikam@sch.id
                </p>
            </div>

            {/* Judul Dokumen */}
            <div className="text-center mb-6">
                <h3 className="text-base font-black uppercase underline tracking-wide">
                    DAFTAR REKAPITULASI NILAI HASIL BELAJAR SISWA
                </h3>
                <p className="text-xs mt-1 text-gray-700">
                    Tahun Ajaran: {subject.academic_year || '-'} • Semester: {subject.semester || '-'}
                </p>
            </div>

            {/* Rincian Mata Pelajaran & Kelas */}
            <div className="grid grid-cols-2 gap-4 text-xs mb-4">
                <div>
                    <p>
                        <span className="w-32 inline-block font-bold">Mata Pelajaran:</span>
                        {subject.name} ({subject.code})
                    </p>
                    <p>
                        <span className="w-32 inline-block font-bold">Kelas / Tingkat:</span>
                        {subject.class_name}
                    </p>
                </div>
                <div className="text-right">
                    <p>
                        <span className="font-bold">Guru Pengampu:</span> {subject.teacher_name}
                    </p>
                    <p>
                        <span className="font-bold">NIP:</span> {subject.teacher_nip || '-'}
                    </p>
                </div>
            </div>

            {/* Tabel Data Rekap */}
            <table className="w-full text-[10px] border-collapse border border-black mb-8">
                <thead>
                    <tr className="bg-gray-100 text-center font-bold">
                        <th className="border border-black px-1.5 py-1.5 w-6">No</th>
                        <th className="border border-black px-1.5 py-1.5 w-16">NIS</th>
                        <th className="border border-black px-2 py-1.5 text-left min-w-[120px]">Nama Siswa</th>

                        {assignments.map((a, i) => (
                            <th key={a.id} className="border border-black px-1 py-1 w-10">
                                T{i + 1}
                            </th>
                        ))}
                        <th className="border border-black px-1 py-1 w-11 bg-gray-200 font-black">R.Tgs</th>

                        {quizzes.map((q, i) => (
                            <th key={q.id} className="border border-black px-1 py-1 w-10">
                                {q.type === 'exam' ? `U${i + 1}` : `K${i + 1}`}
                            </th>
                        ))}
                        <th className="border border-black px-1 py-1 w-11 bg-gray-200 font-black">R.Kuis</th>

                        <th className="border border-black px-1.5 py-1.5 w-12 bg-gray-300 font-black text-xs">NA</th>
                        <th className="border border-black px-1 py-1.5 w-8">Pred</th>
                        <th className="border border-black px-1.5 py-1.5 w-16">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {students.map((st, idx) => (
                        <tr key={st.student_id} className="text-center">
                            <td className="border border-black px-1 py-1">{idx + 1}</td>
                            <td className="border border-black px-1 py-1 font-mono">{st.nis}</td>
                            <td className="border border-black px-2 py-1 text-left font-semibold truncate max-w-[150px]">
                                {st.name}
                            </td>

                            {assignments.map((a) => (
                                <td key={a.id} className="border border-black px-1 py-1 font-mono">
                                    {st.assignment_scores[a.id] !== null ? st.assignment_scores[a.id] : '-'}
                                </td>
                            ))}
                            <td className="border border-black px-1 py-1 font-bold bg-gray-100">
                                {st.avg_assignment !== null ? st.avg_assignment : '-'}
                            </td>

                            {quizzes.map((q) => (
                                <td key={q.id} className="border border-black px-1 py-1 font-mono">
                                    {st.quiz_scores[q.id] !== null ? st.quiz_scores[q.id] : '-'}
                                </td>
                            ))}
                            <td className="border border-black px-1 py-1 font-bold bg-gray-100">
                                {st.avg_quiz !== null ? st.avg_quiz : '-'}
                            </td>

                            <td className="border border-black px-1.5 py-1 font-black text-xs bg-gray-200">
                                {st.final_score !== null ? st.final_score : '-'}
                            </td>
                            <td className="border border-black px-1 py-1 font-bold">{st.predicate}</td>
                            <td className="border border-black px-1.5 py-1 font-semibold">{st.status_label}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Kolom Tanda Tangan */}
            <div className="grid grid-cols-2 gap-8 text-xs text-center mt-12 break-inside-avoid">
                <div>
                    <p>Mengetahui,</p>
                    <p className="font-bold">Kepala SMK Al Hikam</p>
                    <div className="h-20" />
                    <p className="font-bold underline">H. Ahmad Fauzi, S.Pd., M.M.</p>
                    <p className="text-[10px] text-gray-600">NIP. 19780512 200501 1 004</p>
                </div>
                <div>
                    <p>Jombang, {today}</p>
                    <p className="font-bold">Guru Mata Pelajaran</p>
                    <div className="h-20" />
                    <p className="font-bold underline">{subject.teacher_name}</p>
                    <p className="text-[10px] text-gray-600">NIP. {subject.teacher_nip || '—'}</p>
                </div>
            </div>
        </div>
    );
}
