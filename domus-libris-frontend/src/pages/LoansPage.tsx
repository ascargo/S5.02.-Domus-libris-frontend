// src/pages/LoansPage.tsx
import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
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
    const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const pageSize = 10;

    const [bookSearch, setBookSearch] = useState('');
    const [patronSearch, setPatronSearch] = useState('');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'ongoing' | 'returned' | 'lost' | 'overdue'>('all');
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
            const data = await getLoans({ per_page: 'all' });
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

    function startEdit(loan: Loan) {
        if (!admin || isSubmitting || deletingId) return;
        setEditingLoan(loan);
        setFormBookId(loan.book_id);
        setFormPatronId(loan.patron_id);
        setFormDueDate(loan.due_at ?? loan.due_date ?? '');
        setFormLoanDate(loan.loaned_at ?? loan.loan_date ?? '');
    }

    function resetForm() {
        setEditingLoan(null);
        setFormBookId('');
        setFormPatronId('');
        setFormDueDate('');
        setFormLoanDate('');
        setFormError(null);
        setSuccessMessage(null);
    }

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
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
            setFormError(null);
            setSuccessMessage(null);
            setError(null);

            if (editingLoan) {
                await updateLoan(editingLoan.id, payload);
                setSuccessMessage('Loan updated successfully.');
            } else {
                await createLoan(payload);
                setSuccessMessage('Loan created successfully.');
            }

            resetForm();
            await loadLoans();
        } catch (err: unknown) {
            console.error('Error creating loan:', err);
            if (axios.isAxiosError(err)) {
                setFormError(
                    `Could not create loan. ${
                        err.response?.data?.message ?? err.message
                    }${err.response ? ` (status ${err.response.status})` : ''}`
                );
            } else {
                setFormError('Could not create loan.');
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
            .filter((b) => (b.status ?? '').toLowerCase() === 'available')
            .filter((b) => b.title.toLowerCase().includes(term));
    }, [bookSearch, books]);

    const filteredPatrons = useMemo(() => {
        const term = patronSearch.toLowerCase();
        return patrons.filter((p) => p.name.toLowerCase().includes(term));
    }, [patronSearch, patrons]);

    const filteredLoans = useMemo(() => {
        const term = search.toLowerCase();
        return loans.filter((loan) => {
            const bookTitle =
                loan.book?.title ??
                books.find((b) => b.id === loan.book_id)?.title ??
                `book #${loan.book_id}`;
            const patronName =
                loan.patron?.name ??
                patrons.find((p) => p.id === loan.patron_id)?.name ??
                `patron #${loan.patron_id}`;

            const matchesTerm =
                bookTitle.toLowerCase().includes(term) ||
                patronName.toLowerCase().includes(term) ||
                String(loan.book_id).includes(term) ||
                String(loan.patron_id).includes(term);

            const loanStatus = (loan.status ?? 'ongoing').toLowerCase();
            const matchesStatus =
                statusFilter === 'all' || loanStatus === statusFilter;

            return matchesTerm && matchesStatus;
        });
    }, [books, loans, patrons, search, statusFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredLoans.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    const paginatedLoans = filteredLoans.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    useEffect(() => {
        setPage(1);
    }, [search, statusFilter, loans]);

    if (!authed || !admin) {
        return (
            <div className="mx-auto max-w-3xl text-center text-sm text-slate-700">
                You must be an admin to view loans.
            </div>
        );
    }

    const emptyStateMessage =
        loans.length === 0
            ? 'No loans have been created yet.'
            : filteredLoans.length === 0
              ? 'No loans match your filters.'
              : '';

    const statusBadge = (status?: string) => {
        const normalized = (status ?? 'ongoing').toLowerCase();
        const base = 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium';
        if (normalized === 'returned') return `${base} bg-brand-tertiary/30 text-brand-primary`;
        if (normalized === 'lost') return `${base} bg-brand-secondary/10 text-brand-secondary`;
        if (normalized === 'overdue') return `${base} bg-brand-softYellow text-brand-primary`;
        return `${base} bg-brand-softGreen text-brand-primary`;
    };

    return (
        <main className="mx-auto max-w-5xl space-y-4 px-4 py-6 text-base leading-relaxed text-slate-900">
            <div className="space-y-1">
                <h1 className="text-2xl font-semibold text-brand-primary">Loans</h1>
                <p className="text-sm text-slate-600">
                    Create, review, and manage book loans.
                </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <input
                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm sm:max-w-sm"
                    placeholder="Search by book or patron..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-600">
                        Showing {filteredLoans.length} of {loans.length} loans
                    </span>
                    <select
                        className="w-36 rounded border border-slate-300 px-3 py-2 text-sm"
                        value={statusFilter}
                        onChange={(e) =>
                            setStatusFilter(e.target.value as typeof statusFilter)
                        }
                    >
                        <option value="all">All statuses</option>
                        <option value="ongoing">Ongoing</option>
                        <option value="returned">Returned</option>
                        <option value="overdue">Overdue</option>
                        <option value="lost">Lost</option>
                    </select>
                </div>
            </div>

            {admin && (
                <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div>
                                <h2 className="text-sm font-semibold text-brand-primary">
                                    {editingLoan
                                        ? `Edit loan #${editingLoan.id}`
                                        : 'Create new loan'}
                                </h2>
                                <p className="text-xs text-slate-600">
                                    Assign a book to a patron and set due date.
                                </p>
                            </div>
                            {editingLoan && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="text-xs text-slate-600 hover:text-slate-800"
                                >
                                    Cancel edit
                                </button>
                            )}
                        </div>
                        <span className="text-[11px] font-medium text-slate-500">
                            Admin tools
                        </span>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-3">
                        <div className="grid gap-3 md:grid-cols-2">
                            <div className="space-y-1">
                                <label
                                    htmlFor="loan-book-search"
                                    className="block text-xs font-medium text-slate-700"
                                >
                                    Search books
                                </label>
                                <input
                                    id="loan-book-search"
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
                                <label
                                    htmlFor="loan-patron-search"
                                    className="block text-xs font-medium text-slate-700"
                                >
                                    Search patrons
                                </label>
                                <input
                                    id="loan-patron-search"
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
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                            <div className="space-y-1">
                                <label
                                    className="block text-xs font-medium text-slate-700"
                                    htmlFor="loan-due-date"
                                >
                                    Due date *
                                </label>
                                <input
                                    id="loan-due-date"
                                    type="date"
                                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                                    value={formDueDate}
                                    onChange={(e) => setFormDueDate(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label
                                    className="block text-xs font-medium text-slate-700"
                                    htmlFor="loan-loaned-at"
                                >
                                    Loan date
                                </label>
                                <input
                                    id="loan-loaned-at"
                                    type="date"
                                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                                    value={formLoanDate}
                                    onChange={(e) => setFormLoanDate(e.target.value)}
                                    placeholder="Defaults to today"
                                />
                            </div>
                        </div>

                        {formError && (
                            <p className="text-sm text-red-600 whitespace-pre-wrap">{formError}</p>
                        )}
                        {successMessage && (
                            <p className="text-sm text-green-700">{successMessage}</p>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="rounded bg-brand-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-secondary disabled:opacity-60"
                        >
                            {isSubmitting
                                ? editingLoan
                                    ? 'Saving...'
                                    : 'Creating...'
                                : editingLoan
                                  ? 'Save changes'
                                  : 'Create loan'}
                        </button>
                    </form>
                </section>
            )}

            {isLoading && (
                <p className="text-sm text-slate-600">Loading loans...</p>
            )}

            {error && <p className="text-sm text-red-600 whitespace-pre-wrap">{error}</p>}

            {isLoading && (
                <p className="text-sm text-slate-600">Loading loans...</p>
            )}

            {error && <p className="text-sm text-red-600 whitespace-pre-wrap">{error}</p>}

            {!isLoading && !error && (
                <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="mb-2 flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-brand-primary">All loans</h2>
                        <span className="text-xs text-slate-600">
                            Showing {filteredLoans.length} of {loans.length} loans
                        </span>
                    </div>
                    {filteredLoans.length === 0 ? (
                        <p className="mt-3 text-sm text-slate-600">{emptyStateMessage}</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 text-sm">
                                <thead className="bg-brand-tertiary/30 text-left font-semibold text-brand-primary">
                                    <tr>
                                        <th scope="col" className="px-4 py-2">
                                            Book
                                        </th>
                                        <th scope="col" className="px-4 py-2">
                                            Patron
                                        </th>
                                        <th scope="col" className="px-4 py-2">
                                            Loan date
                                        </th>
                                        <th scope="col" className="px-4 py-2">
                                            Due date
                                        </th>
                                        <th scope="col" className="px-4 py-2">
                                            Status
                                        </th>
                                        {admin && (
                                            <th scope="col" className="px-4 py-2 text-right">
                                                Actions
                                            </th>
                                        )}
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
                                                <td className="px-4 py-2">{bookTitle}</td>
                                                <td className="px-4 py-2">{patronName}</td>
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
                                                <td className="px-4 py-2">
                                                    <span className={statusBadge(loan.status)}>
                                                        {(loan.status ?? 'ongoing')
                                                            .toString()
                                                            .charAt(0)
                                                            .toUpperCase() +
                                                            (loan.status ?? 'ongoing')
                                                                .toString()
                                                                .slice(1)}
                                                    </span>
                                                </td>
                                                {admin && (
                                                    <td className="px-4 py-2 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => startEdit(loan)}
                                                                className="rounded border border-slate-300 px-2 py-1 text-xs text-brand-primary hover:bg-slate-50"
                                                                aria-label={`Edit loan for ${bookTitle}`}
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleReturn(loan.id)}
                                                                disabled={deletingId === loan.id}
                                                                className="rounded border border-slate-300 px-2 py-1 text-xs text-brand-primary hover:bg-slate-50 disabled:opacity-60"
                                                                aria-label={`Return book ${bookTitle}`}
                                                            >
                                                                {deletingId === loan.id ? 'Working...' : 'Return'}
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDelete(loan.id)}
                                                                disabled={deletingId === loan.id}
                                                                className="rounded border border-red-300 px-2 py-1 text-xs text-red-700 hover:bg-red-50 disabled:opacity-60"
                                                                aria-label={`Delete loan for ${bookTitle}`}
                                                            >
                                                                {deletingId === loan.id ? 'Working...' : 'Delete'}
                                                            </button>
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            <div className="mt-4 flex flex-col gap-2 text-sm text-slate-700 sm:flex-row sm:items-center sm:justify-between">
                                <span>
                                    Showing{' '}
                                    {filteredLoans.length === 0
                                        ? 0
                                        : (currentPage - 1) * pageSize + 1}{' '}
                                    -{' '}
                                    {Math.min(currentPage * pageSize, filteredLoans.length)} of{' '}
                                    {filteredLoans.length} loans
                                </span>
                                <div className="flex items-center gap-2">
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
                                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                        className="rounded border border-slate-300 px-3 py-1 disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </section>
            )}

        </main>
    );
}
