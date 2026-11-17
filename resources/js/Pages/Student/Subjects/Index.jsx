import { Link } from '@inertiajs/react';
import { BookOpen, ChevronRight, ClipboardList, GraduationCap, HelpCircle } from 'lucide-react';
import { Card, EmptyState, PageHeader } from '../../../Components/ui';
import AppLayout from '../../../Layouts/AppLayout';

function ProgressBar({ percent }) {
    return (
        <div className="mt-2">
            <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-ink/60">Progres Materi</span>
                <span className="text-xs font-bold text-brand-700">{percent}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-ink/10 overflow-hidden">
                <div
                    className="h-full rounded-full bg-brand-500 transition-all"
                    style={{ width: `${percent}%` }}
                />
            </div>
        </div>
    );
}

export default function Index({ subjects, classroom, activeSemester, activeYear }) {
    return (
        <AppLayout title="Mata Pelajaran Saya">
            <PageHeader
                title="Mata Pelajaran Saya"
                subtitle={
                    classroom
                        ? `Kelas ${classroom.name} • ${activeSemester ?? '—'} • ${activeYear ?? '—'}`
                        : 'Belum terdaftar di kelas manapun'
                }
            />

            {subjects.length === 0 ? (
                <Card>
                    <EmptyState
                        icon={<BookOpen size={32} />}
                        title="Belum ada mata pelajaran"
                        description="Hubungi administrator untuk memastikan kamu sudah terdaftar di kelas yang aktif."
                    />
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {subjects.map((subject) => (
                        <Link
                            key={subject.id}
                            href={`/student/subjects/${subject.id}`}
                            className="group flex flex-col rounded-xl border border-ink/10 bg-white p-5 shadow-sm hover:border-brand-300 hover:shadow-md transition"
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                                    <BookOpen size={22} />
                                </div>
                                <ChevronRight
                                    size={18}
                                    className="mt-1 shrink-0 text-ink/30 group-hover:text-brand-500 transition"
                                />
                            </div>

                            {/* Subject name */}
                            <div className="mt-3 flex-1">
                                <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider">
                                    {subject.code}
                                </span>
                                <h3 className="mt-0.5 text-base font-bold text-brand-950 leading-snug group-hover:text-brand-700 transition">
                                    {subject.name}
                                </h3>
                                <p className="mt-1 text-xs text-ink/60 flex items-center gap-1">
                                    <GraduationCap size={12} />
                                    {subject.teacher_name}
                                </p>
                            </div>

                            {/* Stats */}
                            <div className="mt-4 flex items-center gap-4 text-xs text-ink/60">
                                <span className="flex items-center gap-1">
                                    <BookOpen size={12} />
                                    {subject.materials_count} Materi
                                </span>
                                <span className="flex items-center gap-1">
                                    <ClipboardList size={12} />
                                    {subject.assignments_count} Tugas
                                </span>
                                <span className="flex items-center gap-1">
                                    <HelpCircle size={12} />
                                    {subject.quizzes_count} Kuis
                                </span>
                            </div>

                            <ProgressBar percent={subject.progress_percent} />
                        </Link>
                    ))}
                </div>
            )}
        </AppLayout>
    );
}
