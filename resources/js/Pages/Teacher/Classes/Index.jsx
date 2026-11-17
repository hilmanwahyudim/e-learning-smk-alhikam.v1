import { Link } from '@inertiajs/react';
import { BookOpen, ChevronRight, ClipboardCheck, ClipboardList, FileText, GraduationCap, School } from 'lucide-react';
import { Badge, Card, EmptyState, PageHeader } from '../../../Components/ui';
import AppLayout from '../../../Layouts/AppLayout';

export default function Index({ classes }) {
    return (
        <AppLayout title="Kelas & Mapel Saya">
            <PageHeader
                title="Kelas & Mata Pelajaran Saya"
                subtitle="Pilih kelas untuk mengelola materi pembelajaran, tugas online, kuis, dan interaksi siswa."
            />

            {classes.length === 0 ? (
                <Card>
                    <EmptyState
                        icon={School}
                        title="Belum ada kelas yang diampu"
                        text="Anda belum ditugaskan untuk mengampu mata pelajaran di kelas manapun. Hubungi administrator sekolah."
                    />
                </Card>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {classes.map((item) => (
                        <div
                            key={item.id}
                            className="flex flex-col justify-between rounded-xl border border-ink/10 bg-white p-5 shadow-sm transition hover:border-brand-500 hover:shadow-md"
                        >
                            <div>
                                <div className="flex items-center justify-between gap-2">
                                    <Badge tone="info">Kelas {item.grade_level}</Badge>
                                    <span className="font-mono text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                                        {item.subject_code}
                                    </span>
                                </div>

                                <h2 className="mt-3 text-lg font-bold text-brand-950">
                                    {item.subject_name}
                                </h2>
                                <p className="text-sm font-medium text-ink/70">
                                    {item.class_name} • {item.department}
                                </p>
                                <p className="mt-1 text-xs text-ink/50">
                                    Semester {item.semester} ({item.academic_year})
                                </p>

                                <div className="mt-4 grid grid-cols-3 gap-2 border-t border-ink/10 pt-3 text-center">
                                    <div>
                                        <p className="text-xs text-ink/60">Materi</p>
                                        <p className="font-bold text-brand-950">{item.materials_count}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-ink/60">Tugas</p>
                                        <p className="font-bold text-brand-950">{item.assignments_count}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-ink/60">Kuis</p>
                                        <p className="font-bold text-brand-950">{item.quizzes_count}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-5 border-t border-ink/10 pt-3 flex items-center justify-between">
                                <span className="inline-flex items-center gap-1.5 text-xs text-ink/60">
                                    <GraduationCap size={15} />
                                    <span>{item.students_count} Siswa</span>
                                </span>

                                <Link
                                    href={`/teacher/classes/${item.id}`}
                                    className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-900"
                                >
                                    <span>Buka Kelas</span>
                                    <ChevronRight size={14} />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </AppLayout>
    );
}
