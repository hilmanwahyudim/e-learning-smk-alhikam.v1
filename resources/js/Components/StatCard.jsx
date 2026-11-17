const tones = {
    brand: {
        bg: 'border border-violet-200 bg-violet-100/80',
        icon: 'bg-violet-500 text-white',
        text: 'text-slate-600',
        sub: 'text-slate-500',
        value: 'text-slate-950',
    },
    sky: {
        bg: 'border border-sky-200 bg-sky-100/80',
        icon: 'bg-sky-500 text-white',
        text: 'text-slate-600',
        sub: 'text-slate-500',
        value: 'text-slate-950',
    },
    gold: {
        bg: 'border border-amber-200 bg-amber-100/80',
        icon: 'bg-amber-500 text-white',
        text: 'text-slate-600',
        sub: 'text-slate-500',
        value: 'text-slate-950',
    },
    rose: {
        bg: 'border border-rose-200 bg-rose-100/80',
        icon: 'bg-rose-500 text-white',
        text: 'text-slate-600',
        sub: 'text-slate-500',
        value: 'text-slate-950',
    },
    white: {
        bg: 'bg-white border border-ink/10',
        icon: 'bg-brand-100 text-brand-700',
        text: 'text-ink/70',
        sub: 'text-ink/60',
        value: 'text-brand-950',
    },
};

export default function StatCard({ icon: Icon, label, value, hint, tone = 'brand' }) {
    const t = tones[tone] ?? tones.brand;
    return (
        <div className={`relative overflow-hidden rounded-xl p-5 shadow-sm ${t.bg}`}>
            <div className="flex items-center gap-4">
                <span className={`grid size-12 shrink-0 place-items-center rounded-lg ${t.icon}`}>
                    <Icon size={22} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                    <p className={`text-sm font-medium ${t.text}`}>{label}</p>
                    <p className={`text-2xl font-bold leading-tight ${t.value}`}>{value}</p>
                    {hint && <p className={`truncate text-xs ${t.sub}`}>{hint}</p>}
                </div>
            </div>
        </div>
    );
}
