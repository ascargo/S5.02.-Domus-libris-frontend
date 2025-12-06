// src/pages/BooksPage.tsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { getBooks } from '../api/booksApi';
import type { Book } from '../types/book';
import { isAdmin } from '../auth/auth';
import { StatusTag, type BookStatus } from '../components/Books/StatusTag';

type BookWithStatus = Book & { status?: BookStatus };

export function BooksPage() {
    const [books, setBooks] = useState<Book[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const admin = isAdmin();

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
        loadBooks();
    }, []);

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
                    Books catalog
                </h1>
                <p className="text-sm text-slate-600">
                    Browse the full catalog. Sign in as admin to manage titles.
                </p>
                {admin && (
                    <div className="flex items-center gap-2 rounded border border-brand-tertiary bg-brand-tertiary/20 px-3 py-2 text-sm text-brand-primary">
                        You are an admin.{' '}
                        <Link
                            to="/admin/books"
                            className="rounded bg-brand-primary px-2 py-1 text-xs font-medium text-white transition hover:bg-brand-secondary"
                        >
                            Go to admin panel
                        </Link>
                    </div>
                )}
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
