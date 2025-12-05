// src/auth/auth.ts
import type { User } from '../types/auth';
import { apiClient } from '../api/apiClient';

const TOKEN_KEY = 'domus_libris_token';
const USER_KEY = 'domus_libris_user';

export function getToken(): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
    if (typeof localStorage === 'undefined') return;

    if (token) {
        localStorage.setItem(TOKEN_KEY, token);
        apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
        localStorage.removeItem(TOKEN_KEY);
        delete apiClient.defaults.headers.common.Authorization;
    }
}

export function getCurrentUser(): User | null {
    if (typeof localStorage === 'undefined') return null;

    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;

    try {
        return JSON.parse(raw) as User;
    } catch (err) {
        console.warn('Failed to parse stored user', err);
        return null;
    }
}

export function setCurrentUser(user: User | null): void {
    if (typeof localStorage === 'undefined') return;

    if (user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
        localStorage.removeItem(USER_KEY);
    }
}

export function isLoggedIn(): boolean {
    return !!getToken();
}

export function isAdmin(): boolean {
    const user = getCurrentUser();
    return !!user && user.role === 'admin';
}

export function clearAuth(): void {
    setToken(null);
    setCurrentUser(null);
}

const existingToken = getToken();
if (existingToken) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${existingToken}`;
}
