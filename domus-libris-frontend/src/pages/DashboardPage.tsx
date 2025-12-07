// src/pages/DashboardPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getDashboardSummary } from '../api/dashboardApi';
import type { DashboardSummary } from '../api/dashboardApi';
import { getMyLoans } from '../api/loansApi';
import type { Loan } from '../types/loan';
import { isLoggedIn, isPatron } from '../auth/auth';

export function DashboardPage() {
    const navigate = useNavigate();
    const [data, setData] = useState<DashboardSummary | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [myLoans, setMyLoans] = useState<Loan[] | null>(null);
    const [isLoadingMyLoans, setIsLoadingMyLoans] = useState(false);
    const [myLoansError, setMyLoansError] = useState<string | null>(null);

    useEffect(() => {
        if (!isLoggedIn()) {
            navigate('/login', { replace: true });
            return;
        }

        async function loadDashboard() {
            try {
                setIsLoading(true);
                setError(null);
                const summary = await getDashboardSummary();
                setData(summary);
                if (isPatron()) {
                    setIsLoadingMyLoans(true);
                    try {
                        const loans = await getMyLoans();
                        setMyLoans(loans);
                    } catch (loanErr: unknown) {
                        console.error('Error loading my loans:', loanErr);
                        setMyLoansError(
                            'Could not load your loans right now. Please try again later.'
                        );
                    } finally {
                        setIsLoadingMyLoans(false);
                    }
                }
            } catch (err: unknown) {
                console.error('Error loading dashboard:', err);
                if (axios.isAxiosError(err)) {
                    setError(
                        `Could not load dashboard data. Please try again later. (${err.message})`
                    );
                } else {
                    setError('Could not load dashboard data. Please try again later.');
                }
            } finally {
                setIsLoading(false);
            }
        }

        loadDashboard();
    }, [navigate]);

    return (
        <div className="space-y-6 text-base leading-relaxed text-slate-900">
            <div className="space-y-2">
                <h1 className="text-2xl font-semibold text-brand-primary">
                    Dashboard
                </h1>
                <p className="text-sm text-slate-600">
                    Overview of the library activity and resources.
                </p>
            </div>

            {isLoading && (
                <p className="text-sm text-slate-600">Loading dashboard...</p>
            )}

            {error && (
                <p className="text-sm text-red-600 whitespace-pre-wrap">{error}</p>
            )}

            {!isLoading && !error && data && (
                <div className="space-y-4">
                    {isPatron() && (
                        <PatronLoansSection
                            loans={myLoans}
                            isLoading={isLoadingMyLoans}
                            error={myLoansError}
                        />
                    )}

                    <StatsBar summary={data} />

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <DashboardCard
                            title="Total books"
                            value={data.books_count}
                            accent="bg-brand-softGreen text-brand-primary"
                        />
                        <DashboardCard
                            title="Total loans"
                            value={data.loans_count}
                            accent="bg-brand-softYellow text-brand-primary"
                        />
                        <DashboardCard
                            title="Active loans"
                            value={data.active_loans_count}
                            accent="bg-brand-tertiary text-brand-primary"
                        />
                        <DashboardCard
                            title="Active patrons"
                            value={data.active_patrons_count}
                            accent="bg-white text-brand-primary border border-brand-primary/20"
                        />
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-brand-primary">
                                Recently added books
                            </h2>
                            <span className="text-xs text-slate-500">
                                Latest 5 titles
                            </span>
                        </div>

                        {data.recent_books.length === 0 ? (
                            <p className="mt-3 text-sm text-slate-600">
                                No recent books to display.
                            </p>
                        ) : (
                            <ul className="mt-3 divide-y divide-slate-100">
                                {data.recent_books.map((book) => (
                                    <li
                                        key={book.id}
                                        className="py-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"
                                    >
                                        <div>
                                            <p className="font-medium text-brand-primary">
                                                {book.title}
                                            </p>
                                            <p className="text-sm text-slate-600">
                                                {book.author ?? 'Unknown author'}
                                                {book.genre ? ` • ${book.genre}` : ''}
                                            </p>
                                        </div>
                                        <p className="text-xs text-slate-500">
                                            Added on{' '}
                                            {new Date(book.created_at).toLocaleDateString()}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

interface DashboardCardProps {
    title: string;
    value: number;
    accent: string;
}

function DashboardCard({ title, value, accent }: DashboardCardProps) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <div className="mt-2 flex items-baseline gap-2">
                <span className={`rounded px-2 py-1 text-xs font-semibold ${accent}`}>
                    {title}
                </span>
                <span className="text-2xl font-semibold text-brand-primary">
                    {value}
                </span>
            </div>
        </div>
    );
}

interface PatronLoansSectionProps {
    loans: Loan[] | null;
    isLoading: boolean;
    error: string | null;
}

function PatronLoansSection({ loans, isLoading, error }: PatronLoansSectionProps) {
    const activeLoans = (loans ?? []).filter(
        (loan) => !(loan.return_date ?? loan.returned_at)
    );
    const activeCount = activeLoans.length;
    const list = activeLoans.slice(0, 5);

    return (
        <section className="rounded-xl bg-white shadow-sm border border-slate-200 p-4 space-y-3">
            <div className="space-y-1">
                <h2 className="text-sm font-semibold text-brand-primary">
                    Your active loans
                </h2>
                <p className="text-xs text-slate-600">
                    Loans you currently have checked out.
                </p>
            </div>

            {isLoading && (
                <p className="text-sm text-slate-600">Loading your loans...</p>
            )}

            {error && <p className="text-sm text-red-600">{error}</p>}

            {!isLoading && !error && (
                <>
                    <p className="text-sm text-slate-700">
                        {activeCount === 0
                            ? 'You have no active loans 🧘‍♀️'
                            : `You currently have ${activeCount} active loan${activeCount === 1 ? '' : 's'}.`}
                    </p>

                    {list.length > 0 && (
                        <div className="mt-2 space-y-3">
                            {list.map((loan) => {
                                const status = getLoanStatus(loan);
                                const bookTitle = loan.book?.title || 'Untitled book';
                                const dueDateValue = loan.due_date || loan.loan_date;
                                const dueDate = dueDateValue
                                    ? new Date(dueDateValue).toLocaleDateString()
                                    : '—';

                                return (
                                    <div
                                        key={loan.id}
                                        className="flex items-center justify-between gap-4 rounded-lg border border-slate-100 px-3 py-2 text-sm"
                                    >
                                        <div className="space-y-1">
                                            <p className="font-medium text-brand-primary">
                                                {bookTitle}
                                            </p>
                                            <p className="text-xs text-slate-600">
                                                Due: {dueDate}
                                            </p>
                                        </div>
                                        <LoanStatusPill label={status.label} variant={status.variant} />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            )}
        </section>
    );
}

type LoanStatusVariant = 'overdue' | 'due-soon' | 'on-time';

function getLoanStatus(loan: Loan): { label: string; variant: LoanStatusVariant } {
    const today = new Date();
    const dueRaw = loan.due_date || loan.loan_date;
    if (!dueRaw) {
        return { label: 'On time', variant: 'on-time' };
    }

    const due = new Date(dueRaw);
    const diffMs = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (due < today) {
        return { label: 'Overdue', variant: 'overdue' };
    }

    if (diffDays <= 3) {
        return { label: 'Due soon', variant: 'due-soon' };
    }

    return { label: 'On time', variant: 'on-time' };
}

interface LoanStatusPillProps {
    label: string;
    variant: LoanStatusVariant;
}

function LoanStatusPill({ label, variant }: LoanStatusPillProps) {
    const base = 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium';
    const styles: Record<LoanStatusVariant, string> = {
        overdue: 'bg-brand-secondary text-white',
        'due-soon': 'bg-brand-softYellow text-brand-primary',
        'on-time': 'bg-brand-softGreen text-brand-primary',
    };

    return <span className={`${base} ${styles[variant]}`}>{label}</span>;
}

interface StatsBarProps {
    summary: DashboardSummary;
}

function StatsBar({ summary }: StatsBarProps) {
    const max = Math.max(
        summary.books_count,
        summary.loans_count,
        summary.active_loans_count || 1
    );

    const metrics = [
        {
            label: 'Books',
            value: summary.books_count,
            bar: 'bg-brand-primary',
        },
        {
            label: 'Loans',
            value: summary.loans_count,
            bar: 'bg-brand-secondary',
        },
        {
            label: 'Active loans',
            value: summary.active_loans_count,
            bar: 'bg-brand-tertiary',
        },
    ];

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-slate-600 mb-3">Library overview</p>
            <div className="space-y-2">
                {metrics.map((metric) => {
                    const width = max > 0 ? (metric.value / max) * 100 : 0;
                    return (
                        <div key={metric.label} className="flex items-center gap-3">
                            <div className="w-28 text-sm font-medium text-slate-700">
                                {metric.label}
                            </div>
                            <div className="flex-1">
                                <div className="h-2 w-full rounded-full bg-slate-200">
                                    <div
                                        className={`h-2 rounded-full ${metric.bar}`}
                                        style={{ width: `${width}%` }}
                                    />
                                </div>
                            </div>
                            <div className="w-14 text-right text-sm text-slate-700">
                                {metric.value}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
