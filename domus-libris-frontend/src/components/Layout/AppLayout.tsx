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
        <div className="min-h-screen bg-slate-50 font-sans">
            <header className="bg-brand-primary text-white">
                <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
                    <Link to="/" className="text-lg font-semibold">
                        Domus Libris
                    </Link>
                    <div className="flex flex-col gap-1 text-sm">
                        <nav className="flex flex-wrap items-center gap-4">
                            <Link to="/" className="hover:text-slate-200">
                                Home
                            </Link>
                            <Link to="/about" className="hover:text-slate-200">
                                About
                            </Link>
                            <Link to="/books" className="hover:text-slate-200">
                                Catalogue
                            </Link>

                            {authenticated && (
                                <Link to="/dashboard" className="hover:text-slate-200">
                                    Dashboard
                                </Link>
                            )}

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

                            {!authenticated && (
                                <>
                                    <Link to="/become-a-patron" className="hover:text-slate-200">
                                        Become a patron
                                    </Link>
                                    <Link to="/login" className="hover:text-slate-200">
                                        Login
                                    </Link>
                                </>
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

                        {authenticated && user && (
                            <span className="text-[11px] text-slate-200/80">
                                Logged in as {user.name}
                                {roleLabel ? ` (${roleLabel})` : ''}
                            </span>
                        )}
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
        </div>
    );
}
