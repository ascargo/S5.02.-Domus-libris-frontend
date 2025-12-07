// src/pages/PatronDetailPage.tsx
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
    getPatron,
    updatePatron,
    deletePatron,
} from '../api/patronsApi';
import type { Patron } from '../types/patron';
import { isAdmin, isLoggedIn } from '../auth/auth';

export function PatronDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [patron, setPatron] = useState<Patron | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');

    const authed = isLoggedIn();
    const admin = isAdmin();
    const patronId = id ? Number(id) : NaN;

    useEffect(() => {
        if (!authed || !admin) return;
        if (!Number.isFinite(patronId)) {
            setError('Invalid patron id');
            return;
        }

        async function loadPatron() {
            try {
                setIsLoading(true);
                setError(null);
                const data = await getPatron(patronId);
                setPatron(data);
                setName(data.name);
                setEmail(data.email);
            } catch (err: unknown) {
                console.error('Error loading patron:', err);
                if (axios.isAxiosError(err)) {
                    setError(
                        `Could not load patron. ${err.message}${
                            err.response ? ` (status ${err.response.status})` : ''
                        }`
                    );
                } else {
                    setError('Could not load patron.');
                }
            } finally {
                setIsLoading(false);
            }
        }

        loadPatron();
    }, [admin, authed, patronId]);

    if (!authed || !admin) {
        return (
            <div className="mx-auto max-w-3xl text-center text-sm text-slate-700">
                You must be an admin to view patrons.
            </div>
        );
    }

    async function handleSave(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!patron) return;
        try {
            setIsSaving(true);
            setError(null);
            const updated = await updatePatron(patron.id, { name, email });
            setPatron(updated);
        } catch (err: unknown) {
            console.error('Error updating patron:', err);
            if (axios.isAxiosError(err)) {
                setError(
                    `Could not update patron. ${err.message}${
                        err.response ? ` (status ${err.response.status})` : ''
                    }`
                );
            } else {
                setError('Could not update patron.');
            }
        } finally {
            setIsSaving(false);
        }
    }

    async function handleDelete() {
        if (!patron) return;
        if (!window.confirm('Delete this patron? This cannot be undone.')) return;
        try {
            setIsDeleting(true);
            setError(null);
            await deletePatron(patron.id);
            navigate('/patrons', { replace: true });
        } catch (err: unknown) {
            console.error('Error deleting patron:', err);
            if (axios.isAxiosError(err)) {
                setError(
                    `Could not delete patron. ${err.message}${
                        err.response ? ` (status ${err.response.status})` : ''
                    }`
                );
            } else {
                setError('Could not delete patron.');
            }
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <div className="space-y-4 text-base leading-relaxed text-slate-900">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold text-brand-primary">
                        Patron details
                    </h1>
                    <p className="text-sm text-slate-600">
                        View and manage patron information.
                    </p>
                </div>
                <Link
                    to="/patrons"
                    className="text-sm font-medium text-brand-primary hover:underline"
                >
                    Back to patrons
                </Link>
            </div>

            {isLoading && (
                <p className="text-sm text-slate-600">Loading patron...</p>
            )}

            {error && <p className="text-sm text-red-600 whitespace-pre-wrap">{error}</p>}

            {!isLoading && !error && patron && (
                <form
                    onSubmit={handleSave}
                    className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                    <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-700">
                                Name
                            </label>
                            <input
                                className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-700">
                                Email
                            </label>
                            <input
                                className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="rounded bg-brand-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-secondary disabled:opacity-60"
                        >
                            {isSaving ? 'Saving...' : 'Save changes'}
                        </button>
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="rounded border border-red-300 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete patron'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
