// src/types/auth.ts

export interface User {
    id: number;
    name: string;
    email: string;
    role: string | null;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;       // our normalized token field
    tokenType: string;   // "Bearer"
    user: User;
}
