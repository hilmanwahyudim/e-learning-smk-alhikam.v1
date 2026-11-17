import { useState } from 'react';

/**
 * Logo resmi sekolah.
 * Letakkan berkas logo di: public/images/logo.png
 * Selama belum ada, tampil lencana inisial "AH".
 */
export default function Logo({ size = 44, className = '' }) {
    const [missing, setMissing] = useState(false);

    if (missing) {
        return (
            <div
                style={{ width: size, height: size }}
                className={`grid shrink-0 place-items-center rounded-xl bg-gold-500 text-sm font-extrabold tracking-tight text-brand-950 ${className}`}
                aria-hidden="true"
            >
                AH
            </div>
        );
    }

    return (
        <img
            src="/images/logo.png"
            alt="Logo SMK Al Hikam"
            width={size}
            height={size}
            onError={() => setMissing(true)}
            className={`shrink-0 object-contain ${className}`}
        />
    );
}
