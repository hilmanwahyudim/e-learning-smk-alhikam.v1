/** Komponen kecil yang dipakai di banyak halaman. */

export function PageHeader({ title, subtitle, children }) {
    return (
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-brand-950">{title}</h1>
                {subtitle && <p className="mt-1 text-sm text-ink/70">{subtitle}</p>}
            </div>
            {children}
        </div>
    );
}

export function Card({ title, subtitle, action, children, className = '', padded = true }) {
    return (
        <section className={`rounded-2xl border border-white/80 bg-white/95 shadow-[0_8px_30px_rgba(43,34,88,0.08)] ${className}`}>
            {(title || action) && (
                <header className="flex items-center justify-between gap-3 border-b border-ink/10 px-5 py-3.5">
                    <div>
                        <h2 className="text-sm font-bold text-brand-950">{title}</h2>
                        {subtitle && <p className="text-xs text-ink/50">{subtitle}</p>}
                    </div>
                    {action}
                </header>
            )}
            <div className={padded ? 'p-5' : ''}>{children}</div>
        </section>
    );
}

const tones = {
    neutral: 'bg-ink/5 text-ink/70',
    success: 'bg-brand-100 text-brand-800',
    warning: 'bg-gold-400/25 text-gold-600',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-sky-100 text-sky-800',
};

export function Badge({ tone = 'neutral', children }) {
    return (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${tones[tone]}`}>
            {children}
        </span>
    );
}

export function ProgressBar({ value, label }) {
    const v = Math.max(0, Math.min(100, value));
    return (
        <div
            role="progressbar"
            aria-valuenow={v}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={label}
            className="h-2 w-full overflow-hidden rounded-full bg-ink/10"
        >
            <div className="h-full rounded-full bg-brand-600 transition-[width]" style={{ width: `${v}%` }} />
        </div>
    );
}

export function EmptyState({ icon: Icon, title, text }) {
    return (
        <div className="flex flex-col items-center px-4 py-8 text-center">
            {Icon && (
                <span className="mb-3 grid size-11 place-items-center rounded-full bg-ink/5 text-ink/40">
                    <Icon size={22} aria-hidden="true" />
                </span>
            )}
            <p className="text-sm font-semibold text-ink/80">{title}</p>
            {text && <p className="mt-1 max-w-xs text-sm text-ink/60">{text}</p>}
        </div>
    );
}
