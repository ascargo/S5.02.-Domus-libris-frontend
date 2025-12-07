// src/pages/PatronsPage.tsx
import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import axios from 'axios';
import { getPatrons, createPatron, updatePatron, deletePatron } from '../api/patronsApi';
import type { Patron } from '../types/patron';

type RoleFilter = 'all' | 'admin' | 'patron';

export function PatronsPage() {
    const [patrons, setPatrons] = useState<Patron[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');

    const [editingPatron, setEditingPatron] = useState<Patron | null>(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<string>('patron');
    const [formError, setFormError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const [page, setPage] = useState(1);
    const pageSize = 10;

    useEffect(() => {
        loadPatrons();
    }, []);

    useEffect(() => {
        setPage(1);
    }, [patrons, search, roleFilter]);

    async function loadPatrons() {
        try {
            setIsLoading(true);
            setError(null);
            const data = await getPatrons();
            setPatrons(data);
        } catch (err: unknown) {
            console.error('Error loading patrons:', err);
            if (axios.isAxiosError(err)) {
                setError(
                    `Could not load patrons. ${
                        err.response?.data?.message ?? err.message
                    }${err.response ? ` (status ${err.response.status})` : ''}`
                );
            } else {
                setError('Could not load patrons.');
            }
        } finally {
            setIsLoading(false);
        }
    }

    function resetForm() {
        setEditingPatron(null);
        setName('');
        setEmail('');
        setRole('patron');
        setFormError(null);
    }

    function startEdit(patron: Patron) {
        if (isSubmitting || deletingId) return;
        setEditingPatron(patron);
        setName(patron.name);
        setEmail(patron.email);
        const maybeRole = (patron as { role?: string }).role;
        if (maybeRole) setRole(maybeRole);
    }

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            setFormError(null);
            // TODO: send role when backend supports it
            const payload = { name, email };
            if (editingPatron) {
                await updatePatron(editingPatron.id, payload);
            } else {
                await createPatron(payload);
            }
            resetForm();
            await loadPatrons();
        } catch (err: unknown) {
            console.error('Error saving patron:', err);
            if (axios.isAxiosError(err)) {
                setFormError(
                    `Could not save patron. ${
                        err.response?.data?.message ?? err.message
                    }${err.response ? ` (status ${err.response.status})` : ''}`
                );
            } else {
                setFormError('Could not save patron.');
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleDelete(id: number) {
        if (
            !window.confirm(
                'Are you sure you want to delete this patron? This cannot be undone and will remove their access to the system.'
            )
        )
            return;

        try {
            setDeletingId(id);
            setError(null);
            await deletePatron(id);
            await loadPatrons();
        } catch (err: unknown) {
            console.error('Error deleting patron:', err);
            if (axios.isAxiosError(err)) {
                setError(
                    `Could not delete patron. ${
                        err.response?.data?.message ?? err.message
                    }${err.response ? ` (status ${err.response.status})` : ''}`
                );
            } else {
                setError('Could not delete patron.');
            }
        } finally {
            setDeletingId(null);
        }
    }

    const filteredPatrons = useMemo(() => {
        const term = search.toLowerCase();
        return patrons.filter((patron) => {
            const matchesTerm =
                patron.name.toLowerCase().includes(term) ||
                patron.email.toLowerCase().includes(term);

            const patronRole = (patron as { role?: string }).role ?? 'patron';
            const matchesRole =
                roleFilter === 'all' ||
                (roleFilter === 'admin' && patronRole === 'admin') ||
                (roleFilter === 'patron' && patronRole !== 'admin');

            return matchesTerm && matchesRole;
        });
    }, [patrons, search, roleFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredPatrons.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    const paginatedPatrons = filteredPatrons.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    const emptyStateMessage =
        patrons.length === 0
            ? 'No patrons found. Try creating one above.'
            : filteredPatrons.length === 0
              ? 'No patrons match your search or role filter.'
              : '';

    return (
        <main className="mx-auto max-w-5xl space-y-4 px-4 py-6 text-base leading-relaxed text-slate-900">
            <div className="space-y-1">
                <h1 className="text-2xl font-semibold text-brand-primary">Patrons</h1>
                <p className="text-sm text-slate-600">
                    Manage library patrons: admins and readers.
                </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <input
                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm sm:max-w-sm"
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <select
                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm sm:w-48"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
                >
                    <option value="all">All roles</option>
                    <option value="admin">Admin only</option>
                    <option value="patron">Patron only</option>
                </select>
            </div>

            <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h2 className="text-sm font-semibold text-brand-primary">
                            {editingPatron
                                ? `Edit patron: ${editingPatron.name || editingPatron.email}`
                                : 'Create new patron'}
                        </h2>
                        {editingPatron && (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="text-xs text-slate-600 hover:text-slate-800"
                            >
                                Cancel edit
                            </button>
                        )}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="grid gap-3 md:grid-cols-2">
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
                        <div className="space-y-1 md:col-span-2">
                            <label
                                className="block text-xs font-medium text-slate-700"
                                htmlFor="patron-role"
                            >
                                Role
                            </label>
                            <div className="flex items-center gap-2 md:max-w-xs">
                                <select
                                    id="patron-role"
                                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                >
                                    <option value="patron">Patron</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <p className="text-xs text-slate-500">
                                {/* TODO: send role to backend when supported */}
                                Role selection will take effect when backend supports it.
                            </p>
                        </div>
                    </div>

                    {formError && (
                        <p className="text-sm text-red-600 whitespace-pre-wrap">{formError}</p>
                    )}

                    <div className="flex flex-wrap gap-2">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="rounded bg-brand-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-secondary disabled:opacity-60"
                        >
                            {isSubmitting
                                ? editingPatron
                                    ? 'Saving...'
                                    : 'Creating...'
                                : editingPatron
                                  ? 'Save changes'
                                  : 'Create patron'}
                        </button>
                        {editingPatron && (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="rounded border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                            >
                                Cancel edit
                            </button>
                        )}
                    </div>
                </form>
            </section>

            {isLoading && (
                <p className="text-sm text-slate-600">Loading patrons...</p>
            )}

            {error && <p className="text-sm text-red-600 whitespace-pre-wrap">{error}</p>}

            {!isLoading && !error && (
                <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="mb-2 flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-brand-primary">All patrons</h2>
                        <span className="text-xs text-slate-600">
                            Showing {filteredPatrons.length} of {patrons.length} patrons
                        </span>
                    </div>
                    {filteredPatrons.length === 0 ? (
                        <p className="mt-3 text-sm text-slate-600">{emptyStateMessage}</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 text-sm">
                                <thead className="bg-brand-tertiary/30 text-left font-semibold text-brand-primary">
                                    <tr>
                                        <th scope="col" className="px-4 py-2">
                                            Name
                                        </th>
                                        <th scope="col" className="px-4 py-2">
                                            Email
                                        </th>
                                        <th scope="col" className="px-4 py-2">
                                            Role
                                        </th>
                                        <th scope="col" className="px-4 py-2 text-right">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {paginatedPatrons.map((patron) => {
                                        const patronRole =
                                            (patron as { role?: string }).role ?? 'patron';
                                        return (
                                            <tr key={patron.id}>
                                                <td className="px-4 py-2">{patron.name}</td>
                                                <td className="px-4 py-2">{patron.email}</td>
                                                <td className="px-4 py-2">
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                                            patronRole === 'admin'
                                                                ? 'bg-brand-secondary/10 text-brand-secondary'
                                                                : 'bg-brand-tertiary/30 text-brand-primary'
                                                        }`}
                                                    >
                                                        {patronRole === 'admin' ? 'Admin' : 'Patron'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => startEdit(patron)}
                                                            className="rounded border border-slate-300 px-2 py-1 text-xs text-brand-primary hover:bg-slate-50"
                                                            aria-label={`Edit patron ${patron.name}`}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDelete(patron.id)}
                                                            disabled={deletingId === patron.id}
                                                            className="rounded border border-red-300 px-2 py-1 text-xs text-red-700 hover:bg-red-50 disabled:opacity-60"
                                                            aria-label={`Delete patron ${patron.name}`}
                                                        >
                                                            {deletingId === patron.id
                                                                ? 'Deleting...'
                                                                : 'Delete'}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            <div className="mt-4 flex flex-col gap-2 text-sm text-slate-700 sm:flex-row sm:items-center sm:justify-between">
                                <span>
                                    Showing{' '}
                                    {filteredPatrons.length === 0
                                        ? 0
                                        : (currentPage - 1) * pageSize + 1}{' '}
                                    -{' '}
                                    {Math.min(
                                        currentPage * pageSize,
                                        filteredPatrons.length
                                    )}{' '}
                                    of {filteredPatrons.length} patrons
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        disabled={currentPage === 1}
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        className="rounded border border-slate-300 px-3 py-1 disabled:opacity-50"
                                    >
                                        Previous
                                    </button>
                                    <span>
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <button
                                        type="button"
                                        disabled={currentPage === totalPages}
                                        onClick={() =>
                                            setPage((p) => Math.min(totalPages, p + 1))
                                        }
                                        className="rounded border border-slate-300 px-3 py-1 disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </section>
            )}
        </main>
    );
}
