import { Link } from '@inertiajs/react';
import { ArrowLeft, BookOpen, CheckCircle, ClipboardCheck, ClipboardList, Download, ExternalLink, FileText, GraduationCap, Plus, Video } from 'lucide-react';
import { useState } from 'react';
import { Badge, Card, EmptyState, PageHeader } from '../../../Components/ui';
import AppLayout from '../../../Layouts/AppLayout';

export default function Show({ course }) {
    const [activeTab, setActiveTab] = useState('materials');

    const students = course.classroom?.enrollments?.map((en) => en.student) || [];

    return (
        <AppLayout title={`${course.subject?.name} - ${course.classroom?.name}`}>
            <div className="mb-4">
                <Link
                    href="/teacher/classes"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 hover:text-brand-900"
                >
                    <ArrowLeft size={14} />
                    <span>Kembali ke Daftar Kelas</span>
                </Link>
            </div>

            <div className="rounded-xl border border-ink/10 bg-white p-6 shadow-sm mb-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                                {course.subject?.code}
                            </span>
                            <Badge tone="info">Kelas {course.classroom?.name}</Badge>
                            <Badge tone="neutral">Semester {course.semester?.name}</Badge>
                        </div>
                        <h1 className="mt-2 text-2xl font-bold tracking-tight text-brand-950">
                            {course.subject?.name}
                        </h1>
                        <p className="mt-1 text-sm text-ink/70">
                            {course.classroom?.department?.name} • Tahun Ajaran {course.classroom?.academic_year?.name}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            href={`/teacher/materials?teacher_subject_id=${course.id}`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-ink/20 px-3.5 py-2 text-xs font-semibold text-ink/80 hover:bg-ink/5"
                        >
                            <Plus size={14} />
                            <span>Materi Baru</span>
                        </Link>
                        <Link
                            href={`/teacher/assignments?teacher_subject_id=${course.id}`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-ink/20 px-3.5 py-2 text-xs font-semibold text-ink/80 hover:bg-ink/5"
                        >
                            <Plus size={14} />
                            <span>Tugas Baru</span>
                        </Link>
                        <Link
                            href={`/teacher/quizzes?teacher_subject_id=${course.id}`}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-700"
                        >
                            <Plus size={14} />
                            <span>Kuis/Ujian</span>
                        </Link>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="mt-6 flex border-b border-ink/10 text-sm font-semibold">
                    <button
                        type="button"
                        onClick={() => setActiveTab('materials')}
                        className={`flex items-center gap-2 border-b-2 px-4 py-2.5 transition ${
                            activeTab === 'materials'
                                ? 'border-brand-600 text-brand-700'
                                : 'border-transparent text-ink/60 hover:text-ink/90'
                        }`}
                    >
                        <BookOpen size={16} />
                        <span>Materi Pembelajaran ({course.materials?.length ?? 0})</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('assignments')}
                        className={`flex items-center gap-2 border-b-2 px-4 py-2.5 transition ${
                            activeTab === 'assignments'
                                ? 'border-brand-600 text-brand-700'
                                : 'border-transparent text-ink/60 hover:text-ink/90'
                        }`}
                    >
                        <ClipboardList size={16} />
                        <span>Tugas Online ({course.assignments?.length ?? 0})</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('quizzes')}
                        className={`flex items-center gap-2 border-b-2 px-4 py-2.5 transition ${
                            activeTab === 'quizzes'
                                ? 'border-brand-600 text-brand-700'
                                : 'border-transparent text-ink/60 hover:text-ink/90'
                        }`}
                    >
                        <ClipboardCheck size={16} />
                        <span>Kuis & Ujian ({course.quizzes?.length ?? 0})</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('students')}
                        className={`flex items-center gap-2 border-b-2 px-4 py-2.5 transition ${
                            activeTab === 'students'
                                ? 'border-brand-600 text-brand-700'
                                : 'border-transparent text-ink/60 hover:text-ink/90'
                        }`}
                    >
                        <GraduationCap size={16} />
                        <span>Daftar Siswa ({students.length})</span>
                    </button>
                </div>
            </div>

            {/* Konten Tab 1: Materi */}
            {activeTab === 'materials' && (
                <div className="space-y-4">
                    {course.materials?.length === 0 ? (
                        <Card>
                            <EmptyState
                                icon={BookOpen}
                                title="Belum ada materi pembelajaran"
                                text="Klik tombol Materi Baru untuk membagikan bahan ajar, dokumen modul, atau video pembelajaran ke kelas ini."
                            />
                        </Card>
                    ) : (
                        course.materials.map((mat) => (
                            <div key={mat.id} className="rounded-xl border border-ink/10 bg-white p-5 shadow-sm">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <span className="text-xs font-semibold text-brand-700">
                                            Pertemuan {mat.sort_order}
                                        </span>
                                        <h2 className="text-lg font-bold text-brand-950 mt-0.5">{mat.title}</h2>
                                        {mat.description && <p className="mt-1 text-sm text-ink/70">{mat.description}</p>}
                                    </div>
                                    <Badge tone={mat.is_published ? 'success' : 'neutral'}>
                                        {mat.is_published ? 'Dipublikasikan' : 'Draft'}
                                    </Badge>
                                </div>

                                {mat.content && (
                                    <div className="mt-3 rounded-lg bg-paper/60 p-4 text-sm text-ink/80 prose max-w-none">
                                        {mat.content}
                                    </div>
                                )}

                                {/* Lampiran Berkas & Video */}
                                {mat.files?.length > 0 && (
                                    <div className="mt-4 border-t border-ink/10 pt-3">
                                        <p className="text-xs font-bold uppercase tracking-wider text-ink/50 mb-2">
                                            Lampiran & Media
                                        </p>
                                        <div className="flex flex-wrap items-center gap-2">
                                            {mat.files.map((file) => (
                                                <div key={file.id}>
                                                    {file.type === 'video' ? (
                                                        <a
                                                            href={file.url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
                                                        >
                                                            <Video size={14} />
                                                            <span>Buka Video Pembelajaran</span>
                                                            <ExternalLink size={12} />
                                                        </a>
                                                    ) : (
                                                        <a
                                                            href={`/teacher/materials/${mat.id}/download/${file.id}`}
                                                            className="inline-flex items-center gap-1.5 rounded-lg border border-ink/20 bg-white px-3 py-1.5 text-xs font-medium text-ink/80 hover:bg-ink/5"
                                                        >
                                                            <Download size={14} />
                                                            <span>{file.original_name}</span>
                                                        </a>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Konten Tab 2: Tugas Online */}
            {activeTab === 'assignments' && (
                <div className="space-y-4">
                    {course.assignments?.length === 0 ? (
                        <Card>
                            <EmptyState
                                icon={ClipboardList}
                                title="Belum ada tugas online"
                                text="Klik Tugas Baru untuk memberikan latihan atau tugas mandiri."
                            />
                        </Card>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2">
                            {course.assignments.map((asg) => (
                                <div key={asg.id} className="rounded-xl border border-ink/10 bg-white p-5 shadow-sm flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center justify-between gap-2">
                                            <Badge tone="warning">Nilai Maks: {asg.max_score}</Badge>
                                            <span className="text-xs text-ink/60">
                                                Deadline: {asg.deadline_at?.substring(0, 16)}
                                            </span>
                                        </div>
                                        <h2 className="mt-2 text-base font-bold text-brand-950">{asg.title}</h2>
                                        {asg.description && <p className="mt-1 text-xs text-ink/70 line-clamp-2">{asg.description}</p>}
                                    </div>

                                    <div className="mt-4 border-t border-ink/10 pt-3 flex items-center justify-between text-xs">
                                        <span className="font-semibold text-brand-700">
                                            {asg.submissions_count} Siswa Mengumpulkan
                                        </span>
                                        <Link
                                            href={`/teacher/assignments/${asg.id}`}
                                            className="font-bold text-brand-700 hover:underline"
                                        >
                                            Periksa Pengumpulan &rarr;
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Konten Tab 3: Kuis & Ujian */}
            {activeTab === 'quizzes' && (
                <div className="space-y-4">
                    {course.quizzes?.length === 0 ? (
                        <Card>
                            <EmptyState
                                icon={ClipboardCheck}
                                title="Belum ada kuis atau ujian"
                                text="Klik Kuis/Ujian untuk menyelenggarakan asesmen digital bagi siswa."
                            />
                        </Card>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2">
                            {course.quizzes.map((qz) => (
                                <div key={qz.id} className="rounded-xl border border-ink/10 bg-white p-5 shadow-sm flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center justify-between gap-2">
                                            <Badge tone={qz.type === 'exam' ? 'danger' : 'info'}>
                                                {qz.type === 'exam' ? 'Ujian Resmi' : 'Kuis / Latihan'}
                                            </Badge>
                                            <Badge tone={qz.is_published ? 'success' : 'neutral'}>
                                                {qz.is_published ? 'Aktif' : 'Draft'}
                                            </Badge>
                                        </div>
                                        <h2 className="mt-2 text-base font-bold text-brand-950">{qz.title}</h2>
                                        <p className="mt-1 text-xs text-ink/60">
                                            Durasi: {qz.duration_minutes} Menit • {qz.questions_count} Soal
                                        </p>
                                    </div>

                                    <div className="mt-4 border-t border-ink/10 pt-3 flex items-center justify-between text-xs">
                                        <span className="text-ink/70">
                                            {qz.attempts_count} Kali Pengerjaan
                                        </span>
                                        <Link
                                            href={`/teacher/quizzes/${qz.id}`}
                                            className="font-bold text-brand-700 hover:underline"
                                        >
                                            Kelola Soal &rarr;
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Konten Tab 4: Siswa */}
            {activeTab === 'students' && (
                <Card title={`Daftar Siswa Kelas (${students.length})`} padded={false}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-ink/[0.03] text-ink/70">
                                <tr>
                                    <th className="px-4 py-2.5 font-semibold">No</th>
                                    <th className="px-4 py-2.5 font-semibold">NIS</th>
                                    <th className="px-4 py-2.5 font-semibold">Nama Siswa</th>
                                    <th className="px-4 py-2.5 font-semibold">Jenis Kelamin</th>
                                    <th className="px-4 py-2.5 font-semibold">Kontak</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-ink/10">
                                {students.map((st, i) => (
                                    <tr key={st.id} className="hover:bg-brand-50/50">
                                        <td className="px-4 py-3 text-xs text-ink/50">{i + 1}</td>
                                        <td className="px-4 py-3 font-mono font-medium text-brand-950">{st.nis}</td>
                                        <td className="px-4 py-3 font-semibold text-brand-950">{st.user?.name}</td>
                                        <td className="px-4 py-3 text-ink/70">
                                            {st.gender === 'L' ? 'Laki-laki' : st.gender === 'P' ? 'Perempuan' : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-ink/60">{st.phone || '-'}</td>
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
