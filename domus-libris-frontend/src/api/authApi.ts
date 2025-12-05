// src/api/authApi.ts
import { apiClient } from './apiClient';
import type { LoginCredentials, LoginResponse, User } from '../types/auth';

interface RawLoginResponse {
    access_token: string;
    token_type: string;
    user: User;
}

export async function login(
    credentials: LoginCredentials
): Promise<LoginResponse> {
    const response = await apiClient.post<RawLoginResponse>(
        '/auth/login',
        credentials
    );

    const data = response.data;

    if (!data.access_token) {
        throw new Error('Login response did not contain an access_token');
    }

    return {
        token: data.access_token,
        tokenType: data.token_type,
        user: data.user,
    };
}
