// src/pages/LoansPage.tsx
import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
    getLoans,
    createLoan,
    deleteLoan,
    updateLoan,
    type CreateLoanPayload,
} from '../api/loansApi';
import { getBooks } from '../api/booksApi';
import { getPatrons } from '../api/patronsApi';
import type { Loan } from '../types/loan';
import type { Book } from '../types/book';
import type { Patron } from '../types/patron';
import { isAdmin, isLoggedIn } from '../auth/auth';

export function LoansPage() {
    const [loans, setLoans] = useState<Loan[]>([]);
    const [books, setBooks] = useState<Book[]>([]);
    const [patrons, setPatrons] = useState<Patron[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
    const [page, setPage] = useState(1);
    const pageSize = 10;

    const [bookSearch, setBookSearch] = useState('');
    const [patronSearch, setPatronSearch] = useState('');
    const [formBookId, setFormBookId] = useState<number | ''>('');
    const [formPatronId, setFormPatronId] = useState<number | ''>('');
    const [formDueDate, setFormDueDate] = useState('');
    const [formLoanDate, setFormLoanDate] = useState('');

    const authed = isLoggedIn();
    const admin = isAdmin();

    async function loadLoans() {
        if (!admin) return;
        try {
            setIsLoading(true);
            setError(null);
            const data = await getLoans();
            setLoans(data);
        } catch (err: unknown) {
            console.error('Error loading loans:', err);
            if (axios.isAxiosError(err)) {
                setError(
                    `Could not load loans. ${err.message}${
                        err.response ? ` (status ${err.response.status})` : ''
                    }`
                );
            } else {
                setError('Could not load loans.');
            }
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (!admin) return;
        loadLoans();
        loadOptions();
    }, [admin]);

    async function loadOptions() {
        try {
            const [bookData, patronData] = await Promise.all([
                getBooks(),
                getPatrons(),
            ]);
            setBooks(bookData);
            setPatrons(patronData);
        } catch (err) {
            console.warn('Failed to load books/patrons for loan form', err);
        }
    }

    async function handleCreateLoan(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!formBookId || !formPatronId || !formDueDate) return;
        const payload: CreateLoanPayload = {
            book_id: Number(formBookId),
            patron_id: Number(formPatronId),
            loaned_at: formLoanDate || new Date().toISOString().split('T')[0],
            due_at: formDueDate,
        };
        try {
            setIsSubmitting(true);
            setError(null);
            await createLoan(payload);
            setFormBookId('');
            setFormPatronId('');
            setFormDueDate('');
            setFormLoanDate('');
            await loadLoans();
        } catch (err: unknown) {
            console.error('Error creating loan:', err);
            if (axios.isAxiosError(err)) {
                setError(
                    `Could not create loan. ${
                        err.response?.data?.message ?? err.message
                    }${err.response ? ` (status ${err.response.status})` : ''}`
                );
            } else {
                setError('Could not create loan.');
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleReturn(id: number) {
        if (!window.confirm('Are you sure you want to return this book now?')) return;
        try {
            setDeletingId(id);
            setError(null);
            // Backend deletes loan and frees the book
            await deleteLoan(id);
            await loadLoans();
        } catch (err: unknown) {
            console.error('Error returning loan:', err);
            if (axios.isAxiosError(err)) {
                setError(
                    `Could not return loan. ${
                        err.response?.data?.message ?? err.message
                    }${err.response ? ` (status ${err.response.status})` : ''}`
                );
            } else {
                setError('Could not return loan.');
            }
        } finally {
            setDeletingId(null);
        }
    }

    async function handleDelete(id: number) {
        if (
            !window.confirm(
                'Delete this loan and mark the book as lost? This cannot be undone.'
            )
        )
            return;
        try {
            setDeletingId(id);
            setError(null);
            await updateLoan(id, { status: 'lost' });
            await loadLoans();
        } catch (err: unknown) {
            console.error('Error deleting loan:', err);
            if (axios.isAxiosError(err)) {
                setError(
                    `Could not delete loan. ${
                        err.response?.data?.message ?? err.message
                    }${
                        err.response ? ` (status ${err.response.status})` : ''
                    }`
                );
            } else {
                setError('Could not delete loan.');
            }
        } finally {
            setDeletingId(null);
        }
    }

    const filteredBooks = useMemo(() => {
        const term = bookSearch.toLowerCase();
        return books
            .filter((b) => !b.status || b.status === 'available')
            .filter((b) => b.title.toLowerCase().includes(term));
    }, [bookSearch, books]);

    const filteredPatrons = useMemo(() => {
        const term = patronSearch.toLowerCase();
        return patrons.filter((p) => p.name.toLowerCase().includes(term));
    }, [patronSearch, patrons]);

    const totalPages = Math.max(1, Math.ceil(loans.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    const paginatedLoans = loans.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    if (!authed || !admin) {
        return (
            <div className="mx-auto max-w-3xl text-center text-sm text-slate-700">
                You must be an admin to view loans.
            </div>
        );
    }

    return (
        <div className="space-y-4 text-base leading-relaxed text-slate-900">
            <div className="space-y-1">
                <h1 className="text-2xl font-semibold text-brand-primary">Loans</h1>
                <p className="text-sm text-slate-600">All current and past loans.</p>
            </div>

            <form
                onSubmit={handleCreateLoan}
                className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-brand-primary">Create a loan</h2>
                    <span className="text-[11px] font-medium text-slate-500">Admin tools</span>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                    <div className="space-y-1">
                        <input
                            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                            placeholder="Search books..."
                            value={bookSearch}
                            onChange={(e) => setBookSearch(e.target.value)}
                        />
                        <select
                            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                            value={formBookId}
                            onChange={(e) => setFormBookId(Number(e.target.value))}
                            required
                        >
                            <option value="">Select a book</option>
                            {filteredBooks.map((book) => (
                                <option key={book.id} value={book.id}>
                                    {book.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1">
                        <input
                            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                            placeholder="Search patrons..."
                            value={patronSearch}
                            onChange={(e) => setPatronSearch(e.target.value)}
                        />
                        <select
                            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                            value={formPatronId}
                            onChange={(e) => setFormPatronId(Number(e.target.value))}
                            required
                        >
                            <option value="">Select a patron</option>
                            {filteredPatrons.map((patron) => (
                                <option key={patron.id} value={patron.id}>
                                    {patron.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-700">Due date *</label>
                        <input
                            type="date"
                            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                            value={formDueDate}
                            onChange={(e) => setFormDueDate(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-700">Loan date</label>
                        <input
                            type="date"
                            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                            value={formLoanDate}
                            onChange={(e) => setFormLoanDate(e.target.value)}
                            placeholder="Defaults to today"
                        />
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded bg-brand-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-secondary disabled:opacity-60"
                >
                    {isSubmitting ? 'Creating...' : 'Create loan'}
                </button>
            </form>

            {isLoading && (
                <p className="text-sm text-slate-600">Loading loans...</p>
            )}

            {error && <p className="text-sm text-red-600 whitespace-pre-wrap">{error}</p>}

            {!isLoading && !error && loans.length === 0 && (
                <p className="text-sm text-slate-600">No loans found.</p>
            )}

            {!isLoading && !error && loans.length > 0 && (
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <table className="min-w-full divide-y divide-slate-200 text-sm">
                        <thead className="bg-brand-tertiary/30 text-left font-semibold text-brand-primary">
                            <tr>
                                <th className="px-4 py-2">Book</th>
                                <th className="px-4 py-2">Patron</th>
                                <th className="px-4 py-2">Loan date</th>
                                <th className="px-4 py-2">Due date</th>
                                <th className="px-4 py-2 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {paginatedLoans.map((loan) => {
                                const bookTitle =
                                    loan.book?.title ??
                                    books.find((b) => b.id === loan.book_id)?.title ??
                                    `Book #${loan.book_id}`;
                                const patronName =
                                    loan.patron?.name ??
                                    patrons.find((p) => p.id === loan.patron_id)?.name ??
                                    `Patron #${loan.patron_id}`;

                                return (
                                <tr key={loan.id}>
                                    <td className="px-4 py-2">
                                        {bookTitle}
                                    </td>
                                    <td className="px-4 py-2">
                                        {patronName}
                                    </td>
                                    <td className="px-4 py-2">
                                        {loan.loaned_at
                                            ? new Date(loan.loaned_at).toLocaleDateString()
                                            : loan.loan_date
                                              ? new Date(loan.loan_date).toLocaleDateString()
                                              : '—'}
                                    </td>
                                    <td className="px-4 py-2">
                                        {loan.due_at
                                            ? new Date(loan.due_at).toLocaleDateString()
                                            : loan.due_date
                                              ? new Date(loan.due_date).toLocaleDateString()
                                              : '—'}
                                    </td>
                                    <td className="px-4 py-2 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedLoan(loan)}
                                                className="rounded border border-slate-300 px-2 py-1 text-xs text-brand-primary hover:bg-slate-50"
                                            >
                                                View
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleReturn(loan.id)}
                                                disabled={deletingId === loan.id}
                                                className="rounded border border-slate-300 px-2 py-1 text-xs text-brand-primary hover:bg-slate-50 disabled:opacity-60"
                                            >
                                                {deletingId === loan.id ? 'Working...' : 'Return'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(loan.id)}
                                                disabled={deletingId === loan.id}
                                                className="rounded border border-red-300 px-2 py-1 text-xs text-red-700 hover:bg-red-50 disabled:opacity-60"
                                            >
                                                {deletingId === loan.id ? 'Working...' : 'Delete'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                    {totalPages > 1 && (
                        <div className="mt-4 flex items-center justify-between text-sm text-slate-700">
                            <button
                                type="button"
                                disabled={currentPage === 1}
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                className="rounded border border-slate-300 px-3 py-1 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <span>
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                type="button"
                                disabled={currentPage === totalPages}
                                onClick={() =>
                                    setPage((p) => Math.min(totalPages, p + 1))
                                }
                                className="rounded border border-slate-300 px-3 py-1 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            )}

            {selectedLoan && (
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-brand-primary">
                            Loan details
                        </h2>
                        <button
                            type="button"
                            onClick={() => setSelectedLoan(null)}
                            className="text-xs text-slate-600 hover:text-slate-800"
                        >
                            Close
                        </button>
                    </div>
                    <dl className="mt-3 grid gap-2 text-sm text-slate-700 md:grid-cols-2">
                        <div>
                            <dt className="font-medium text-slate-600">Book</dt>
                            <dd>{selectedLoan.book?.title ?? `Book #${selectedLoan.book_id}`}</dd>
                        </div>
                        <div>
                            <dt className="font-medium text-slate-600">Patron</dt>
                            <dd>
                                {selectedLoan.patron?.name ?? `Patron #${selectedLoan.patron_id}`}
                            </dd>
                        </div>
                        <div>
                            <dt className="font-medium text-slate-600">Loan date</dt>
                            <dd>
                                {selectedLoan.loan_date
                                    ? new Date(selectedLoan.loan_date).toLocaleDateString()
                                    : '—'}
                            </dd>
                        </div>
                        <div>
                            <dt className="font-medium text-slate-600">Due date</dt>
                            <dd>
                                {selectedLoan.due_date
                                    ? new Date(selectedLoan.due_date).toLocaleDateString()
                                    : '—'}
                            </dd>
                        </div>
                        <div>
                            <dt className="font-medium text-slate-600">Return date</dt>
                            <dd>
                                {selectedLoan.return_date
                                    ? new Date(selectedLoan.return_date).toLocaleDateString()
                                    : selectedLoan.returned_at
                                      ? new Date(selectedLoan.returned_at).toLocaleDateString()
                                      : '—'}
                            </dd>
                        </div>
                    </dl>
                </div>
            )}
        </div>
    );
}
