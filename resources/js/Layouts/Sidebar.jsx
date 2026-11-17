import { Link, router, usePage } from '@inertiajs/react';
import { LogOut, X } from 'lucide-react';
import Logo from '../Components/Logo';
import { navigationFor } from '../lib/navigation';
import { initials } from '../lib/format';
import { confirmAction } from '../lib/swal';

export default function Sidebar({ open, onClose }) {
    const { url, props } = usePage();
    const { auth, school } = props;
    const groups = navigationFor(auth.user.role);

    const logout = async () => {
        const ok = await confirmAction({
            title: 'Keluar dari aplikasi?',
            text: 'Anda perlu login lagi untuk melanjutkan.',
            confirmText: 'Ya, keluar',
        });
        if (ok) router.post('/logout');
    };

    return (
        <>
            {open && <div className="fixed inset-0 z-30 bg-brand-950/50 lg:hidden" onClick={onClose} aria-hidden="true" />}

            <aside
                aria-label="Navigasi utama"
                className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white text-slate-700 transition-transform duration-200 lg:translate-x-0 ${
                    open ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Header with logo */}
                <div className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-slate-200 px-4">
                    <div className="flex min-w-0 items-center gap-3">
                        <Logo size={36} />
                        <div className="min-w-0 leading-tight">
                            <p className="truncate text-sm font-bold text-slate-900">{school?.name ?? 'SMK Al Hikam'}</p>
                            <p className="text-xs text-slate-500">E-Learning</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Tutup menu"
                        className="grid size-8 place-items-center rounded-md text-slate-500 hover:bg-slate-100 lg:hidden"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
                    {groups.map((group, gi) => (
                        <div key={gi}>
                            {group.heading && (
                                <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">{group.heading}</p>
                            )}
                            <ul className="space-y-0.5">
                                {group.items.map((item) => {
                                    const Icon = item.icon;
                                    const active = url === item.href || url.startsWith(item.href + '/');

                                    if (!item.ready) {
                                        return (
                                            <li key={item.href}>
                                                <span
                                                    title="Segera hadir"
                                                    aria-disabled="true"
                                                    className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-400"
                                                >
                                                    <Icon size={18} aria-hidden="true" />
                                                    <span className="flex-1 truncate">{item.label}</span>
                                                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
                                                        Segera
                                                    </span>
                                                </span>
                                            </li>
                                        );
                                    }

                                    return (
                                        <li key={item.href}>
                                            <Link
                                                href={item.href}
                                                aria-current={active ? 'page' : undefined}
                                                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                                                    active
                                                        ? 'bg-brand-100 text-brand-700 shadow-sm'
                                                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                                }`}
                                            >
                                                <span className={`grid size-8 place-items-center rounded-md ${active ? 'bg-gold-500/20 text-gold-400' : ''}`}>
                                                    <Icon size={18} aria-hidden="true" />
                                                </span>
                                                <span className="truncate">{item.label}</span>
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </nav>

                {/* User profile section at bottom */}
                <div className="border-t border-slate-200 p-3">
                    <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
                        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gold-500 text-sm font-bold text-brand-950">
                            {initials(auth.user.name)}
                        </span>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-slate-900">{auth.user.name}</p>
                            <p className="truncate text-xs text-slate-500">{auth.user.role_label}</p>
                        </div>
                        <button
                            type="button"
                            onClick={logout}
                            title="Keluar"
                            className="grid size-8 shrink-0 place-items-center rounded-md text-brand-300 hover:bg-white/10 hover:text-red-400 transition"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
