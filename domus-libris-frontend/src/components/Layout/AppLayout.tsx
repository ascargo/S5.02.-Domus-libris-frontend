import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { isLoggedIn, getCurrentUser, clearAuth } from '../../auth/auth';

interface AppLayoutProps {
    children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
    const navigate = useNavigate();
    const location = useLocation();
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

    useEffect(() => {
        // Update auth state on route changes to reflect recent logins without full refresh.
        setAuthenticated(isLoggedIn());
        setUser(getCurrentUser());
    }, [location.pathname]);

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
        <div className="min-h-screen font-sans">
            <header className="bg-brand-primary text-white shadow-brand">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
                    <div className="flex flex-col">
                        <Link to="/" className="text-lg font-semibold tracking-tight">
                            Domus Libris
                        </Link>
                        <span className="text-xs text-brand-tertiary/90">
                            A home for shared stories
                        </span>
                    </div>
                    <div className="flex flex-col gap-1 text-sm">
                        <nav className="flex flex-wrap items-center gap-3">
                            <Link
                                to="/"
                                className="rounded px-2 py-1 text-slate-100 hover:text-brand-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand.secondary focus-visible:ring-offset-2 focus-visible:ring-offset-brand-primary"
                            >
                                Home
                            </Link>
                            <Link
                                to="/about"
                                className="rounded px-2 py-1 text-slate-100 hover:text-brand-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand.secondary focus-visible:ring-offset-2 focus-visible:ring-offset-brand-primary"
                            >
                                About
                            </Link>
                            <Link
                                to="/books"
                                className="rounded px-2 py-1 text-slate-100 hover:text-brand-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand.secondary focus-visible:ring-offset-2 focus-visible:ring-offset-brand-primary"
                            >
                                Catalogue
                            </Link>

                            {authenticated && (
                                <Link
                                    to="/dashboard"
                                    className="rounded px-2 py-1 text-slate-100 hover:text-brand-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand.secondary focus-visible:ring-offset-2 focus-visible:ring-offset-brand-primary"
                                >
                                    Dashboard
                                </Link>
                            )}

                            {authenticated && admin && (
                                <>
                                    <Link
                                        to="/patrons"
                                        className="rounded px-2 py-1 text-slate-100 hover:text-brand-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand.secondary focus-visible:ring-offset-2 focus-visible:ring-offset-brand-primary"
                                    >
                                        Patrons
                                    </Link>
                                    <Link
                                        to="/loans"
                                        className="rounded px-2 py-1 text-slate-100 hover:text-brand-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand.secondary focus-visible:ring-offset-2 focus-visible:ring-offset-brand-primary"
                                    >
                                        Loans
                                    </Link>
                                </>
                            )}

                            {authenticated && !admin && (
                                <Link
                                    to="/my-loans"
                                    className="rounded px-2 py-1 text-slate-100 hover:text-brand-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand.secondary focus-visible:ring-offset-2 focus-visible:ring-offset-brand-primary"
                                >
                                    My loans
                                </Link>
                            )}

                            {authenticated && (
                                <Link
                                    to="/my-profile"
                                    className="rounded px-2 py-1 text-slate-100 hover:text-brand-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand.secondary focus-visible:ring-offset-2 focus-visible:ring-offset-brand-primary"
                                >
                                    My profile
                                </Link>
                            )}

                            {!authenticated && (
                                <>
                                    <Link
                                        to="/become-a-patron"
                                        className="rounded px-2 py-1 text-slate-100 hover:text-brand-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand.secondary focus-visible:ring-offset-2 focus-visible:ring-offset-brand-primary"
                                    >
                                        Become a patron
                                    </Link>
                                    <Link
                                        to="/login"
                                        className="rounded px-2 py-1 text-slate-100 hover:text-brand-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand.secondary focus-visible:ring-offset-2 focus-visible:ring-offset-brand-primary"
                                    >
                                        Login
                                    </Link>
                                </>
                            )}

                            {authenticated && (
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="rounded border border-slate-200/40 px-2 py-1 text-xs font-medium text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand.secondary focus-visible:ring-offset-2 focus-visible:ring-offset-brand.primary"
                                >
                                    Logout
                                </button>
                            )}
                        </nav>

                        {authenticated && user && (
                            <span className="text-[11px] text-brand-tertiary/90">
                                Logged in as {user.name}
                                {roleLabel ? ` (${roleLabel})` : ''}
                            </span>
                        )}
                    </div>
                </div>
            </header>

            <div className="bg-gradient-to-b from-brand-primary/5 via-brand-accent1/20 to-white">
                <main className="mx-auto max-w-6xl space-y-4 px-4 py-6">{children}</main>
            </div>
        </div>
    );
}
