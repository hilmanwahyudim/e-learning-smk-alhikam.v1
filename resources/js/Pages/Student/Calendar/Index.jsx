import {
    AlertCircle,
    Calendar,
    CheckCircle2,
    Clock,
    Filter,
    HelpCircle,
} from 'lucide-react';
import { useState } from 'react';
import { Badge, Card, EmptyState, PageHeader } from '../../../Components/ui';
import AppLayout from '../../../Layouts/AppLayout';

export default function Index({ events, academicYear }) {
    const [selectedType, setSelectedType] = useState('all');

    const filteredEvents = events.filter((e) =>
        selectedType === 'all' ? true : e.category === selectedType
    );

    return (
        <AppLayout title="Kalender Pembelajaran">
            <PageHeader
                title="Kalender Akademik & Agenda Belajar"
                subtitle={`Jadwal kegiatan akademik, tenggat pengumpulan tugas, dan jadwal ujian pada Tahun Pelajaran ${academicYear || '-'}.`}
            />

            {/* Filter Kategori */}
            <div className="mb-6 flex flex-wrap items-center gap-2">
                {[
                    { key: 'all', label: 'Semua Agenda' },
                    { key: 'tugas', label: 'Tenggat Tugas' },
                    { key: 'ujian', label: 'Kuis & Ujian' },
                    { key: 'akademik', label: 'Agenda Sekolah' },
                ].map((item) => (
                    <button
                        key={item.key}
                        type="button"
                        onClick={() => setSelectedType(item.key)}
                        className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
                            selectedType === item.key
                                ? 'bg-brand-600 text-white shadow-sm'
                                : 'bg-white text-ink/70 border border-ink/15 hover:border-brand-300 hover:text-brand-700'
                        }`}
                    >
                        {item.label}
                    </button>
                ))}
            </div>

            {filteredEvents.length === 0 ? (
                <Card>
                    <EmptyState
                        icon={<Calendar size={32} />}
                        title="Tidak ada agenda"
                        description="Belum ada agenda kegiatan, deadline tugas, atau jadwal ujian untuk kategori ini."
                    />
                </Card>
            ) : (
                <div className="space-y-3">
                    {filteredEvents.map((evt) => {
                        const isTugas = evt.category === 'tugas';
                        const isUjian = evt.category === 'ujian';

                        return (
                            <div
                                key={evt.id}
                                className="flex items-center gap-4 rounded-xl border border-ink/10 bg-white p-4 shadow-sm hover:border-brand-200 transition"
                            >
                                <div
                                    className={`flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl font-bold ${
                                        isTugas
                                            ? 'bg-amber-100 text-amber-800'
                                            : isUjian
                                            ? 'bg-red-100 text-red-800'
                                            : 'bg-brand-100 text-brand-800'
                                    }`}
                                >
                                    <span className="text-[10px] uppercase tracking-wider font-semibold">
                                        {new Date(evt.date).toLocaleDateString('id-ID', { month: 'short' })}
                                    </span>
                                    <span className="text-base font-black leading-none">
                                        {new Date(evt.date).getDate()}
                                    </span>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <Badge
                                            tone={
                                                isTugas
                                                    ? 'warning'
                                                    : isUjian
                                                    ? 'danger'
                                                    : 'info'
                                            }
                                        >
                                            {evt.type_label}
                                        </Badge>
                                        <span className="text-xs text-ink/50 font-medium">
                                            {new Date(evt.date).toLocaleDateString('id-ID', {
                                                weekday: 'long',
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                            })}
                                        </span>
                                    </div>

                                    <h3 className="text-sm font-bold text-brand-950 truncate">{evt.title}</h3>
                                    {evt.description && (
                                        <p className="text-xs text-ink/60 truncate mt-0.5">{evt.description}</p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </AppLayout>
    );
}
