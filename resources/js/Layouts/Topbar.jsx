import { Link, router, usePage } from '@inertiajs/react';
import { Bell, ChevronDown, LogOut, Menu, Search, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { initials, timeAgo } from '../lib/format';
import { confirmAction } from '../lib/swal';

/** Menutup dropdown saat klik di luar atau menekan Escape. */
function useDismiss(open, onClose) {
    const ref = useRef(null);

    useEffect(() => {
        if (!open) return;
        const onClick = (e) => ref.current && !ref.current.contains(e.target) && onClose();
        const onKey = (e) => e.key === 'Escape' && onClose();
        document.addEventListener('mousedown', onClick);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onClick);
            document.removeEventListener('keydown', onKey);
        };
    }, [open, onClose]);

    return ref;
}

function NotificationMenu() {
    const { notifications } = usePage().props;
    const [open, setOpen] = useState(false);
    const ref = useDismiss(open, () => setOpen(false));
    const unread = notifications?.unread ?? 0;
    const items = notifications?.items ?? [];

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-label={unread ? `Notifikasi, ${unread} belum dibaca` : 'Notifikasi'}
                aria-expanded={open}
                className="relative grid size-10 place-items-center rounded-full text-ink/60 hover:bg-brand-50 transition"
            >
                <Bell size={20} />
                {unread > 0 && (
                    <span className="absolute right-1 top-1 grid min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-4 text-white">
                        {unread > 9 ? '9+' : unread}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-ink/10 bg-white shadow-xl">
                    <div className="flex items-center justify-between border-b border-ink/10 px-4 py-3">
                        <p className="text-sm font-bold text-brand-950">Notifikasi</p>
                        {unread > 0 && (
                            <button
                                type="button"
                                onClick={() => router.post('/notifications/read-all', {}, { preserveScroll: true })}
                                className="text-xs font-semibold text-brand-700 hover:underline"
                            >
                                Tandai semua dibaca
                            </button>
                        )}
                    </div>

                    {items.length === 0 ? (
                        <p className="px-4 py-8 text-center text-sm text-ink/60">Belum ada notifikasi.</p>
                    ) : (
                        <ul className="max-h-80 divide-y divide-ink/10 overflow-y-auto">
                            {items.map((n) => (
                                <li key={n.id}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setOpen(false);
                                            router.post(`/notifications/${n.id}/read`, {}, { preserveScroll: true });
                                        }}
                                        className={`flex w-full gap-3 px-4 py-3 text-left hover:bg-brand-50/60 ${
                                            n.read ? '' : 'bg-brand-50/40'
                                        }`}
                                    >
                                        <span
                                            className={`mt-1.5 size-2 shrink-0 rounded-full ${n.read ? 'bg-transparent' : 'bg-gold-500'}`}
                                            aria-hidden="true"
                                        />
                                        <span className="min-w-0">
                                            <span className="block text-sm font-semibold text-ink">{n.title}</span>
                                            {n.body && <span className="block text-sm text-ink/70">{n.body}</span>}
                                            <span className="mt-0.5 block text-xs text-ink/50">{timeAgo(n.at)}</span>
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}

function ProfileMenu() {
    const { user } = usePage().props.auth;
    const [open, setOpen] = useState(false);
    const ref = useDismiss(open, () => setOpen(false));

    const logout = async () => {
        setOpen(false);
        const ok = await confirmAction({
            title: 'Keluar dari aplikasi?',
            text: 'Anda perlu login lagi untuk melanjutkan.',
            confirmText: 'Ya, keluar',
        });
        if (ok) router.post('/logout');
    };

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-label="Menu profil"
                className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-3 hover:bg-brand-50 transition"
            >
                <span className="grid size-9 place-items-center rounded-full bg-brand-700 text-sm font-bold text-white">
                    {initials(user.name)}
                </span>
                <span className="hidden text-left leading-tight sm:block">
                    <span className="block max-w-40 truncate text-sm font-semibold text-ink">{user.name}</span>
                    <span className="block text-xs text-ink/60">{user.role_label}</span>
                </span>
                <ChevronDown size={16} className="hidden text-ink/50 sm:block" aria-hidden="true" />
            </button>

            {open && (
                <div className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border border-ink/10 bg-white shadow-xl">
                    <div className="border-b border-ink/10 px-4 py-3">
                        <p className="truncate text-sm font-bold text-brand-950">{user.name}</p>
                        <p className="truncate text-xs text-ink/60">{user.email}</p>
                        <p className="mt-1 text-xs text-ink/60">
                            Username: <span className="font-semibold">{user.username}</span>
                        </p>
                    </div>
                    <Link
                        href="/profile"
                        onClick={() => setOpen(false)}
                        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-ink hover:bg-ink/5 border-b border-ink/10 transition"
                    >
                        <User size={16} aria-hidden="true" />
                        Profil & Akun Saya
                    </Link>
                    <button
                        type="button"
                        onClick={logout}
                        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition"
                    >
                        <LogOut size={16} aria-hidden="true" />
                        Keluar
                    </button>
                </div>
            )}
        </div>
    );
}

export default function Topbar({ title, onMenu }) {
    return (
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-ink/10 bg-white/95 px-4 backdrop-blur-md sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
                <button
                    type="button"
                    onClick={onMenu}
                    aria-label="Buka menu"
                    className="grid size-10 place-items-center rounded-lg text-ink/70 hover:bg-ink/5 lg:hidden"
                >
                    <Menu size={20} />
                </button>
                <div className="hidden lg:flex items-center gap-2">
                    <div className="relative">
                        <Search
                            size={16}
                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/40"
                            aria-hidden="true"
                        />
                        <input
                            type="search"
                            placeholder="Cari menu..."
                            aria-label="Cari menu"
                            className="w-56 rounded-lg border border-ink/15 bg-paper py-2 pl-9 pr-3 text-sm placeholder:text-ink/40 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition"
                        />
                    </div>
                </div>
                <p className="truncate text-sm font-semibold text-ink/70 lg:hidden">{title}</p>
            </div>

            <div className="flex items-center gap-1">
                <NotificationMenu />
                <ProfileMenu />
            </div>
        </header>
    );
}
