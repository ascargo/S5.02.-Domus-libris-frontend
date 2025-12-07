// src/api/loansApi.ts
import axios from 'axios';
import { apiClient } from './apiClient';
import type { ApiResponse } from '../types/api';
import type { Loan } from '../types/loan';

export interface CreateLoanPayload {
    book_id: number;
    patron_id: number;
    loaned_at: string;
    due_at: string;
}

type LoanQuery = {
    page?: number;
    per_page?: number | 'all';
};

export async function getLoans(params?: LoanQuery): Promise<Loan[]> {
    const response = await apiClient.get<ApiResponse<Loan[]>>('/loans', {
        params,
    });
    return response.data.data;
}

export async function getMyLoans(params?: LoanQuery): Promise<Loan[]> {
    try {
        const response = await apiClient.get<ApiResponse<Loan[]>>('/loans/my', {
            params,
        });
        return response.data.data;
    } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
            // Some backends expose the patron route as /my/loans instead.
            const fallback = await apiClient.get<ApiResponse<Loan[]>>('/my/loans', {
                params,
            });
            return fallback.data.data;
        }
        throw error;
    }
}

export async function createLoan(payload: CreateLoanPayload): Promise<Loan> {
    const response = await apiClient.post<ApiResponse<Loan>>('/loans', payload);
    return response.data.data;
}

export async function updateLoan(
    id: number,
    payload: Partial<Loan>
): Promise<Loan> {
    const response = await apiClient.put<ApiResponse<Loan>>(`/loans/${id}`, payload);
    return response.data.data;
}

export async function deleteLoan(id: number): Promise<void> {
    await apiClient.delete(`/loans/${id}`);
}
