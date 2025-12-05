// src/auth/auth.ts
import { apiClient } from '../api/apiClient';

const TOKEN_KEY = 'domus_libris_token';

export function getToken(): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
    if (typeof localStorage === 'undefined') return;

    if (token) {
        localStorage.setItem(TOKEN_KEY, token);
        apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
        localStorage.removeItem(TOKEN_KEY);
        delete apiClient.defaults.headers.common.Authorization;
    }
}

export function isLoggedIn(): boolean {
    return !!getToken();
}

const existing = getToken();
if (existing) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${existing}`;
}
