// src/api/dashboardApi.ts
import { apiClient } from './apiClient';
import type { ApiResponse } from '../types/api';

export interface DashboardRecentBook {
    id: number;
    title: string;
    author?: string | null;
    genre?: string | null;
    created_at: string;
}

export interface DashboardSummary {
    books_count: number;
    loans_count: number;
    active_loans_count: number;
    active_patrons_count: number;
    recent_books: DashboardRecentBook[];
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
    const response = await apiClient.get<ApiResponse<DashboardSummary> | DashboardSummary>(
        '/dashboard'
    );

    const payload = response.data as ApiResponse<DashboardSummary> | DashboardSummary;

    if ((payload as ApiResponse<DashboardSummary>).data) {
        return (payload as ApiResponse<DashboardSummary>).data;
    }

    return payload as DashboardSummary;
}
