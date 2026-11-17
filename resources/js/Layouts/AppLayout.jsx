import { Head, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { toast } from '../lib/swal';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

/** Kerangka semua halaman setelah login: sidebar kiri, topbar, area konten. */
export default function AppLayout({ title, children }) {
    const { url, props } = usePage();
    const [menuOpen, setMenuOpen] = useState(false);
    const { flash } = props;

    // Tutup menu mobile setelah berpindah halaman
    useEffect(() => setMenuOpen(false), [url]);

    // Pesan flash dari server (session 'success' / 'error')
    useEffect(() => {
        if (flash?.success) toast('success', flash.success);
        if (flash?.error) toast('error', flash.error);
    }, [flash?.success, flash?.error]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f3f1ff] via-[#f8f9fc] to-[#ebe7ff]">
            <Head title={title} />
            <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

            <div className="lg:pl-64">
                <Topbar title={title} onMenu={() => setMenuOpen(true)} />
                <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
            </div>
        </div>
    );
}
