// src/api/booksApi.ts
import { apiClient } from './apiClient';
import type { ApiResponse } from '../types/api';
import type { Book } from '../types/book';

export type CreateBookPayload = Pick<Book, 'title' | 'author' | 'isbn'> &
    Partial<Pick<Book, 'year' | 'genre' | 'collection' | 'location' | 'cover_path'>>;

export type UpdateBookPayload = Partial<CreateBookPayload>;

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

export async function createBook(payload: CreateBookPayload): Promise<Book> {
    const response = await apiClient.post<ApiResponse<Book>>('/books', payload);
    return response.data.data;
}

export async function deleteBook(id: number): Promise<void> {
    await apiClient.delete(`/books/${id}`);
}

export async function updateBook(
    id: number,
    payload: UpdateBookPayload
): Promise<Book> {
    const response = await apiClient.put<ApiResponse<Book>>(
        `/books/${id}`,
        payload
    );
    return response.data.data;
}
