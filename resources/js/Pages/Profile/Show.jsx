import { useForm } from '@inertiajs/react';
import {
    GraduationCap,
    KeyRound,
    Lock,
    Mail,
    MapPin,
    Phone,
    Save,
    Shield,
    User,
} from 'lucide-react';
import { Badge, Card, PageHeader } from '../../Components/ui';
import AppLayout from '../../Layouts/AppLayout';

export default function Show({ user }) {
    // Form update profile info
    const profileForm = useForm({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        address: user.address || '',
    });

    // Form change password
    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submitProfile = (e) => {
        e.preventDefault();
        profileForm.put('/profile');
    };

    const submitPassword = (e) => {
        e.preventDefault();
        passwordForm.put('/profile/password', {
            onSuccess: () => passwordForm.reset(),
        });
    };

    return (
        <AppLayout title="Profil & Akun Saya">
            <PageHeader
                title="Profil & Pengaturan Akun"
                subtitle="Kelola data identitas diri dan perbarui kata sandi akun E-Learning Anda."
            />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Kartu Ringkasan Akun */}
                <div>
                    <div className="rounded-xl border border-ink/10 bg-white p-6 shadow-sm text-center sticky top-4">
                        <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-black text-2xl ring-4 ring-brand-50">
                            {user.name.charAt(0)}
                        </div>

                        <h2 className="text-lg font-bold text-brand-950">{user.name}</h2>
                        <p className="text-xs font-mono text-ink/60 mt-0.5">@{user.username}</p>

                        <div className="mt-3 flex justify-center">
                            <Badge tone="primary">{user.role_label}</Badge>
                        </div>

                        <div className="mt-6 border-t border-ink/10 pt-4 text-left text-xs space-y-2.5 text-ink/70">
                            <div className="flex items-center gap-2">
                                <Mail size={14} className="text-ink/40" />
                                <span className="truncate">{user.email}</span>
                            </div>
                            {user.phone && (
                                <div className="flex items-center gap-2">
                                    <Phone size={14} className="text-ink/40" />
                                    <span>{user.phone}</span>
                                </div>
                            )}
                            {user.nip && (
                                <div className="flex items-center gap-2">
                                    <Shield size={14} className="text-ink/40" />
                                    <span>NIP: {user.nip}</span>
                                </div>
                            )}
                            {user.nis && (
                                <div className="flex items-center gap-2">
                                    <GraduationCap size={14} className="text-ink/40" />
                                    <span>NIS: {user.nis} {user.class_name ? `(${user.class_name})` : ''}</span>
                                </div>
                            )}
                            {user.address && (
                                <div className="flex items-start gap-2">
                                    <MapPin size={14} className="text-ink/40 mt-0.5 shrink-0" />
                                    <span>{user.address}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Form Perbarui Profil & Ganti Kata Sandi */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Perbarui Data Diri */}
                    <Card title="Informasi Data Diri">
                        <form onSubmit={submitProfile} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-brand-950 mb-1">
                                        Nama Lengkap
                                    </label>
                                    <input
                                        type="text"
                                        value={profileForm.data.name}
                                        onChange={(e) => profileForm.setData('name', e.target.value)}
                                        className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                                        required
                                    />
                                    {profileForm.errors.name && (
                                        <p className="mt-1 text-xs text-red-600">{profileForm.errors.name}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-brand-950 mb-1">
                                        Alamat Email
                                    </label>
                                    <input
                                        type="email"
                                        value={profileForm.data.email}
                                        onChange={(e) => profileForm.setData('email', e.target.value)}
                                        className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                                        required
                                    />
                                    {profileForm.errors.email && (
                                        <p className="mt-1 text-xs text-red-600">{profileForm.errors.email}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-brand-950 mb-1">
                                    Nomor Telepon / WhatsApp
                                </label>
                                <input
                                    type="text"
                                    value={profileForm.data.phone}
                                    onChange={(e) => profileForm.setData('phone', e.target.value)}
                                    placeholder="Contoh: 081234567890"
                                    className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                                />
                                {profileForm.errors.phone && (
                                    <p className="mt-1 text-xs text-red-600">{profileForm.errors.phone}</p>
                                )}
                            </div>

                            {user.role === 'student' && (
                                <div>
                                    <label className="block text-xs font-semibold text-brand-950 mb-1">
                                        Alamat Domisili
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={profileForm.data.address}
                                        onChange={(e) => profileForm.setData('address', e.target.value)}
                                        placeholder="Alamat tempat tinggal saat ini..."
                                        className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                                    />
                                    {profileForm.errors.address && (
                                        <p className="mt-1 text-xs text-red-600">{profileForm.errors.address}</p>
                                    )}
                                </div>
                            )}

                            <div className="flex justify-end pt-2">
                                <button
                                    type="submit"
                                    disabled={profileForm.processing}
                                    className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 transition disabled:opacity-50"
                                >
                                    <Save size={15} />
                                    <span>{profileForm.processing ? 'Menyimpan…' : 'Simpan Perubahan'}</span>
                                </button>
                            </div>
                        </form>
                    </Card>

                    {/* Ganti Kata Sandi */}
                    <Card title="Ganti Kata Sandi">
                        <form onSubmit={submitPassword} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-brand-950 mb-1">
                                    Kata Sandi Saat Ini
                                </label>
                                <input
                                    type="password"
                                    value={passwordForm.data.current_password}
                                    onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                                    placeholder="Masukkan kata sandi lama..."
                                    className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                                    required
                                />
                                {passwordForm.errors.current_password && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {passwordForm.errors.current_password}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-brand-950 mb-1">
                                        Kata Sandi Baru
                                    </label>
                                    <input
                                        type="password"
                                        value={passwordForm.data.password}
                                        onChange={(e) => passwordForm.setData('password', e.target.value)}
                                        placeholder="Minimal 6 karakter..."
                                        className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                                        required
                                    />
                                    {passwordForm.errors.password && (
                                        <p className="mt-1 text-xs text-red-600">
                                            {passwordForm.errors.password}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-brand-950 mb-1">
                                        Ulangi Kata Sandi Baru
                                    </label>
                                    <input
                                        type="password"
                                        value={passwordForm.data.password_confirmation}
                                        onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                                        placeholder="Ketik ulang kata sandi baru..."
                                        className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-2">
                                <button
                                    type="submit"
                                    disabled={passwordForm.processing}
                                    className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 transition disabled:opacity-50"
                                >
                                    <KeyRound size={15} />
                                    <span>{passwordForm.processing ? 'Menyimpan…' : 'Perbarui Kata Sandi'}</span>
                                </button>
                            </div>
                        </form>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
