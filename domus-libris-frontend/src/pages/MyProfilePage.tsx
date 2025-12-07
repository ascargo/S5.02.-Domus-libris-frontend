// src/pages/MyProfilePage.tsx
import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import axios from 'axios';
import { isLoggedIn, getCurrentUser } from '../auth/auth';
import {
    getMyPatronProfile,
    updateMyPatronProfile,
} from '../api/patronsApi';
import type { Patron } from '../types/patron';
import { Link } from 'react-router-dom';

export function MyProfilePage() {
    const [profile, setProfile] = useState<Patron | null>(null);
    const storedUser = useMemo(() => getCurrentUser(), []);
    const [name, setName] = useState(storedUser?.name ?? '');
    const [email, setEmail] = useState(storedUser?.email ?? '');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const authed = isLoggedIn();

    useEffect(() => {
        if (!authed) return;
        async function loadProfile() {
            try {
                setIsLoading(true);
                setError(null);
                const data = await getMyPatronProfile();
                // If the backend returns a different user than the stored token user, prefer the local one.
                if (storedUser && data.email !== storedUser.email) {
                    setProfile({
                        ...data,
                        name: storedUser.name,
                        email: storedUser.email,
                    });
                    setName(storedUser.name);
                    setEmail(storedUser.email);
                } else {
                    setProfile(data);
                    setName(data.name);
                    setEmail(data.email);
                }
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
    }, [authed, storedUser?.email, storedUser?.name]);

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            setError(null);
            setSuccess(null);
            const updated = await updateMyPatronProfile({ name, email });
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

    if (!authed) {
        return (
            <main className="mx-auto max-w-5xl px-4 py-6 text-base leading-relaxed text-slate-900">
                <h1 className="text-2xl font-semibold text-brand-primary">My profile</h1>
                <p className="text-sm text-slate-700">
                    You must be logged in to view your profile.
                </p>
                <Link
                    to="/login"
                    className="mt-3 inline-flex items-center rounded bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-secondary"
                >
                    Go to login
                </Link>
            </main>
        );
    }

    return (
        <main className="mx-auto max-w-5xl space-y-4 px-4 py-6 text-base leading-relaxed text-slate-900">
            <div className="space-y-1">
                <h1 className="text-2xl font-semibold text-brand-primary">My profile</h1>
                <p className="text-sm text-slate-600">
                    Update your account information.
                </p>
            </div>

            {isLoading && <p className="text-sm text-slate-600">Loading profile...</p>}
            {error && <p className="text-sm text-red-600 whitespace-pre-wrap">{error}</p>}

            {!isLoading && !error && profile && (
                <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-3">
                        <div className="space-y-1">
                            <label
                                className="block text-xs font-medium text-slate-700"
                                htmlFor="profile-name"
                            >
                                Name
                            </label>
                            <input
                                id="profile-name"
                                className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <label
                                className="block text-xs font-medium text-slate-700"
                                htmlFor="profile-email"
                            >
                                Email
                            </label>
                            <input
                                id="profile-email"
                                type="email"
                                className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        {success && (
                            <p className="text-sm text-green-700">{success}</p>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="rounded bg-brand-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-secondary disabled:opacity-60"
                        >
                            {isSubmitting ? 'Saving...' : 'Save changes'}
                        </button>
                    </form>
                </section>
            )}
        </main>
    );
}
