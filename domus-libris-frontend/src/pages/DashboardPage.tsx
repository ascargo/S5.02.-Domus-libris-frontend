// src/pages/DashboardPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getDashboardSummary } from '../api/dashboardApi';
import type { DashboardSummary } from '../api/dashboardApi';
import { isLoggedIn } from '../auth/auth';

export function DashboardPage() {
    const navigate = useNavigate();
    const [data, setData] = useState<DashboardSummary | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
