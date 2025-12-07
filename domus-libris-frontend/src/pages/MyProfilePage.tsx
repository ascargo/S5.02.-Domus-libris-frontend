// src/pages/MyProfilePage.tsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import {
    getMyPatronProfile,
    updateMyPatronProfile,
    type UpdatePatronPayload,
} from '../api/patronsApi';
import { getMyLoans } from '../api/loansApi';
import type { Patron } from '../types/patron';
import type { Loan } from '../types/loan';
import { isLoggedIn } from '../auth/auth';
import { Link } from 'react-router-dom';

export function MyProfilePage() {
    const authed = isLoggedIn();
    const [profile, setProfile] = useState<Patron | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [myLoans, setMyLoans] = useState<Loan[]>([]);
    const [loansLoading, setLoansLoading] = useState(false);
    const [loansError, setLoansError] = useState<string | null>(null);

    useEffect(() => {
        if (!authed) return;
        async function loadProfile() {
            try {
                setIsLoading(true);
                setError(null);
                const data = await getMyPatronProfile();
                setProfile(data);
                setName(data.name);
                setEmail(data.email);
            } catch (err: unknown) {
                console.error('Error loading profile:', err);
                if (axios.isAxiosError(err)) {
                    setError(
                        `Could not load profile. ${
                            err.response?.data?.message ?? err.message
                        }${err.response ? ` (status ${err.response.status})` : ''}`
                    );
                } else {
                    setError('Could not load profile.');
                }
            } finally {
                setIsLoading(false);
            }
        }
        loadProfile();
    }, [authed]);

    useEffect(() => {
        if (!authed) return;
        setLoansLoading(true);
        setLoansError(null);
        getMyLoans()
            .then(setMyLoans)
            .catch(() => setLoansError('Could not load your loans.'))
            .finally(() => setLoansLoading(false));
    }, [authed]);

    if (!authed) {
        return (
            <div className="mx-auto max-w-3xl space-y-3 text-sm text-slate-700">
                <p>You must be logged in to view your profile.</p>
                <Link to="/login" className="text-brand-primary hover:underline">
                    Go to login
                </Link>
            </div>
        );
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const payload: UpdatePatronPayload = { name, email };
        try {
            setIsSubmitting(true);
            setError(null);
            setSuccess(null);
            const updated = await updateMyPatronProfile(payload);
            setProfile(updated);
            setSuccess('Profile updated successfully.');
        } catch (err: unknown) {
            console.error('Error updating profile:', err);
            if (axios.isAxiosError(err)) {
                setError(
                    `Could not update profile. ${
                        err.response?.data?.message ?? err.message
                    }${err.response ? ` (status ${err.response.status})` : ''}`
                );
            } else {
                setError('Could not update profile.');
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="space-y-4 text-base leading-relaxed text-slate-900">
            <div className="space-y-1">
                <h1 className="text-2xl font-semibold text-brand-primary">My profile</h1>
                <p className="text-sm text-slate-600">View and update your details.</p>
            </div>

            {isLoading && (
                <p className="text-sm text-slate-600">Loading profile...</p>
            )}

            {error && <p className="text-sm text-red-600 whitespace-pre-wrap">{error}</p>}
            {success && <p className="text-sm text-green-700">{success}</p>}

            {!isLoading && profile && (
                <form
                    onSubmit={handleSubmit}
                    className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-700">Name</label>
                        <input
                            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-700">Email</label>
                        <input
                            type="email"
                            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="rounded bg-brand-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-secondary disabled:opacity-60"
                    >
                        {isSubmitting ? 'Saving...' : 'Save changes'}
                    </button>
                </form>
            )}

            {authed && (
                <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-sm font-semibold text-brand-primary">
                                My loans
                            </h2>
                            <p className="text-xs text-slate-600">
                                Loans associated with your account.
                            </p>
                        </div>
                    </div>

                    {loansLoading && (
                        <p className="text-sm text-slate-600">Loading your loans...</p>
                    )}
                    {loansError && (
                        <p className="text-sm text-red-600 whitespace-pre-wrap">
                            {loansError}
                        </p>
                    )}
                    {!loansLoading && !loansError && myLoans.length === 0 && (
                        <p className="text-sm text-slate-600">
                            You don&apos;t have any loans yet.
                        </p>
                    )}

                    {!loansLoading && !loansError && myLoans.length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 text-sm">
                                <thead className="bg-brand-tertiary/30 text-left font-semibold text-brand-primary">
                                    <tr>
                                        <th className="px-4 py-2">Book</th>
                                        <th className="px-4 py-2">Loan date</th>
                                        <th className="px-4 py-2">Due date</th>
                                        <th className="px-4 py-2">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {myLoans.map((loan) => (
                                        <tr key={loan.id}>
                                            <td className="px-4 py-2">
                                                {loan.book?.title ?? `Book #${loan.book_id}`}
                                            </td>
                                            <td className="px-4 py-2">
                                                {loan.loaned_at
                                                    ? new Date(
                                                          loan.loaned_at
                                                      ).toLocaleDateString()
                                                    : loan.loan_date
                                                      ? new Date(
                                                            loan.loan_date
                                                        ).toLocaleDateString()
                                                      : '—'}
                                            </td>
                                            <td className="px-4 py-2">
                                                {loan.due_at
                                                    ? new Date(loan.due_at).toLocaleDateString()
                                                    : loan.due_date
                                                      ? new Date(
                                                            loan.due_date
                                                        ).toLocaleDateString()
                                                      : '—'}
                                            </td>
                                            <td className="px-4 py-2 capitalize">
                                                {loan.status ?? 'ongoing'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            )}
        </div>
    );
}
