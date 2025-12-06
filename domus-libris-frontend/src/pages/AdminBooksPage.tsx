// src/pages/AdminBooksPage.tsx
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getBooks, createBook, deleteBook } from '../api/booksApi';
import type { Book } from '../types/book';
import { isAdmin, isLoggedIn } from '../auth/auth';
import { StatusTag, type BookStatus } from '../components/Books/StatusTag';

type BookWithStatus = Book & { status?: BookStatus };

export function AdminBooksPage() {
    const navigate = useNavigate();

    const [books, setBooks] = useState<Book[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [isbn, setIsbn] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const admin = isAdmin();
    const loggedIn = isLoggedIn();

    useEffect(() => {
        if (!loggedIn) {
            navigate('/login', { replace: true });
        } else if (!admin) {
            navigate('/books', { replace: true });
        }
    }, [admin, loggedIn, navigate]);

    async function loadBooks() {
        try {
            setIsLoading(true);
            setError(null);

            const data = await getBooks();
            console.log('Books from API:', data);
            setBooks(data);
        } catch (err: unknown) {
            console.error('Error loading books:', err);
            if (axios.isAxiosError(err)) {
                setError(
                    `Axios error: ${err.message}${err.response ? ` | Status: ${err.response.status}` : ''
                    }`
                );
            } else {
                setError('Unexpected error while loading books.');
            }
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (admin) {
            loadBooks();
        }
    }, [admin]);

    async function handleCreate(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            setError(null);

            const payload = { title, author, isbn };
            await createBook(payload);
            setTitle('');
            setAuthor('');
            setIsbn('');
            await loadBooks();
        } catch (err: unknown) {
            console.error('Error creating book:', err);
            if (axios.isAxiosError(err)) {
                if (err.response?.status === 401) {
                    setError('You must be logged in to create books.');
                } else {
                    setError(
                        `Error creating book: ${err.message}${err.response ? ` | Status: ${err.response.status}` : ''
                        }`
                    );
                }
            } else {
                setError('Unexpected error while creating book.');
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleDelete(id: number) {
        if (!window.confirm('Are you sure you want to delete this book?')) return;

        try {
            setDeletingId(id);
            setError(null);
            await deleteBook(id);
            await loadBooks();
        } catch (err: unknown) {
            console.error('Error deleting book:', err);
            if (axios.isAxiosError(err)) {
                if (err.response?.status === 401) {
                    setError('You must be logged in to delete books.');
                } else {
                    setError(
                        `Error deleting book: ${err.message}${err.response ? ` | Status: ${err.response.status}` : ''
                        }`
                    );
                }
            } else {
                setError('Unexpected error while deleting book.');
            }
        } finally {
            setDeletingId(null);
        }
    }

    const resolveStatus = (book: Book): BookStatus => {
        const maybeStatus = (book as BookWithStatus).status;
        if (
            maybeStatus === 'available' ||
            maybeStatus === 'loaned' ||
            maybeStatus === 'reserved' ||
            maybeStatus === 'lost' ||
            maybeStatus === 'missing'
        ) {
            return maybeStatus;
        }

        // TODO: replace with real status from API once available
        return 'available';
    };

    return (
        <div className="space-y-6 text-base leading-relaxed text-slate-900">
            <div className="space-y-2">
                <h1 className="text-2xl font-semibold text-brand-primary">
                    Admin books
                </h1>
                <p className="text-sm text-slate-600">
                    Manage the catalog. Only admins can add or remove titles.
                </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <form onSubmit={handleCreate} className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-brand-primary">
                            Add a new book
                        </h2>
                        <span className="rounded bg-brand-tertiary/30 px-2 py-0.5 text-[11px] font-medium text-brand-primary">
                            Admin tools
                        </span>
                    </div>
                    <div className="grid gap-3 md:grid-cols-3">
                        <input
                            className="rounded border border-slate-300 px-3 py-2 text-sm"
                            placeholder="Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                        <input
                            className="rounded border border-slate-300 px-3 py-2 text-sm"
                            placeholder="Author"
                            value={author}
                            onChange={(e) => setAuthor(e.target.value)}
                            required
                        />
                        <input
                            className="rounded border border-slate-300 px-3 py-2 text-sm"
                            placeholder="ISBN"
                            value={isbn}
                            onChange={(e) => setIsbn(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="rounded bg-brand-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-secondary disabled:opacity-60"
                    >
                        {isSubmitting ? 'Saving…' : 'Save book'}
                    </button>
                </form>
            </div>

            {isLoading && (
                <p className="text-sm text-slate-600">Loading books...</p>
            )}

            {error && (
                <p className="text-sm text-red-600 whitespace-pre-wrap">{error}</p>
            )}

            {!isLoading && !error && books.length === 0 && (
                <p className="text-sm text-slate-600">No books found.</p>
            )}

            {!isLoading && !error && books.length > 0 && (
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <table className="min-w-full divide-y divide-slate-200 text-sm">
                        <thead className="bg-brand-tertiary/30 text-left font-semibold text-brand-primary">
                            <tr>
                                <th className="px-4 py-2">Title</th>
                                <th className="px-4 py-2">Author</th>
                                <th className="px-4 py-2">ISBN</th>
                                <th className="px-4 py-2">Status</th>
                                <th className="px-4 py-2 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {books.map((book) => {
                                const status = resolveStatus(book);

                                return (
                                    <tr key={book.id}>
                                        <td className="px-4 py-2">{book.title}</td>
                                        <td className="px-4 py-2">{book.author}</td>
                                        <td className="px-4 py-2">{book.isbn}</td>
                                        <td className="px-4 py-2">
                                            <StatusTag status={status} />
                                        </td>
                                        <td className="px-4 py-2 text-right">
                                            {/* Edit will come later */}
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(book.id)}
                                                disabled={deletingId === book.id}
                                                className="rounded border border-red-300 px-2 py-1 text-xs text-red-700 transition hover:bg-red-50 disabled:opacity-60"
                                            >
                                                {deletingId === book.id ? 'Deleting…' : 'Delete'}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
