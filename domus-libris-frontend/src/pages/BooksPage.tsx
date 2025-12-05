// src/pages/BooksPage.tsx
import { useEffect, useState } from 'react';
import { getBooks } from '../api/booksApi';
import type { Book } from '../types/book';

export function BooksPage() {
    const [books, setBooks] = useState<Book[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function loadBooks() {
        try {
            setIsLoading(true);
            setError(null);

            const data = await getBooks();
            console.log('Books from API:', data);
            setBooks(data);
        } catch (err) {
            console.error('Error loading books:', err);
            setError('Could not load books from the API.');
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        loadBooks();
    }, []);

    return (
        <div className="space-y-4">
            <h1 className="text-xl font-semibold text-slate-900">Books</h1>

            {isLoading && (
                <p className="text-sm text-slate-500">Loading books...</p>
            )}

            {error && (
                <p className="text-sm text-red-600">{error}</p>
            )}

            {!isLoading && !error && books.length === 0 && (
                <p className="text-sm text-slate-500">
                    No books found.
                </p>
            )}

            {!isLoading && !error && books.length > 0 && (
                <table className="min-w-full divide-y divide-slate-200 bg-white shadow-sm text-sm">
                    <thead className="bg-slate-100 text-left font-semibold">
                        <tr>
                            <th className="px-4 py-2">Title</th>
                            <th className="px-4 py-2">Author</th>
                            <th className="px-4 py-2">ISBN</th>
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
