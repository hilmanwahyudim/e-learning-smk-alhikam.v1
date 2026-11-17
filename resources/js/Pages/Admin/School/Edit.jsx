import { useForm } from '@inertiajs/react';
import {
    Building2,
    Globe,
    Mail,
    MapPin,
    Phone,
    Save,
    School,
    Shield,
} from 'lucide-react';
import { Card, PageHeader } from '../../../Components/ui';
import AppLayout from '../../../Layouts/AppLayout';

export default function Edit({ profile }) {
    const { data, setData, put, processing, errors } = useForm({
        name: profile.name || '',
        npsn: profile.npsn || '',
        tagline: profile.tagline || '',
        address: profile.address || '',
        phone: profile.phone || '',
        email: profile.email || '',
        website: profile.website || '',
        principal_name: profile.principal_name || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put('/admin/school');
    };

    return (
        <AppLayout title="Profil & Identitas Sekolah">
            <PageHeader
                title="Profil & Identitas SMK Al Hikam"
                subtitle="Atur identitas resmi sekolah yang ditampilkan pada header, kop dokumen, dan laporan hasil belajar."
            />

            <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
                <Card title="Identitas Pokok Sekolah">
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-semibold text-brand-950 mb-1">
                                    Nama Resmi Lembaga / Sekolah
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Contoh: SMK Al Hikam Jombang"
                                    className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                                    required
                                />
                                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-brand-950 mb-1">
                                    NPSN (Nomor Pokok Sekolah Nasional)
                                </label>
                                <input
                                    type="text"
                                    value={data.npsn}
                                    onChange={(e) => setData('npsn', e.target.value)}
                                    placeholder="Contoh: 69786543"
                                    className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm font-mono focus:border-brand-500 focus:outline-none"
                                />
                                {errors.npsn && <p className="mt-1 text-xs text-red-600">{errors.npsn}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-brand-950 mb-1">
                                    Motto / Slogan Sekolah
                                </label>
                                <input
                                    type="text"
                                    value={data.tagline}
                                    onChange={(e) => setData('tagline', e.target.value)}
                                    placeholder="Contoh: Berilmu, Berakhlak, dan Siap Berkarya"
                                    className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                                />
                                {errors.tagline && <p className="mt-1 text-xs text-red-600">{errors.tagline}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-brand-950 mb-1">
                                    Nama Kepala Sekolah
                                </label>
                                <input
                                    type="text"
                                    value={data.principal_name}
                                    onChange={(e) => setData('principal_name', e.target.value)}
                                    placeholder="Contoh: H. Ahmad Fauzi, S.Pd., M.M."
                                    className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                                />
                                {errors.principal_name && (
                                    <p className="mt-1 text-xs text-red-600">{errors.principal_name}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-brand-950 mb-1">
                                Alamat Lengkap Lembaga
                            </label>
                            <textarea
                                rows={3}
                                value={data.address}
                                onChange={(e) => setData('address', e.target.value)}
                                placeholder="Jalan, RT/RW, Dusun, Desa/Kelurahan, Kecamatan, Kabupaten/Kota, Kode Pos..."
                                className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                            />
                            {errors.address && <p className="mt-1 text-xs text-red-600">{errors.address}</p>}
                        </div>
                    </div>
                </Card>

                <Card title="Kontak & Kanal Resmi Sekolah">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-brand-950 mb-1">
                                Nomor Telepon / Fax
                            </label>
                            <input
                                type="text"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                placeholder="Contoh: (0321) 861234"
                                className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                            />
                            {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-brand-950 mb-1">
                                Email Resmi
                            </label>
                            <input
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="Contoh: smk.alhikam@sch.id"
                                className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                            />
                            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-brand-950 mb-1">
                                Alamat Website
                            </label>
                            <input
                                type="text"
                                value={data.website}
                                onChange={(e) => setData('website', e.target.value)}
                                placeholder="Contoh: https://smk-alhikam.sch.id"
                                className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                            />
                            {errors.website && <p className="mt-1 text-xs text-red-600">{errors.website}</p>}
                        </div>
                    </div>
                </Card>

                <div className="flex justify-end pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 transition disabled:opacity-50"
                    >
                        <Save size={16} />
                        <span>{processing ? 'Menyimpan…' : 'Simpan Profil Sekolah'}</span>
                    </button>
                </div>
            </form>
        </AppLayout>
    );
}
