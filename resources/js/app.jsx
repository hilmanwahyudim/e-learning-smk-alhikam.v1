import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';

const pages = import.meta.glob('./Pages/**/*.jsx', { eager: true });

createInertiaApp({
    title: (title) => (title ? `${title} | E-Learning SMK Al Hikam` : 'E-Learning SMK Al Hikam'),
    resolve: (name) => {
        const page = pages[`./Pages/${name}.jsx`];
        if (!page) throw new Error(`Halaman React tidak ditemukan: ${name}`);
        return page;
    },
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
    progress: { color: '#c9962b' },
});
