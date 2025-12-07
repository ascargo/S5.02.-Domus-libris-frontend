// src/pages/MyProfilePage.tsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import {
    getMyPatronProfile,
    updateMyPatronProfile,
    type UpdatePatronPayload,
} from '../api/patronsApi';
import type { Patron } from '../types/patron';
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
        </div>
    );
}
