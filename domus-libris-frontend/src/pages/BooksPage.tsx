// src/pages/BooksPage.tsx
import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import axios from 'axios';
import {
    getBooks,
    createBook,
    updateBook,
    deleteBook,
    type CreateBookPayload,
    type UpdateBookPayload,
} from '../api/booksApi';
import type { Book } from '../types/book';
import { isAdmin } from '../auth/auth';
import { StatusTag, type BookStatus } from '../components/Books/StatusTag';

const GENRES = [
    'Fiction',
    'Non-fiction',
    'Mystery',
    'Fantasy',
    'Science Fiction',
    'Historical',
    'Romance',
    'Biography',
    'Self-Help',
    'Poetry',
];

const STATUS_OPTIONS: BookStatus[] = ['available', 'loaned', 'reserved', 'lost', 'missing'];

export function BooksPage() {
    const admin = isAdmin();

    const [books, setBooks] = useState<Book[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [search, setSearch] = useState('');

    const [editingBook, setEditingBook] = useState<Book | null>(null);
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [isbn, setIsbn] = useState('');
    const [year, setYear] = useState('');
    const [genre, setGenre] = useState('');
    const [collection, setCollection] = useState('');
    const [location, setLocation] = useState('');
    const [status, setStatus] = useState<BookStatus>('available');

    const [formError, setFormError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);

    const [page, setPage] = useState(1);
    const pageSize = 10;

    useEffect(() => {
        loadBooks();
    }, []);

    useEffect(() => {
        setPage(1);
    }, [books, search]);

    async function loadBooks() {
        try {
            setIsLoading(true);
            setError(null);
            // Fetch all books so client-side pagination/search can operate on the full list.
            const data = await getBooks({ per_page: 'all' });
            setBooks(data);
        } catch (err: unknown) {
            console.error('Error loading books:', err);
            if (axios.isAxiosError(err)) {
                setError(
                    `Could not load books. ${
                        err.response?.data?.message ?? err.message
                    }${err.response ? ` (status ${err.response.status})` : ''}`
                );
            } else {
                setError('Could not load books.');
            }
        } finally {
            setIsLoading(false);
        }
    }

    function resetForm() {
        setEditingBook(null);
        setTitle('');
        setAuthor('');
        setIsbn('');
        setYear('');
        setGenre('');
        setCollection('');
        setLocation('');
        setStatus('available');
        setFormError(null);
    }

    function startEdit(book: Book) {
        if (!admin || isSubmitting || deletingId) return;
        setEditingBook(book);
        setTitle(book.title);
        setAuthor(book.author);
        setIsbn(book.isbn);
        setYear(book.year ? String(book.year) : '');
        setGenre(book.genre ?? '');
        setCollection(book.collection ?? '');
        setLocation(book.location ?? '');
        setStatus(normalizeStatus(book.status) ?? 'available');
    }

    function normalizeStatus(raw?: string | null): BookStatus | null {
        const value = raw?.toLowerCase();
        if (!value) return null;
        if (STATUS_OPTIONS.includes(value as BookStatus)) {
            return value as BookStatus;
        }
        return null;
    }

    function validateIsbn(raw: string): string | null {
        const digits = raw.replace(/[-\s]/g, '');
        const isbnPattern = /^(?:\d{10}|\d{13})$/;
        if (!isbnPattern.test(digits)) {
            return null;
        }
        return digits;
    }

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const normalizedIsbn = validateIsbn(isbn);
        if (!normalizedIsbn) {
            setFormError('ISBN must be 10 or 13 digits (numbers only).');
            return;
        }

        const payloadBase: CreateBookPayload = {
            title,
            author,
            isbn: normalizedIsbn,
            year: year ? Number(year) : null,
            genre,
            collection: collection || undefined,
            location: location || undefined,
        };

        try {
            setIsSubmitting(true);
            setFormError(null);

            if (editingBook) {
                const updatePayload: UpdateBookPayload & { status?: string } = {
                    ...payloadBase,
                    status,
                };
                await updateBook(editingBook.id, updatePayload as UpdateBookPayload);
            } else {
                await createBook(payloadBase);
            }

            resetForm();
            await loadBooks();
        } catch (err: unknown) {
            console.error('Error saving book:', err);
            if (axios.isAxiosError(err)) {
                setFormError(
                    `Could not save book. ${
                        err.response?.data?.message ?? err.message
                    }${err.response ? ` (status ${err.response.status})` : ''}`
                );
            } else {
                setFormError('Could not save book.');
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleDelete(id: number) {
        if (!admin) return;
        if (!window.confirm('Are you sure you want to delete this book?')) return;
        try {
            setDeletingId(id);
            setError(null);
            await deleteBook(id);
            await loadBooks();
        } catch (err: unknown) {
            console.error('Error deleting book:', err);
            if (axios.isAxiosError(err)) {
                setError(
                    `Could not delete book. ${
                        err.response?.data?.message ?? err.message
                    }${err.response ? ` (status ${err.response.status})` : ''}`
                );
            } else {
                setError('Could not delete book.');
            }
        } finally {
            setDeletingId(null);
        }
    }

    const filteredBooks = useMemo(() => {
        const term = search.toLowerCase();
        return books.filter((book) => {
            const matchesTerm =
                book.title.toLowerCase().includes(term) ||
                book.author.toLowerCase().includes(term);
            return matchesTerm;
        });
    }, [books, search]);

    const totalPages = Math.max(1, Math.ceil(filteredBooks.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    const paginatedBooks = filteredBooks.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    const emptyStateMessage =
        books.length === 0
            ? 'No books have been added yet.'
            : filteredBooks.length === 0
              ? 'No books match your search.'
              : '';

    return (
        <main className="mx-auto max-w-5xl space-y-4 px-4 py-6 text-base leading-relaxed text-slate-900">
            <div className="space-y-1">
                <h1 className="text-2xl font-semibold text-brand-primary">Books</h1>
                <p className="text-sm text-slate-600">
                    Browse, add, and manage books in the catalog.
                </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <input
                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm sm:max-w-sm"
                    placeholder="Search by title or author..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <span className="text-xs text-slate-600">
                    Showing {filteredBooks.length} of {books.length} books
                </span>
            </div>

            {admin && (
                <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <h2 className="text-sm font-semibold text-brand-primary">
                                {editingBook
                                    ? `Edit book: ${editingBook.title}`
                                    : 'Add new book'}
                            </h2>
                            {editingBook && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="text-xs text-slate-600 hover:text-slate-800"
                                >
                                    Cancel edit
                                </button>
                            )}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-3">
                        <div className="grid gap-3 md:grid-cols-2">
                            <div className="space-y-1">
                                <label
                                    className="block text-xs font-medium text-slate-700"
                                    htmlFor="book-title"
                                >
                                    Title
                                </label>
                                <input
                                    id="book-title"
                                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label
                                    className="block text-xs font-medium text-slate-700"
                                    htmlFor="book-author"
                                >
                                    Author
                                </label>
                                <input
                                    id="book-author"
                                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                                    value={author}
                                    onChange={(e) => setAuthor(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label
                                    className="block text-xs font-medium text-slate-700"
                                    htmlFor="book-isbn"
                                >
                                    ISBN
                                </label>
                                <input
                                    id="book-isbn"
                                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                                    value={isbn}
                                    onChange={(e) => setIsbn(e.target.value)}
                                    placeholder="10 or 13 digits"
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label
                                    className="block text-xs font-medium text-slate-700"
                                    htmlFor="book-year"
                                >
                                    Year
                                </label>
                                <input
                                    id="book-year"
                                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                                    value={year}
                                    onChange={(e) => setYear(e.target.value)}
                                    placeholder="Optional"
                                />
                            </div>
                            <div className="space-y-1">
                                <label
                                    className="block text-xs font-medium text-slate-700"
                                    htmlFor="book-genre"
                                >
                                    Genre
                                </label>
                                <select
                                    id="book-genre"
                                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                                    value={genre}
                                    onChange={(e) => setGenre(e.target.value)}
                                >
                                    <option value="">Select genre</option>
                                    {GENRES.map((g) => (
                                        <option key={g} value={g}>
                                            {g}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label
                                    className="block text-xs font-medium text-slate-700"
                                    htmlFor="book-collection"
                                >
                                    Collection
                                </label>
                                <input
                                    id="book-collection"
                                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                                    value={collection}
                                    onChange={(e) => setCollection(e.target.value)}
                                    placeholder="Optional"
                                />
                            </div>
                            <div className="space-y-1">
                                <label
                                    className="block text-xs font-medium text-slate-700"
                                    htmlFor="book-location"
                                >
                                    Location
                                </label>
                                <input
                                    id="book-location"
                                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="Optional"
                                />
                            </div>
                            <div className="space-y-1">
                                <label
                                    className="block text-xs font-medium text-slate-700"
                                    htmlFor="book-status"
                                >
                                    Status
                                </label>
                                <select
                                    id="book-status"
                                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value as BookStatus)}
                                >
                                    {STATUS_OPTIONS.map((option) => (
                                        <option key={option} value={option}>
                                            {option.charAt(0).toUpperCase() + option.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {formError && (
                            <p className="text-sm text-red-600 whitespace-pre-wrap">{formError}</p>
                        )}

                        <div className="flex flex-wrap gap-2">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="rounded bg-brand-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-secondary disabled:opacity-60"
                            >
                                {isSubmitting
                                    ? editingBook
                                        ? 'Saving...'
                                        : 'Creating...'
                                    : editingBook
                                      ? 'Save changes'
                                      : 'Add book'}
                            </button>
                            {editingBook && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="rounded border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                >
                                    Cancel edit
                                </button>
                            )}
                        </div>
                    </form>
                </section>
            )}

            {isLoading && (
                <p className="text-sm text-slate-600">Loading books...</p>
            )}

            {error && <p className="text-sm text-red-600 whitespace-pre-wrap">{error}</p>}

            {!isLoading && !error && (
                <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="mb-2 flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-brand-primary">All books</h2>
                        <span className="text-xs text-slate-600">
                            Showing {filteredBooks.length} of {books.length} books
                        </span>
                    </div>
                    {filteredBooks.length === 0 ? (
                        <p className="mt-3 text-sm text-slate-600">{emptyStateMessage}</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 text-sm">
                                <thead className="bg-brand-tertiary/30 text-left font-semibold text-brand-primary">
                                    <tr>
                                        <th scope="col" className="px-4 py-2">
                                            Title
                                        </th>
                                        <th scope="col" className="px-4 py-2">
                                            Author
                                        </th>
                                        <th scope="col" className="px-4 py-2">
                                            Year
                                        </th>
                                        <th scope="col" className="px-4 py-2">
                                            ISBN
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
                                    {paginatedBooks.map((book) => {
                                        const normalized = normalizeStatus(book.status);
                                        return (
                                            <tr key={book.id}>
                                                <td className="px-4 py-2">{book.title}</td>
                                                <td className="px-4 py-2">{book.author}</td>
                                                <td className="px-4 py-2">
                                                    {book.year ?? '—'}
                                                </td>
                                                <td className="px-4 py-2">{book.isbn}</td>
                                                <td className="px-4 py-2">
                                                    {normalized ? (
                                                        <StatusTag status={normalized} />
                                                    ) : (
                                                        <span className="text-xs text-slate-600">
                                                            Unknown
                                                        </span>
                                                    )}
                                                </td>
                                                {admin ? (
                                                    <td className="px-4 py-2 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => setSelectedBook(book)}
                                                                className="rounded border border-slate-300 px-2 py-1 text-xs text-brand-primary hover:bg-slate-50"
                                                                aria-label={`View book ${book.title}`}
                                                            >
                                                                View
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => startEdit(book)}
                                                                className="rounded border border-slate-300 px-2 py-1 text-xs text-brand-primary hover:bg-slate-50"
                                                                aria-label={`Edit book ${book.title}`}
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDelete(book.id)}
                                                                disabled={deletingId === book.id}
                                                                className="rounded border border-red-300 px-2 py-1 text-xs text-red-700 hover:bg-red-50 disabled:opacity-60"
                                                                aria-label={`Delete book ${book.title}`}
                                                            >
                                                                {deletingId === book.id
                                                                    ? 'Deleting...'
                                                                    : 'Delete'}
                                                            </button>
                                                        </div>
                                                    </td>
                                                ) : (
                                                    <td className="px-4 py-2 text-right">
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedBook(book)}
                                                            className="rounded border border-slate-300 px-2 py-1 text-xs text-brand-primary hover:bg-slate-50"
                                                            aria-label={`View book ${book.title}`}
                                                        >
                                                            View
                                                        </button>
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
                                    {filteredBooks.length === 0
                                        ? 0
                                        : (currentPage - 1) * pageSize + 1}{' '}
                                    -{' '}
                                    {Math.min(currentPage * pageSize, filteredBooks.length)} of{' '}
                                    {filteredBooks.length} books
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

            {selectedBook && (
                <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-sm font-semibold text-brand-primary">
                                {selectedBook.title}
                            </h2>
                            <p className="text-xs text-slate-600">
                                Detailed information
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setSelectedBook(null)}
                            className="text-xs text-slate-600 hover:text-slate-800"
                        >
                            Close
                        </button>
                    </div>
                    <div className="grid gap-3 text-sm text-slate-700 md:grid-cols-2">
                        <div>
                            <span className="block text-xs font-medium text-slate-600">
                                Author
                            </span>
                            <span>{selectedBook.author}</span>
                        </div>
                        <div>
                            <span className="block text-xs font-medium text-slate-600">
                                ISBN
                            </span>
                            <span>{selectedBook.isbn}</span>
                        </div>
                        <div>
                            <span className="block text-xs font-medium text-slate-600">
                                Year
                            </span>
                            <span>{selectedBook.year ?? '—'}</span>
                        </div>
                        <div>
                            <span className="block text-xs font-medium text-slate-600">
                                Status
                            </span>
                            {normalizeStatus(selectedBook.status) ? (
                                <StatusTag status={normalizeStatus(selectedBook.status)!} />
                            ) : (
                                <span className="text-xs text-slate-600">Unknown</span>
                            )}
                        </div>
                        <div>
                            <span className="block text-xs font-medium text-slate-600">
                                Genre
                            </span>
                            <span>{selectedBook.genre || '—'}</span>
                        </div>
                        <div>
                            <span className="block text-xs font-medium text-slate-600">
                                Collection
                            </span>
                            <span>{selectedBook.collection || '—'}</span>
                        </div>
                        <div>
                            <span className="block text-xs font-medium text-slate-600">
                                Location
                            </span>
                            <span>{selectedBook.location || '—'}</span>
                        </div>
                    </div>
                </section>
            )}
        </main>
    );
}
