// src/pages/BooksPage.tsx
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import axios from 'axios';
import { getBooks, createBook, deleteBook } from '../api/booksApi';
import type { Book } from '../types/book';
import { isLoggedIn } from '../auth/auth';

export function BooksPage() {
    const [books, setBooks] = useState<Book[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [isbn, setIsbn] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [deletingId, setDeletingId] = useState<number | null>(null);

    async function loadBooks() {
        try {
            setIsLoading(true);
            setError(null);

            const data = await getBooks();
            console.log('Books from API:', data);
            setBooks(data);
        } catch (err) {
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
        } catch (err) {
            console.error('Error creating book:', err);
            if (axios.isAxiosError(err)) {
                if (err.response?.status === 401) {
                    setError('You must be logged in to create books. (Auth pending)');
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
        } catch (err) {
            console.error('Error deleting book:', err);
            if (axios.isAxiosError(err)) {
                if (err.response?.status === 401) {
                    setError('You must be logged in to delete books. (Auth pending)');
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

    console.log('Auth status in BooksPage:', isLoggedIn());

    return (
        <div className="space-y-4">
            <h1 className="text-xl font-semibold text-slate-900">Books</h1>

            <p className="text-xs text-slate-500">
                Auth status: {isLoggedIn() ? 'Logged in' : 'Not logged in'}
            </p>

            {/* Create form */}
            <form
                onSubmit={handleCreate}
                className="space-y-3 rounded-lg bg-white p-4 shadow-sm"
            >
                <h2 className="text-sm font-semibold text-slate-800">
                    Add a new book
                </h2>
                <div className="grid gap-3 md:grid-cols-3">
                    <input
                        className="rounded border border-slate-300 px-2 py-1 text-sm"
                        placeholder="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                    <input
                        className="rounded border border-slate-300 px-2 py-1 text-sm"
                        placeholder="Author"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        required
                    />
                    <input
                        className="rounded border border-slate-300 px-2 py-1 text-sm"
                        placeholder="ISBN"
                        value={isbn}
                        onChange={(e) => setIsbn(e.target.value)}
                        required
                    />
                </div>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded bg-slate-900 px-3 py-1 text-sm font-medium text-white disabled:opacity-60"
                >
                    {isSubmitting ? 'Saving…' : 'Save book'}
                </button>
            </form>

            {isLoading && (
                <p className="text-sm text-slate-500">Loading books...</p>
            )}

            {error && (
                <p className="text-sm text-red-600 whitespace-pre-wrap">{error}</p>
            )}

            {!isLoading && !error && books.length === 0 && (
                <p className="text-sm text-slate-500">No books found.</p>
            )}

            {!isLoading && !error && books.length > 0 && (
                <table className="min-w-full divide-y divide-slate-200 bg-white shadow-sm text-sm">
                    <thead className="bg-slate-100 text-left font-semibold">
                        <tr>
                            <th className="px-4 py-2">Title</th>
                            <th className="px-4 py-2">Author</th>
                            <th className="px-4 py-2">ISBN</th>
                            <th className="px-4 py-2 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {books.map((book) => (
                            <tr key={book.id}>
                                <td className="px-4 py-2">{book.title}</td>
                                <td className="px-4 py-2">{book.author}</td>
                                <td className="px-4 py-2">{book.isbn}</td>
                                <td className="px-4 py-2 text-right">
                                    {/* Edit will come later */}
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(book.id)}
                                        disabled={deletingId === book.id}
                                        className="rounded border border-red-300 px-2 py-1 text-xs text-red-700 disabled:opacity-60"
                                    >
                                        {deletingId === book.id ? 'Deleting…' : 'Delete'}
                                    </button>
                                </td>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {books.map((book) => (
                                <tr key={book.id}>
                                    <td className="px-4 py-2">{book.title}</td>
                                    <td className="px-4 py-2">{book.author}</td>
                                    <td className="px-4 py-2">{book.isbn}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        );
    }
