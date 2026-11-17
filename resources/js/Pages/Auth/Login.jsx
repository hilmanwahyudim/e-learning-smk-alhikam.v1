import { Head, useForm } from '@inertiajs/react';
import { BookOpenCheck, Eye, EyeOff, Loader2, Lock, User } from 'lucide-react';
import { useState } from 'react';
import Logo from '../../Components/Logo';

// Pola bintang segi delapan (rub el hizb) sebagai tekstur panel kiri.
const star =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='72' height='72' viewBox='0 0 72 72'%3E%3Cg fill='none' stroke='%23e0b24a' stroke-opacity='.22' stroke-width='1.2'%3E%3Crect x='16' y='16' width='40' height='40'/%3E%3Crect x='16' y='16' width='40' height='40' transform='rotate(45 36 36)'/%3E%3C/g%3E%3C/svg%3E";

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors } = useForm({
        login: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post('/login', { onFinish: () => setData('password', '') });
    };

    return (
        <>
            <Head title="Masuk" />

            <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
                {/* Panel identitas */}
                <aside
                    className="relative hidden flex-col justify-between overflow-hidden bg-brand-900 p-12 text-white lg:flex"
                    style={{ backgroundImage: `url("${star}")` }}
                >
                    <div className="absolute inset-y-0 right-0 w-1 bg-gold-500" aria-hidden="true" />

                    <div className="flex items-center gap-3">
                        <Logo size={48} />
                        <div className="leading-tight">
                            <p className="text-lg font-bold">SMK Al Hikam</p>
                            <p className="text-sm text-brand-200">E-Learning</p>
                        </div>
                    </div>

                    <div className="max-w-md">
                        <h1 className="text-4xl font-extrabold leading-[1.15] tracking-tight">
                            Ruang belajar digital SMK Al Hikam
                        </h1>
                        <p className="mt-5 text-base leading-relaxed text-brand-100">
                            Materi, tugas, dan ujian dari guru ada di satu tempat, bisa dibuka
                            dari ponsel maupun komputer.
                        </p>
                    </div>

                    <p className="text-sm text-brand-300">
                        © {new Date().getFullYear()} SMK Al Hikam
                    </p>
                </aside>

                {/* Form */}
                <main className="flex items-center justify-center px-5 py-10 sm:px-10">
                    <div className="w-full max-w-sm">
                        <div className="mb-8 flex items-center gap-3 lg:hidden">
                            <Logo size={44} />
                            <div className="leading-tight">
                                <p className="font-bold text-brand-900">SMK Al Hikam</p>
                                <p className="text-sm text-brand-600">E-Learning</p>
                            </div>
                        </div>

                        <div className="mb-8 flex items-start gap-3">
                            <span className="mt-1 grid size-10 place-items-center rounded-lg bg-brand-100 text-brand-700">
                                <BookOpenCheck size={20} aria-hidden="true" />
                            </span>
                            <div>
                                <h2 className="text-2xl font-bold text-brand-950">Masuk ke akun Anda</h2>
                                <p className="mt-1 text-sm text-ink/70">
                                    Gunakan username atau email yang diberikan sekolah.
                                </p>
                            </div>
                        </div>

                        <form onSubmit={submit} noValidate className="space-y-5">
                            <div>
                                <label htmlFor="login" className="mb-1.5 block text-sm font-semibold">
                                    Username atau email
                                </label>
                                <div className="relative">
                                    <User
                                        size={18}
                                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40"
                                        aria-hidden="true"
                                    />
                                    <input
                                        id="login"
                                        type="text"
                                        autoComplete="username"
                                        autoFocus
                                        value={data.login}
                                        onChange={(e) => setData('login', e.target.value)}
                                        aria-invalid={!!errors.login}
                                        aria-describedby={errors.login ? 'login-error' : undefined}
                                        className={`w-full rounded-lg border bg-white py-2.5 pl-10 pr-3 text-sm shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 ${
                                            errors.login ? 'border-red-500' : 'border-ink/20'
                                        }`}
                                    />
                                </div>
                                {errors.login && (
                                    <p id="login-error" role="alert" className="mt-1.5 text-sm text-red-600">
                                        {errors.login}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="password" className="mb-1.5 block text-sm font-semibold">
                                    Kata sandi
                                </label>
                                <div className="relative">
                                    <Lock
                                        size={18}
                                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40"
                                        aria-hidden="true"
                                    />
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="current-password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        aria-invalid={!!errors.password}
                                        className={`w-full rounded-lg border bg-white py-2.5 pl-10 pr-11 text-sm shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 ${
                                            errors.password ? 'border-red-500' : 'border-ink/20'
                                        }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((v) => !v)}
                                        aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                                        className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-md text-ink/50 hover:bg-ink/5 hover:text-ink"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p role="alert" className="mt-1.5 text-sm text-red-600">
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            <label className="flex cursor-pointer items-center gap-2.5 text-sm">
                                <input
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="size-4 rounded border-ink/30 accent-brand-700"
                                />
                                Tetap masuk di perangkat ini
                            </label>

                            <button
                                type="submit"
                                disabled={processing}
                                className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {processing && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
                                {processing ? 'Memeriksa akun…' : 'Masuk'}
                            </button>
                        </form>

                        <p className="mt-8 text-sm text-ink/60">
                            Lupa kata sandi? Hubungi administrator sekolah untuk mengatur ulang akun Anda.
                        </p>
                    </div>
                </main>
            </div>
        </>
    );
}
