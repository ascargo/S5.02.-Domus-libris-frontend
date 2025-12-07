// src/api/patronsApi.ts
import { apiClient } from './apiClient';
import type { ApiResponse } from '../types/api';
import type { Patron } from '../types/patron';

export type CreatePatronPayload = Omit<Patron, 'id'>;
export type UpdatePatronPayload = Partial<CreatePatronPayload>;

export async function getPatrons(): Promise<Patron[]> {
    // Request a larger page size to surface more entries client-side
    const response = await apiClient.get<ApiResponse<Patron[]>>('/patrons?per_page=100');
    return response.data.data;
}

export async function getPatron(id: number): Promise<Patron> {
    const response = await apiClient.get<ApiResponse<Patron>>(`/patrons/${id}`);
    return response.data.data;
}

export async function createPatron(payload: CreatePatronPayload): Promise<Patron> {
    const response = await apiClient.post<ApiResponse<Patron>>('/patrons', payload);
    return response.data.data;
}

export async function updatePatron(
    id: number,
    payload: UpdatePatronPayload
): Promise<Patron> {
    const response = await apiClient.put<ApiResponse<Patron>>(
        `/patrons/${id}`,
        payload
    );
    return response.data.data;
}

export async function deletePatron(id: number): Promise<void> {
    await apiClient.delete(`/patrons/${id}`);
}

export async function getMyPatronProfile(): Promise<Patron> {
    const response = await apiClient.get<ApiResponse<Patron>>('/patrons/me');
    return response.data.data;
}

export async function updateMyPatronProfile(
    payload: UpdatePatronPayload
): Promise<Patron> {
    const response = await apiClient.put<ApiResponse<Patron>>(
        '/patrons/me',
        payload
    );
    return response.data.data;
}
