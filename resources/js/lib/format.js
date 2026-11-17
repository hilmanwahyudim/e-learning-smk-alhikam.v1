const LOCALE = 'id-ID';

export const formatDate = (iso) =>
    iso ? new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso)) : '-';

export const formatDateTime = (iso) =>
    iso
        ? new Intl.DateTimeFormat(LOCALE, {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
          }).format(new Date(iso))
        : '-';

/** Untuk label grafik: menerima 'YYYY-MM-DD'. */
export const shortDay = (ymd) =>
    new Intl.DateTimeFormat(LOCALE, { weekday: 'short', day: 'numeric' }).format(new Date(`${ymd}T00:00:00`));

export function timeAgo(iso) {
    const seconds = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
    if (seconds < 60) return 'baru saja';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} menit lalu`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} jam lalu`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} hari lalu`;
    return formatDate(iso);
}

/** "3 hari lagi", "5 jam lagi", atau "Lewat 2 hari". */
export function timeUntil(iso) {
    const diff = new Date(iso).getTime() - Date.now();
    const abs = Math.abs(diff);
    const hours = Math.floor(abs / 3_600_000);
    const days = Math.floor(hours / 24);
    const text = days >= 1 ? `${days} hari` : hours >= 1 ? `${hours} jam` : `${Math.max(1, Math.floor(abs / 60_000))} menit`;
    return diff >= 0 ? `${text} lagi` : `Lewat ${text}`;
}

export const initials = (name = '') =>
    name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0].toUpperCase())
        .join('');
