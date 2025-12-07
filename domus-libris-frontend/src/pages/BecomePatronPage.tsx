// src/pages/BecomePatronPage.tsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { register } from '../api/authApi';
import { setToken, setCurrentUser, isLoggedIn } from '../auth/auth';
import type { RegisterPayload } from '../types/auth';

export function BecomePatronPage() {
    const navigate = useNavigate();
    const authed = isLoggedIn();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (authed) {
        return (
            <main className="mx-auto max-w-5xl space-y-4 px-4 py-6 text-base leading-relaxed text-slate-900">
                <h1 className="text-2xl font-semibold text-brand-primary">You are already logged in</h1>
                <p className="text-slate-700">
                    You can manage your profile or view your loans from here.
                </p>
                <div className="flex flex-col gap-2 sm:flex-row">
                    <Link
                        to="/my-profile"
                        className="inline-flex items-center justify-center rounded bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-secondary"
                    >
                        Go to my profile
                    </Link>
                    <Link
                        to="/dashboard"
                        className="inline-flex items-center justify-center rounded border border-brand-primary px-4 py-2 text-sm font-semibold text-brand-primary hover:bg-brand-primary/10"
                    >
                        Go to dashboard
                    </Link>
                </div>
            </main>
        );
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (password !== passwordConfirm) {
            setError('Passwords do not match.');
            return;
        }

        const payload: RegisterPayload = {
            name,
            email,
            password,
            password_confirmation: passwordConfirm,
        };

        try {
            setIsSubmitting(true);
            const data = await register(payload);
            setToken(data.token);
            setCurrentUser(data.user);
            setSuccess('Your patron account has been created. You are now logged in.');
            navigate('/my-profile', { replace: true });
        } catch (err: unknown) {
            console.error('Error registering patron:', err);
            if (axios.isAxiosError(err)) {
                const message =
                    err.response?.data?.message ??
                    err.response?.data?.error ??
                    err.message;
                setError(
                    `Could not create account. ${message}${
                        err.response ? ` (status ${err.response.status})` : ''
                    }`
                );
            } else {
                setError('Could not create account. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main className="mx-auto max-w-5xl space-y-4 px-4 py-6 text-base leading-relaxed text-slate-900">
            <div className="space-y-1">
                <h1 className="text-2xl font-semibold text-brand-primary">Become a patron</h1>
                <p className="text-sm text-slate-600">
                    Create an account to start borrowing books.
                </p>
            </div>

            <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-sm font-semibold text-brand-primary">Create your account</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label
                            className="block text-xs font-medium text-slate-700"
                            htmlFor="patron-name"
                        >
                            Name
                        </label>
                        <input
                            id="patron-name"
                            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <label
                            className="block text-xs font-medium text-slate-700"
                            htmlFor="patron-email"
                        >
                            Email
                        </label>
                        <input
                            id="patron-email"
                            type="email"
                            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-1">
                            <label
                                className="block text-xs font-medium text-slate-700"
                                htmlFor="patron-password"
                            >
                                Password
                            </label>
                            <input
                                id="patron-password"
                                type="password"
                                minLength={8}
                                className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <label
                                className="block text-xs font-medium text-slate-700"
                                htmlFor="patron-password-confirm"
                            >
                                Confirm password
                            </label>
                            <input
                                id="patron-password-confirm"
                                type="password"
                                minLength={8}
                                className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                                value={passwordConfirm}
                                onChange={(e) => setPasswordConfirm(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <p className="text-sm text-red-600 whitespace-pre-wrap">{error}</p>
                    )}
                    {success && (
                        <p className="text-sm text-green-700">{success}</p>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="rounded bg-brand-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-secondary disabled:opacity-60"
                    >
                        {isSubmitting ? 'Creating account...' : 'Create account'}
                    </button>
                </form>
            </section>
        </main>
    );
}
