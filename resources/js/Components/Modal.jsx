import { X } from 'lucide-react';
import { useEffect } from 'react';

export default function Modal({ open, onClose, title, children, footer }) {
    useEffect(() => {
        if (!open) return;
        const onKey = (e) => e.key === 'Escape' && onClose();
        document.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
            <div className="absolute inset-0 bg-brand-950/50" onClick={onClose} aria-hidden="true" />
            <div
                role="dialog"
                aria-modal="true"
                aria-label={title}
                className="relative flex max-h-[90vh] w-full max-w-lg flex-col rounded-t-2xl bg-white shadow-xl sm:rounded-2xl"
            >
                <header className="flex items-start justify-between gap-4 border-b border-ink/10 px-5 py-4">
                    <h2 className="text-lg font-bold text-brand-950">{title}</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Tutup"
                        className="grid size-8 shrink-0 place-items-center rounded-md text-ink/60 hover:bg-ink/5"
                    >
                        <X size={18} />
                    </button>
                </header>
                <div className="overflow-y-auto px-5 py-4">{children}</div>
                {footer && <footer className="flex justify-end gap-2 border-t border-ink/10 px-5 py-3">{footer}</footer>}
            </div>
        </div>
    );
}
