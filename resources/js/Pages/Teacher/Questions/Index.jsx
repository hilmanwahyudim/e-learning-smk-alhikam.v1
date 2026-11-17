import { router, useForm } from '@inertiajs/react';
import { CheckCircle2, Database, Edit2, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import DataTable from '../../../Components/DataTable';
import Modal from '../../../Components/Modal';
import { Badge, Card, PageHeader } from '../../../Components/ui';
import AppLayout from '../../../Layouts/AppLayout';
import { confirmAction } from '../../../lib/swal';

export default function Index({ questions, subjects, filters }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState(null);

    const defaultOptions = [
        { body: '', is_correct: true },
        { body: '', is_correct: false },
        { body: '', is_correct: false },
        { body: '', is_correct: false },
        { body: '', is_correct: false },
    ];

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        subject_id: subjects[0]?.id || '',
        type: 'multiple_choice',
        body: '',
        default_points: 10,
        explanation: '',
        answer_key: '',
        options: defaultOptions,
    });

    const handleFilterChange = (key, value) => {
        router.get(
            '/teacher/questions',
            { ...filters, [key]: value },
            { preserveState: true, replace: true }
        );
    };

    const openCreateModal = () => {
        setEditingQuestion(null);
        setData({
            subject_id: filters.subject_id !== 'all' ? filters.subject_id : (subjects[0]?.id || ''),
            type: 'multiple_choice',
            body: '',
            default_points: 10,
            explanation: '',
            answer_key: '',
            options: defaultOptions,
        });
        clearErrors();
        setModalOpen(true);
    };

    const openEditModal = (q) => {
        setEditingQuestion(q);
        const opts = q.options?.length > 0
            ? q.options.map((o) => ({ body: o.body, is_correct: o.is_correct }))
            : defaultOptions;

        setData({
            subject_id: q.subject_id,
            type: q.type,
            body: q.body,
            default_points: q.default_points,
            explanation: q.explanation || '',
            answer_key: q.answer_key || '',
            options: opts,
        });
        clearErrors();
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingQuestion(null);
        reset();
        clearErrors();
    };

    const handleOptionTextChange = (index, text) => {
        const next = [...data.options];
        next[index].body = text;
        setData('options', next);
    };

    const handleCorrectOptionChange = (index) => {
        const next = data.options.map((opt, i) => ({
            ...opt,
            is_correct: i === index,
        }));
        setData('options', next);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingQuestion) {
            put(`/teacher/questions/${editingQuestion.id}`, {
                onSuccess: () => closeModal(),
            });
        } else {
            post('/teacher/questions', {
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = async (q) => {
        const confirmed = await confirmAction({
            title: 'Hapus Butir Soal?',
            text: 'Soal akan dihapus dari bank soal.',
            confirmText: 'Ya, hapus',
            danger: true,
        });

        if (confirmed) {
            router.delete(`/teacher/questions/${q.id}`);
        }
    };

    const typeBadges = {
        multiple_choice: { label: 'Pilihan Ganda', tone: 'info' },
        true_false: { label: 'Benar / Salah', tone: 'neutral' },
        short_answer: { label: 'Isian Singkat', tone: 'warning' },
        essay: { label: 'Uraian / Essay', tone: 'danger' },
    };

    const columns = [
        {
            key: 'type',
            label: 'Tipe',
            render: (row) => {
                const conf = typeBadges[row.type] || { label: row.type, tone: 'neutral' };
                return <Badge tone={conf.tone}>{conf.label}</Badge>;
            },
        },
        {
            key: 'body',
            label: 'Butir Soal',
            render: (row) => (
                <div>
                    <p className="font-medium text-brand-950 line-clamp-2">{row.body}</p>
                    <span className="text-xs text-ink/60">
                        {row.subject?.name} • Poin: {row.default_points}
                    </span>
                    {row.type === 'multiple_choice' && (
                        <div className="mt-1 flex flex-wrap gap-2 text-xs">
                            {row.options?.map((o) => (
                                <span
                                    key={o.id}
                                    className={`rounded px-1.5 py-0.5 text-[11px] ${
                                        o.is_correct ? 'bg-brand-100 font-bold text-brand-800' : 'bg-ink/5 text-ink/70'
                                    }`}
                                >
                                    {o.label}. {o.body}
                                </span>
                            ))}
                        </div>
                    )}
                    {row.type === 'short_answer' && row.answer_key && (
                        <p className="text-xs text-brand-700 font-semibold mt-0.5">
                            Kunci: {row.answer_key}
                        </p>
                    )}
                </div>
            ),
        },
        {
            key: 'subject',
            label: 'Mata Pelajaran',
            render: (row) => <span className="text-xs text-ink/80">{row.subject?.name}</span>,
        },
        {
            key: 'actions',
            label: 'Aksi',
            render: (row) => (
                <div className="flex items-center gap-1.5">
                    <button
                        type="button"
                        onClick={() => openEditModal(row)}
                        title="Edit Soal"
                        className="grid size-8 place-items-center rounded-lg text-ink/70 hover:bg-brand-50 hover:text-brand-700 transition"
                    >
                        <Edit2 size={16} />
                    </button>
                    <button
                        type="button"
                        onClick={() => handleDelete(row)}
                        title="Hapus Soal"
                        className="grid size-8 place-items-center rounded-lg text-red-600 hover:bg-red-50 transition"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <AppLayout title="Bank Soal">
            <PageHeader
                title="Bank Soal"
                subtitle="Kelola bank soal pilihan ganda, benar/salah, isian singkat, dan essay."
            >
                <button
                    type="button"
                    onClick={openCreateModal}
                    disabled={subjects.length === 0}
                    className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 transition disabled:opacity-50"
                >
                    <Plus size={18} />
                    <span>Tambah Soal Baru</span>
                </button>
            </PageHeader>

            {/* Filter Bar */}
            <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-ink/10 bg-white p-4">
                <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-ink/70">Mata Pelajaran:</label>
                    <select
                        value={filters.subject_id}
                        onChange={(e) => handleFilterChange('subject_id', e.target.value)}
                        className="rounded-lg border border-ink/20 px-3 py-1.5 text-xs focus:border-brand-500 focus:outline-none"
                    >
                        <option value="all">Semua Mapel</option>
                        {subjects.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-ink/70">Tipe Soal:</label>
                    <select
                        value={filters.type}
                        onChange={(e) => handleFilterChange('type', e.target.value)}
                        className="rounded-lg border border-ink/20 px-3 py-1.5 text-xs focus:border-brand-500 focus:outline-none"
                    >
                        <option value="all">Semua Tipe</option>
                        <option value="multiple_choice">Pilihan Ganda</option>
                        <option value="true_false">Benar / Salah</option>
                        <option value="short_answer">Isian Singkat</option>
                        <option value="essay">Essay / Uraian</option>
                    </select>
                </div>
            </div>

            <Card padded={false}>
                <DataTable
                    columns={columns}
                    rows={questions}
                    searchKeys={['body', 'subject.name', 'type']}
                    pageSize={10}
                    emptyTitle="Belum ada soal di bank soal"
                    emptyText="Klik Tambah Soal Baru untuk mulai merancang pertanyaan."
                />
            </Card>

            <Modal
                open={modalOpen}
                onClose={closeModal}
                title={editingQuestion ? 'Edit Butir Soal' : 'Tambah Soal ke Bank Soal'}
                footer={
                    <>
                        <button
                            type="button"
                            onClick={closeModal}
                            disabled={processing}
                            className="rounded-lg border border-ink/20 px-4 py-2 text-sm font-medium text-ink/80 hover:bg-ink/5"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={processing}
                            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
                        >
                            {processing ? 'Menyimpan…' : editingQuestion ? 'Perbarui Soal' : 'Simpan ke Bank Soal'}
                        </button>
                    </>
                }
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-semibold text-brand-950 mb-1">Mata Pelajaran</label>
                            <select
                                value={data.subject_id}
                                onChange={(e) => setData('subject_id', e.target.value)}
                                className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                                required
                            >
                                {subjects.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name} ({s.code})
                                    </option>
                                ))}
                            </select>
                            {errors.subject_id && <p className="mt-1 text-xs text-red-600">{errors.subject_id}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-brand-950 mb-1">Tipe Soal</label>
                            <select
                                value={data.type}
                                onChange={(e) => setData('type', e.target.value)}
                                className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                                required
                            >
                                <option value="multiple_choice">Pilihan Ganda</option>
                                <option value="true_false">Benar / Salah</option>
                                <option value="short_answer">Isian Singkat</option>
                                <option value="essay">Uraian / Essay</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-brand-950 mb-1">Isi Pertanyaan / Soal</label>
                        <textarea
                            value={data.body}
                            onChange={(e) => setData('body', e.target.value)}
                            rows={3}
                            placeholder="Tuliskan butir soal di sini..."
                            className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                            required
                        />
                        {errors.body && <p className="mt-1 text-xs text-red-600">{errors.body}</p>}
                    </div>

                    {/* Form Pilihan Ganda */}
                    {data.type === 'multiple_choice' && (
                        <div className="space-y-2 border-t border-ink/10 pt-3">
                            <label className="block text-xs font-bold uppercase tracking-wider text-ink/70">
                                Pilihan Jawaban & Kunci Benar
                            </label>
                            {['A', 'B', 'C', 'D', 'E'].map((letter, idx) => (
                                <div key={letter} className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="correct_option"
                                        checked={data.options[idx]?.is_correct ?? false}
                                        onChange={() => handleCorrectOptionChange(idx)}
                                        title={`Tandai ${letter} sebagai jawaban benar`}
                                        className="size-4 text-brand-600 focus:ring-brand-500"
                                    />
                                    <span className="font-bold text-xs text-ink/70 w-4">{letter}.</span>
                                    <input
                                        type="text"
                                        value={data.options[idx]?.body || ''}
                                        onChange={(e) => handleOptionTextChange(idx, e.target.value)}
                                        placeholder={`Pilihan ${letter}`}
                                        className="w-full rounded-lg border border-ink/20 px-3 py-1.5 text-xs focus:border-brand-500 focus:outline-none"
                                        required={idx < 2}
                                    />
                                </div>
                            ))}
                            <p className="text-[11px] text-ink/50">Klik bulatan radio di sebelah kiri untuk menentukan kunci jawaban yang benar.</p>
                        </div>
                    )}

                    {/* Form Benar / Salah */}
                    {data.type === 'true_false' && (
                        <div className="space-y-2 border-t border-ink/10 pt-3">
                            <label className="block text-xs font-bold uppercase tracking-wider text-ink/70">
                                Kunci Jawaban
                            </label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="tf_correct"
                                        checked={data.options[0]?.is_correct ?? true}
                                        onChange={() => {
                                            const next = [
                                                { body: 'Benar', is_correct: true },
                                                { body: 'Salah', is_correct: false },
                                            ];
                                            setData('options', next);
                                        }}
                                        className="size-4 text-brand-600 focus:ring-brand-500"
                                    />
                                    <span className="text-sm font-semibold text-brand-950">Pernyataan Benar</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="tf_correct"
                                        checked={data.options[1]?.is_correct ?? false}
                                        onChange={() => {
                                            const next = [
                                                { body: 'Benar', is_correct: false },
                                                { body: 'Salah', is_correct: true },
                                            ];
                                            setData('options', next);
                                        }}
                                        className="size-4 text-brand-600 focus:ring-brand-500"
                                    />
                                    <span className="text-sm font-semibold text-brand-950">Pernyataan Salah</span>
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Form Isian Singkat */}
                    {data.type === 'short_answer' && (
                        <div className="border-t border-ink/10 pt-3">
                            <label className="block text-sm font-semibold text-brand-950 mb-1">Kunci Jawaban Teks</label>
                            <input
                                type="text"
                                value={data.answer_key}
                                onChange={(e) => setData('answer_key', e.target.value)}
                                placeholder="Contoh: Router, 192.168.1.1, HTML"
                                className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                                required
                            />
                            <p className="mt-1 text-[11px] text-ink/50">Pencocokan jawaban siswa bersifat tidak sensitif huruf besar/kecil (case-insensitive).</p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 border-t border-ink/10 pt-3">
                        <div>
                            <label className="block text-sm font-semibold text-brand-950 mb-1">Bobot Poin Default</label>
                            <input
                                type="number"
                                min={1}
                                max={100}
                                value={data.default_points}
                                onChange={(e) => setData('default_points', parseFloat(e.target.value) || 10)}
                                className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-brand-950 mb-1">Pembahasan / Catatan (Opsional)</label>
                            <input
                                type="text"
                                value={data.explanation}
                                onChange={(e) => setData('explanation', e.target.value)}
                                placeholder="Penjelasan jawaban benar..."
                                className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                            />
                        </div>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
