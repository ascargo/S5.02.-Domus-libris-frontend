// src/pages/LoginPage.tsx
import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { login } from '../api/authApi';
import { setToken } from '../auth/auth';

export function LoginPage() {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);

        try {
            setIsSubmitting(true);

            const result = await login({ email, password });
            console.log('Login result:', result);

            setToken(result.token);

            // later we can store user in context if needed
            navigate('/books');
        } catch (err) {
            console.error('Login error:', err);
            if (axios.isAxiosError(err)) {
                if (err.response?.status === 422) {
                    setError('Invalid credentials.');
                } else {
                    setError(
                        `Login failed: ${err.message}${err.response ? ` | Status: ${err.response.status}` : ''
                        }`
                    );
                }
            } else if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Unexpected error during login.');
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="mx-auto max-w-md rounded-lg bg-white p-6 shadow-sm">
            <h1 className="mb-4 text-xl font-semibold text-slate-900">Login</h1>

            {error && (
                <p className="mb-3 text-sm text-red-600 whitespace-pre-wrap">{error}</p>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
                <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-700">
                        Email
                    </label>
                    <input
                        type="email"
                        className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        required
                    />
                </div>

                <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-700">
                        Password
                    </label>
                    <input
                        type="password"
                        className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-2 rounded bg-slate-900 px-3 py-1 text-sm font-medium text-white disabled:opacity-60"
                >
                    {isSubmitting ? 'Logging in…' : 'Login'}
                </button>
            </form>
        </div>
    );
}
