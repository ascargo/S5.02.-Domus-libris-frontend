// src/pages/PatronsPage.tsx
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
    getPatrons,
    createPatron,
    updatePatron,
    deletePatron,
} from '../api/patronsApi';
import type { Patron } from '../types/patron';
import { isAdmin, isLoggedIn } from '../auth/auth';

export function PatronsPage() {
    const [patrons, setPatrons] = useState<Patron[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newName, setNewName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const authed = isLoggedIn();
    const admin = isAdmin();

    async function loadPatrons() {
        if (!admin) return;
        try {
            setIsLoading(true);
            setError(null);
            const data = await getPatrons();
            setPatrons(data);
        } catch (err: unknown) {
            console.error('Error loading patrons:', err);
            if (axios.isAxiosError(err)) {
                setError(
                    `Could not load patrons. ${err.message}${
                        err.response ? ` (status ${err.response.status})` : ''
                    }`
                );
            } else {
                setError('Could not load patrons.');
            }
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (!admin) return;
        loadPatrons();
    }, [admin]);

    async function handleCreate(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            setError(null);
            await createPatron({ name: newName, email: newEmail });
            setNewName('');
            setNewEmail('');
            await loadPatrons();
        } catch (err: unknown) {
            console.error('Error creating patron:', err);
            if (axios.isAxiosError(err)) {
                setError(
                    `Could not create patron. ${err.message}${
                        err.response ? ` (status ${err.response.status})` : ''
                    }`
                );
            } else {
                setError('Could not create patron.');
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    function startEdit(patron: Patron) {
        setEditingId(patron.id);
        setEditName(patron.name);
        setEditEmail(patron.email);
    }

    function cancelEdit() {
        setEditingId(null);
        setEditName('');
        setEditEmail('');
    }

    async function handleUpdate(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!editingId) return;
        try {
            setIsSubmitting(true);
            setError(null);
            await updatePatron(editingId, { name: editName, email: editEmail });
            cancelEdit();
            await loadPatrons();
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
            setIsSubmitting(false);
        }
    }

    async function handleDelete(id: number) {
        if (!window.confirm('Delete this patron? This cannot be undone.')) return;
        try {
            setDeletingId(id);
            setError(null);
            await deletePatron(id);
            await loadPatrons();
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
            setDeletingId(null);
        }
    }

    if (!authed || !admin) {
        return (
            <div className="mx-auto max-w-3xl text-center text-sm text-slate-700">
                You must be an admin to view patrons.
            </div>
        );
    }

    return (
        <div className="space-y-4 text-base leading-relaxed text-slate-900">
            <div className="space-y-1">
                <h1 className="text-2xl font-semibold text-brand-primary">Patrons</h1>
                <p className="text-sm text-slate-600">Manage registered patrons.</p>
            </div>

            <form
                onSubmit={editingId ? handleUpdate : handleCreate}
                className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-brand-primary">
                        {editingId ? 'Edit patron' : 'Add a new patron'}
                    </h2>
                    <span className="text-[11px] font-medium text-slate-500">
                        Admin tools
                    </span>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                    <input
                        className="rounded border border-slate-300 px-3 py-2 text-sm"
                        placeholder="Name"
                        value={editingId ? editName : newName}
                        onChange={(e) =>
                            editingId ? setEditName(e.target.value) : setNewName(e.target.value)
                        }
                        required
                    />
                    <input
                        className="rounded border border-slate-300 px-3 py-2 text-sm"
                        placeholder="Email"
                        type="email"
                        value={editingId ? editEmail : newEmail}
                        onChange={(e) =>
                            editingId ? setEditEmail(e.target.value) : setNewEmail(e.target.value)
                        }
                        required
                    />
                </div>
                <div className="flex gap-3">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="rounded bg-brand-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-secondary disabled:opacity-60"
                    >
                        {isSubmitting
                            ? editingId
                                ? 'Saving...'
                                : 'Creating...'
                            : editingId
                              ? 'Save changes'
                              : 'Create patron'}
                    </button>
                    {editingId && (
                        <button
                            type="button"
                            onClick={cancelEdit}
                            className="rounded border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>

            {isLoading && (
                <p className="text-sm text-slate-600">Loading patrons...</p>
            )}

            {error && <p className="text-sm text-red-600 whitespace-pre-wrap">{error}</p>}

            {!isLoading && !error && patrons.length === 0 && (
                <p className="text-sm text-slate-600">No patrons yet.</p>
            )}

            {!isLoading && !error && patrons.length > 0 && (
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <table className="min-w-full divide-y divide-slate-200 text-sm">
                        <thead className="bg-brand-tertiary/30 text-left font-semibold text-brand-primary">
                            <tr>
                                <th className="px-4 py-2">Name</th>
                                <th className="px-4 py-2">Email</th>
                                <th className="px-4 py-2">ID</th>
                                <th className="px-4 py-2 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {patrons.map((patron) => (
                                <tr key={patron.id}>
                                    <td className="px-4 py-2">{patron.name}</td>
                                    <td className="px-4 py-2">{patron.email}</td>
                                    <td className="px-4 py-2">{patron.id}</td>
                                    <td className="px-4 py-2 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link
                                                to={`/patrons/${patron.id}`}
                                                className="rounded border border-slate-300 px-2 py-1 text-xs text-brand-primary hover:bg-slate-50"
                                            >
                                                View
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={() => startEdit(patron)}
                                                className="rounded border border-slate-300 px-2 py-1 text-xs text-brand-primary hover:bg-slate-50"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(patron.id)}
                                                disabled={deletingId === patron.id}
                                                className="rounded border border-red-300 px-2 py-1 text-xs text-red-700 hover:bg-red-50 disabled:opacity-60"
                                            >
                                                {deletingId === patron.id ? 'Deleting...' : 'Delete'}
                                            </button>
                                        </div>
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
