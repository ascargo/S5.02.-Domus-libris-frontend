// src/pages/MyLoansPage.tsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { getMyLoans } from '../api/loansApi';
import type { Loan } from '../types/loan';
import { isLoggedIn } from '../auth/auth';

export function MyLoansPage() {
    const [loans, setLoans] = useState<Loan[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const authed = isLoggedIn();

    async function loadLoans() {
        try {
            setIsLoading(true);
            setError(null);
            const data = await getMyLoans();
            setLoans(data);
        } catch (err: unknown) {
            console.error('Error loading my loans:', err);
            if (axios.isAxiosError(err)) {
                setError(
                    `Could not load your loans. ${err.message}${
                        err.response ? ` (status ${err.response.status})` : ''
                    }`
                );
            } else {
                setError('Could not load your loans.');
            }
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (!authed) return;
        loadLoans();
    }, [authed]);

    if (!authed) {
        return (
            <div className="mx-auto max-w-3xl text-center text-sm text-slate-700">
                You must be logged in to view your loans.
            </div>
        );
    }

    return (
        <div className="space-y-4 text-base leading-relaxed text-slate-900">
            <div className="space-y-1">
                <h1 className="text-2xl font-semibold text-brand-primary">My loans</h1>
                <p className="text-sm text-slate-600">
                    Loans associated with your account.
                </p>
            </div>

            {isLoading && (
                <p className="text-sm text-slate-600">Loading your loans...</p>
            )}

            {error && <p className="text-sm text-red-600 whitespace-pre-wrap">{error}</p>}

            {!isLoading && !error && loans.length === 0 && (
                <p className="text-sm text-slate-600">You have no loans.</p>
            )}

            {!isLoading && !error && loans.length > 0 && (
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <table className="min-w-full divide-y divide-slate-200 text-sm">
                        <thead className="bg-brand-tertiary/30 text-left font-semibold text-brand-primary">
                            <tr>
                                <th className="px-4 py-2">Book</th>
                                <th className="px-4 py-2">Loan date</th>
                                <th className="px-4 py-2">Due date</th>
                                <th className="px-4 py-2">Return date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loans.map((loan) => (
                                <tr key={loan.id}>
                                    <td className="px-4 py-2">
                                        {loan.book?.title ?? `Book #${loan.book_id}`}
                                    </td>
                                    <td className="px-4 py-2">
                                        {loan.loaned_at
                                            ? new Date(loan.loaned_at).toLocaleDateString()
                                            : loan.loan_date
                                              ? new Date(loan.loan_date).toLocaleDateString()
                                              : '—'}
                                    </td>
                                    <td className="px-4 py-2">
                                        {loan.due_at
                                            ? new Date(loan.due_at).toLocaleDateString()
                                            : loan.due_date
                                              ? new Date(loan.due_date).toLocaleDateString()
                                              : '—'}
                                    </td>
                                    <td className="px-4 py-2">
                                        {loan.return_date
                                            ? new Date(loan.return_date).toLocaleDateString()
                                            : loan.returned_at
                                              ? new Date(loan.returned_at).toLocaleDateString()
                                              : '—'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
