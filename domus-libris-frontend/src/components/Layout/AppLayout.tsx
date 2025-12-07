import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { isLoggedIn, getCurrentUser, clearAuth } from '../../auth/auth';

interface AppLayoutProps {
    children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
    const navigate = useNavigate();
    const [authenticated, setAuthenticated] = useState<boolean>(isLoggedIn());
    const [user, setUser] = useState(getCurrentUser());
    const admin = user?.role === 'admin';

    useEffect(() => {
        const syncAuthState = () => {
            setAuthenticated(isLoggedIn());
            setUser(getCurrentUser());
        };

        syncAuthState();
        window.addEventListener('storage', syncAuthState);
        return () => window.removeEventListener('storage', syncAuthState);
    }, []);

    const handleLogout = () => {
        clearAuth();
        setAuthenticated(false);
        setUser(null);
        navigate('/login');
    };

    const roleLabel =
        user?.role === 'admin'
            ? 'Admin'
            : user?.role === 'patron'
                ? 'Patron'
                : user?.role ?? '';

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <header className="bg-brand-primary text-white">
                <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
                    <Link to="/" className="text-lg font-semibold">
                        Domus Libris
                    </Link>
                    <nav className="flex items-center gap-4 text-sm">
                        <Link to="/books" className="hover:text-slate-200">
                            Books
                        </Link>
                        {authenticated && admin && (
                            <>
                                <Link to="/patrons" className="hover:text-slate-200">
                                    Patrons
                                </Link>
                                <Link to="/loans" className="hover:text-slate-200">
                                    Loans
                                </Link>
                            </>
                        )}
                        {authenticated && !admin && (
                            <Link to="/my-loans" className="hover:text-slate-200">
                                My loans
                            </Link>
                        )}
                        {authenticated && (
                            <Link to="/my-profile" className="hover:text-slate-200">
                                My profile
                            </Link>
                        )}
                        {authenticated && (
                            <Link to="/dashboard" className="hover:text-slate-200">
                                Dashboard
                            </Link>
                        )}

                        {!authenticated && (
                            <Link to="/login" className="hover:text-slate-200">
                                Login
                            </Link>
                        )}

                        {authenticated && user && (
                            <span className="text-xs text-slate-200/80">
                                Logged in as {user.name}
                                {roleLabel ? ` (${roleLabel})` : ''}
                            </span>
                        )}

                        {authenticated && (
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="rounded border border-slate-200/40 px-2 py-1 text-xs font-medium text-white transition hover:bg-slate-800"
                            >
                                Logout
                            </button>
                        )}
                    </nav>
                </div>
            </header>

            <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
        </div>
    );
}
