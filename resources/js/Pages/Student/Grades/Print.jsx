import { ArrowLeft, Printer } from 'lucide-react';

export default function Print({ student, semester, academic_year, subjects, overallGpa }) {
    const handlePrint = () => {
        window.print();
    };

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

            {/* Kop Resmi Sekolah */}
            <div className="border-b-2 border-black pb-4 mb-6 text-center">
                <h2 className="text-sm font-bold tracking-wider uppercase">YAYASAN PONDOK PESANTREN AL HIKAM</h2>
                <h1 className="text-xl font-black uppercase tracking-tight">SMK AL HIKAM JOMBANG</h1>
                <p className="text-xs text-gray-700 mt-0.5">
                    Kompetensi Keahlian: Teknik Komputer & Jaringan • Rekayasa Perangkat Lunak • Otomatisasi Perkantoran
                </p>
                <p className="text-xs text-gray-600">
                    Alamat: Jl. Raya Al Hikam No. 01, Diwek, Jombang • NPSN: 69786543 • Website: smk-alhikam.sch.id
                </p>
            </div>

            {/* Judul Dokumen */}
            <div className="text-center mb-6">
                <h3 className="text-base font-black uppercase underline tracking-wide">
                    LEMBAR LAPORAN CAPAIAN HASIL BELAJAR SISWA
                </h3>
                <p className="text-xs mt-1 text-gray-700">
                    Semester: {semester || '-'} • Tahun Pelajaran: {academic_year || '-'}
                </p>
            </div>

            {/* Data Identitas Siswa */}
            <div className="grid grid-cols-2 gap-4 text-xs mb-5 border border-black p-3 bg-gray-50/50">
                <div className="space-y-1">
                    <p>
                        <span className="w-28 inline-block font-bold">Nama Siswa:</span>
                        <span className="uppercase font-semibold">{student.name}</span>
                    </p>
                    <p>
                        <span className="w-28 inline-block font-bold">NIS / NISN:</span>
                        <span className="font-mono">{student.nis} / {student.nisn || '-'}</span>
                    </p>
                </div>
                <div className="space-y-1">
                    <p>
                        <span className="w-28 inline-block font-bold">Kelas:</span>
                        <span>{student.class_name || '-'}</span>
                    </p>
                    <p>
                        <span className="w-28 inline-block font-bold">Program Keahlian:</span>
                        <span>{student.department_name || '-'}</span>
                    </p>
                </div>
            </div>

            {/* Tabel Nilai */}
            <table className="w-full text-xs border-collapse border border-black mb-6">
                <thead>
                    <tr className="bg-gray-100 text-center font-bold">
                        <th className="border border-black px-2 py-2 w-8">No</th>
                        <th className="border border-black px-2 py-2 w-20">Kode</th>
                        <th className="border border-black px-3 py-2 text-left">Mata Pelajaran</th>
                        <th className="border border-black px-3 py-2 text-left">Guru Pengampu</th>
                        <th className="border border-black px-2 py-2 w-16">R. Tugas</th>
                        <th className="border border-black px-2 py-2 w-16">R. Kuis</th>
                        <th className="border border-black px-2 py-2 w-16 bg-gray-200 font-black">Nilai Akhir</th>
                        <th className="border border-black px-2 py-2 w-12">Predikat</th>
                        <th className="border border-black px-2 py-2 w-20">Keterangan</th>
                    </tr>
                </thead>
                <tbody>
                    {subjects.map((sub, idx) => (
                        <tr key={idx} className="text-center">
                            <td className="border border-black px-2 py-2">{idx + 1}</td>
                            <td className="border border-black px-2 py-2 font-mono">{sub.subject_code}</td>
                            <td className="border border-black px-3 py-2 text-left font-semibold">{sub.subject_name}</td>
                            <td className="border border-black px-3 py-2 text-left text-gray-700">{sub.teacher_name}</td>
                            <td className="border border-black px-2 py-2 font-mono">{sub.avg_assignment ?? '-'}</td>
                            <td className="border border-black px-2 py-2 font-mono">{sub.avg_quiz ?? '-'}</td>
                            <td className="border border-black px-2 py-2 font-mono font-black bg-gray-100">
                                {sub.final_score ?? '-'}
                            </td>
                            <td className="border border-black px-2 py-2 font-bold">{sub.predicate}</td>
                            <td className="border border-black px-2 py-2">{sub.status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Rekap Nilai Rata-rata */}
            <div className="flex justify-between items-center border border-black p-3 text-xs mb-8 bg-gray-50/50">
                <div>
                    <span className="font-bold">Kriteria Ketuntasan Minimal (KKM): </span>
                    <span>75 (Tujuh Puluh Lima)</span>
                </div>
                <div>
                    <span className="font-bold">Indeks Prestasi / Rata-rata Semester: </span>
                    <strong className="text-sm font-black text-black font-mono ml-2">
                        {overallGpa !== null ? overallGpa : '—'}
                    </strong>
                </div>
            </div>

            {/* Kolom Tanda Tangan Tiga Pihak */}
            <div className="grid grid-cols-3 gap-4 text-xs text-center mt-10 break-inside-avoid">
                <div>
                    <p>Mengetahui,</p>
                    <p className="font-bold">Orang Tua / Wali Siswa</p>
                    <div className="h-20" />
                    <p className="font-bold">( ............................................ )</p>
                </div>
                <div>
                    <p>Jombang, {today}</p>
                    <p className="font-bold">Wali Kelas</p>
                    <div className="h-20" />
                    <p className="font-bold underline">Ustadzah Siti Aminah, S.Pd.</p>
                    <p className="text-[10px] text-gray-600">NIP. 19850314 201101 2 008</p>
                </div>
                <div>
                    <p>Mengetahui,</p>
                    <p className="font-bold">Kepala SMK Al Hikam</p>
                    <div className="h-20" />
                    <p className="font-bold underline">H. Ahmad Fauzi, S.Pd., M.M.</p>
                    <p className="text-[10px] text-gray-600">NIP. 19780512 200501 1 004</p>
                </div>
            </div>
        </div>
    );
}
