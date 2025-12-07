// src/api/loansApi.ts
import { apiClient } from './apiClient';
import type { ApiResponse } from '../types/api';
import type { Loan } from '../types/loan';

export interface CreateLoanPayload {
    book_id: number;
    patron_id: number;
    loaned_at: string;
    due_at: string;
}

export async function getLoans(): Promise<Loan[]> {
    const response = await apiClient.get<ApiResponse<Loan[]>>('/loans');
    return response.data.data;
}

export async function getMyLoans(): Promise<Loan[]> {
    // patron-scoped endpoint; adjust path here if backend differs
    const response = await apiClient.get<ApiResponse<Loan[]>>('/my/loans');
    return response.data.data;
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
