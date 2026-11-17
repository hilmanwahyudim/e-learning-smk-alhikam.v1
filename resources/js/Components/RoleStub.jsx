import { Head, router, usePage } from '@inertiajs/react';
import { LogOut } from 'lucide-react';
import Logo from './Logo';

/**
 * Halaman sementara untuk memverifikasi login + role di Tahap 2.
 * Diganti dengan layout dashboard lengkap (sidebar, topbar, kartu statistik) di Tahap 3.
 */
export default function RoleStub({ title }) {
    const { auth } = usePage().props;
    const user = auth.user;

    return (
        <>
            <Head title={title} />
            <div className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-12">
                <div className="rounded-2xl border border-ink/10 bg-white p-8 shadow-sm">
                    <div className="mb-6 flex items-center gap-3">
                        <Logo size={40} />
                        <p className="font-bold text-brand-900">E-Learning SMK Al Hikam</p>
                    </div>

                    <h1 className="text-2xl font-bold text-brand-950">{title}</h1>
                    <p className="mt-2 text-ink/70">
                        Halo, <strong>{user.name}</strong>. Anda masuk sebagai{' '}
                        <strong>{user.role_label}</strong>.
                    </p>
                    <p className="mt-4 rounded-lg bg-brand-50 p-4 text-sm text-brand-800">
                        Login dan pembatasan akses berfungsi. Tampilan dashboard lengkap dibuat di Tahap 3.
                    </p>

                    <button
                        type="button"
                        onClick={() => router.post('/logout')}
                        className="mt-6 inline-flex items-center gap-2 rounded-lg border border-ink/20 px-4 py-2 text-sm font-semibold hover:bg-ink/5"
                    >
                        <LogOut size={16} aria-hidden="true" />
                        Keluar
                    </button>
                </div>
            </div>
        </>
    );
}
