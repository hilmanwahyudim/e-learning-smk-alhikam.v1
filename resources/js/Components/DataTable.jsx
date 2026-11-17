import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { EmptyState } from './ui';

/**
 * Tabel dengan pencarian dan pagination (sisi klien).
 * columns: [{ key, label, render?: (row) => node }]
 * searchKeys: kunci pada row yang ikut dicari.
 * Untuk data besar (Tahap 4+), versi server-side memakai paginator Laravel dengan props yang sama.
 */
export default function DataTable({
    columns,
    rows,
    searchKeys = [],
    pageSize = 8,
    emptyTitle = 'Belum ada data',
    emptyText,
}) {
    const [query, setQuery] = useState('');
    const [page, setPage] = useState(1);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return rows;
        return rows.filter((row) => searchKeys.some((k) => String(row[k] ?? '').toLowerCase().includes(q)));
    }, [rows, query, searchKeys]);

    const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const current = Math.min(page, pages);
    const start = (current - 1) * pageSize;
    const visible = filtered.slice(start, start + pageSize);

    return (
        <div>
            {searchKeys.length > 0 && (
                <div className="border-b border-ink/10 p-4">
                    <div className="relative max-w-xs">
                        <Search
                            size={16}
                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/40"
                            aria-hidden="true"
                        />
                        <input
                            type="search"
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                setPage(1);
                            }}
                            placeholder="Cari…"
                            aria-label="Cari di tabel"
                            className="w-full rounded-lg border border-ink/20 py-2 pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                        />
                    </div>
                </div>
            )}

            {filtered.length === 0 ? (
                <EmptyState title={query ? 'Tidak ada hasil' : emptyTitle} text={query ? 'Coba kata kunci lain.' : emptyText} />
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-ink/[0.03] text-ink/70">
                            <tr>
                                {columns.map((c) => (
                                    <th key={c.key} scope="col" className="whitespace-nowrap px-4 py-2.5 font-semibold">
                                        {c.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-ink/10">
                            {visible.map((row, i) => (
                                <tr key={row.id ?? i} className="hover:bg-brand-50/60">
                                    {columns.map((c) => (
                                        <td key={c.key} className="px-4 py-3 align-top">
                                            {c.render ? c.render(row) : row[c.key]}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {filtered.length > pageSize && (
                <div className="flex items-center justify-between gap-3 border-t border-ink/10 px-4 py-3 text-sm text-ink/70">
                    <span>
                        {start + 1}–{Math.min(start + pageSize, filtered.length)} dari {filtered.length}
                    </span>
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={() => setPage(current - 1)}
                            disabled={current === 1}
                            aria-label="Halaman sebelumnya"
                            className="grid size-8 place-items-center rounded-md border border-ink/20 hover:bg-ink/5 disabled:opacity-40"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <span className="px-2">
                            {current} / {pages}
                        </span>
                        <button
                            type="button"
                            onClick={() => setPage(current + 1)}
                            disabled={current === pages}
                            aria-label="Halaman berikutnya"
                            className="grid size-8 place-items-center rounded-md border border-ink/20 hover:bg-ink/5 disabled:opacity-40"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
