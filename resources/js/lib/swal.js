import Swal from 'sweetalert2';

const BRAND = '#1b5b49';

/** Dialog konfirmasi. Mengembalikan Promise<boolean>. */
export function confirmAction({
    title,
    text,
    confirmText = 'Ya, lanjutkan',
    icon = 'question',
    danger = false,
}) {
    return Swal.fire({
        title,
        text,
        icon,
        showCancelButton: true,
        confirmButtonText: confirmText,
        cancelButtonText: 'Batal',
        confirmButtonColor: danger ? '#dc2626' : BRAND,
        reverseButtons: true,
        focusCancel: danger,
    }).then((result) => result.isConfirmed);
}

/** Notifikasi singkat di pojok kanan atas. icon: success | error | info | warning */
export function toast(icon, title) {
    return Swal.fire({
        toast: true,
        position: 'top-end',
        icon,
        title,
        showConfirmButton: false,
        timer: 3500,
        timerProgressBar: true,
    });
}
