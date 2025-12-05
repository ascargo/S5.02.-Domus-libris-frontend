// src/api/booksApi.ts
import { apiClient } from './apiClient';
import type { ApiResponse } from '../types/api';
import type { Book } from '../types/book';

export async function getBooks(): Promise<Book[]> {
    const response = await apiClient.get<ApiResponse<Book[]> | Book[]>('/books');
    const data = response.data as any;

    if (Array.isArray(data?.data)) {
        return (data as ApiResponse<Book[]>).data;
    }

    if (Array.isArray(data)) {
        return data as Book[];
    }

    console.warn('Unexpected API shape for GET /books:', data);
    return [];
}

export async function createBook(payload: Omit<Book, 'id'>): Promise<Book> {
    const response = await apiClient.post<ApiResponse<Book> | Book>('/books', payload);
    const data = response.data as any;

    if (data?.data) {
        return (data as ApiResponse<Book>).data;
    }

    return data as Book;
}
