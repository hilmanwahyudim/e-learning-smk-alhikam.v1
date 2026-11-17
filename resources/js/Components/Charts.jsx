import {
    ArcElement,
    CategoryScale,
    Chart as ChartJS,
    Filler,
    Legend,
    LineElement,
    LinearScale,
    PointElement,
    Tooltip,
} from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(ArcElement, CategoryScale, LinearScale, LineElement, PointElement, Filler, Tooltip, Legend);
ChartJS.defaults.font.family = "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif";
ChartJS.defaults.color = '#12261fb3';

export function ActivityChart({ labels, values, label = 'Aktivitas' }) {
    return (
        <div className="h-64">
            <Line
                role="img"
                aria-label="Grafik aktivitas pembelajaran 7 hari terakhir"
                data={{
                    labels,
                    datasets: [
                        {
                            label,
                            data: values,
                            borderColor: '#1f7159',
                            backgroundColor: 'rgba(31,113,89,0.12)',
                            fill: true,
                            tension: 0.35,
                            pointRadius: 3,
                            pointBackgroundColor: '#1f7159',
                        },
                    ],
                }}
                options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: 'rgba(18,38,31,0.08)' } },
                        x: { grid: { display: false } },
                    },
                }}
            />
        </div>
    );
}

const DONUT_COLORS = ['#1f7159', '#78c6a8', '#c9962b', '#cbd5d1'];

export function DonutChart({ labels, values }) {
    const total = values.reduce((a, b) => a + b, 0);

    if (total === 0) {
        return <p className="py-10 text-center text-sm text-ink/60">Belum ada data pengumpulan tugas.</p>;
    }

    return (
        <div className="h-64">
            <Doughnut
                role="img"
                aria-label="Grafik statistik pengumpulan tugas"
                data={{ labels, datasets: [{ data: values, backgroundColor: DONUT_COLORS, borderWidth: 0 }] }}
                options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '62%',
                    plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, boxHeight: 10, padding: 12 } } },
                }}
            />
        </div>
    );
}
