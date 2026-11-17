import {
    Activity,
    Clock,
    Globe,
    Search,
    Shield,
    User,
} from 'lucide-react';
import { useState } from 'react';
import { Badge, Card, PageHeader } from '../../../Components/ui';
import AppLayout from '../../../Layouts/AppLayout';

export default function Index({ logs }) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredLogs = logs.filter(
        (l) =>
            l.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            l.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (l.description && l.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <AppLayout title="Log Aktivitas Sistem">
            <PageHeader
                title="Log Aktivitas & Audit Trail"
                subtitle="Catatan riwayat aktivitas pengguna, autentikasi, dan perubahan data di lingkungan E-Learning."
            />

            <div className="mb-6 flex items-center justify-between gap-4">
                <div className="relative w-full max-w-md">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari aktivitas, nama pengguna, atau aksi..."
                        className="w-full rounded-xl border border-ink/20 bg-white pl-10 pr-4 py-2 text-sm text-brand-950 placeholder:text-ink/40 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                </div>
                <span className="text-xs text-ink/50">Menampilkan {filteredLogs.length} entri terbaru</span>
            </div>

            <Card padded={false}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-paper border-b border-ink/10 text-xs font-semibold uppercase tracking-wider text-ink/70">
                            <tr>
                                <th className="px-4 py-3 w-10 text-center">No</th>
                                <th className="px-4 py-3">Pengguna & Peran</th>
                                <th className="px-4 py-3">Aksi</th>
                                <th className="px-4 py-3">Deskripsi Aktivitas</th>
                                <th className="px-4 py-3">IP Address</th>
                                <th className="px-4 py-3 text-right">Waktu</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-ink/10">
                            {filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-ink/50">
                                        Tidak ada catatan aktivitas yang sesuai.
                                    </td>
                                </tr>
                            ) : (
                                filteredLogs.map((log, idx) => (
                                    <tr key={log.id} className="hover:bg-brand-50/40 transition">
                                        <td className="px-4 py-3.5 text-center text-xs text-ink/50">{idx + 1}</td>
                                        <td className="px-4 py-3.5">
                                            <span className="font-bold text-brand-950 block">{log.user_name}</span>
                                            <span className="text-xs text-ink/60 flex items-center gap-1.5 mt-0.5">
                                                <span className="font-mono">@{log.username}</span>
                                                <span>•</span>
                                                <Badge tone="neutral">{log.role}</Badge>
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <span className="font-mono text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 text-xs text-ink/80 max-w-xs truncate">
                                            {log.description || '-'}
                                        </td>
                                        <td className="px-4 py-3.5 text-xs font-mono text-ink/60">
                                            {log.ip_address || '-'}
                                        </td>
                                        <td className="px-4 py-3.5 text-right text-xs">
                                            <span className="font-medium text-brand-950 block">{log.time_ago}</span>
                                            <span className="text-[11px] text-ink/40 font-mono">{log.created_at}</span>
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
