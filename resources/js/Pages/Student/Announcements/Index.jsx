import {
    Calendar,
    Megaphone,
    Search,
    User,
} from 'lucide-react';
import { useState } from 'react';
import { Badge, Card, EmptyState, PageHeader } from '../../../Components/ui';
import AppLayout from '../../../Layouts/AppLayout';

export default function Index({ announcements, className }) {
    const [searchQuery, setSearchQuery] = useState('');

    const filtered = announcements.filter(
        (a) =>
            a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.author_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AppLayout title="Pengumuman Sekolah">
            <PageHeader
                title="Papan Pengumuman"
                subtitle={`Informasi resmi untuk ${className ? `Kelas ${className}` : 'seluruh siswa'} dan lingkungan SMK Al Hikam.`}
            />

            {/* Filter Search */}
            <div className="mb-6 flex items-center justify-between gap-4">
                <div className="relative w-full max-w-md">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari judul pengumuman, pengirim, atau isi..."
                        className="w-full rounded-xl border border-ink/20 bg-white pl-10 pr-4 py-2 text-sm text-brand-950 placeholder:text-ink/40 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                </div>
            </div>

            {filtered.length === 0 ? (
                <Card>
                    <EmptyState
                        icon={<Megaphone size={32} />}
                        title="Tidak ada pengumuman"
                        description="Belum ada pengumuman atau instruksi yang sesuai dengan pencarian kamu."
                    />
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {filtered.map((ann) => (
                        <div
                            key={ann.id}
                            className="flex flex-col justify-between rounded-xl border border-ink/10 bg-white p-5 shadow-sm hover:border-brand-200 transition"
                        >
                            <div>
                                <div className="flex items-center gap-2 mb-2.5">
                                    <Badge tone={ann.scope === 'Seluruh Sekolah' ? 'primary' : 'info'}>
                                        {ann.scope}
                                    </Badge>
                                </div>
                                <h3 className="text-base font-bold text-brand-950 mb-2 leading-snug">
                                    {ann.title}
                                </h3>
                                <p className="text-sm text-ink/80 whitespace-pre-wrap leading-relaxed">
                                    {ann.body}
                                </p>
                            </div>

                            <div className="mt-5 pt-3.5 border-t border-ink/10 flex items-center justify-between text-xs text-ink/60">
                                <span className="flex items-center gap-1.5">
                                    <User size={13} className="text-ink/40" />
                                    <span>Oleh: <strong className="text-brand-950">{ann.author_name}</strong></span>
                                </span>
                                <span className="flex items-center gap-1 text-ink/50">
                                    <Calendar size={13} />
                                    {ann.published_at}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </AppLayout>
    );
}
