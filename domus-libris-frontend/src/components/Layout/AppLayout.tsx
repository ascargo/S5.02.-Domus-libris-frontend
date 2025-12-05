import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

export function AppLayout({ children }: Props) {
    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-slate-900 text-slate-50">
                <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
                    <Link to="/" className="text-lg font-semibold">
                        Domus Libris
                    </Link>
                    <nav className="flex gap-4 text-sm">
                        <Link to="/books">Books</Link>
                        <Link to="/login">Login</Link>
                    </nav>
                </div>
            </header>

            <main className="mx-auto max-w-5xl px-4 py-6">
                {children}
            </main>
        </div>
    );
}
