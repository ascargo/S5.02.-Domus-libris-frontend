// src/api/booksApi.ts
import { apiClient } from './apiClient';
import type { ApiResponse } from '../types/api';
import type { Book } from '../types/book';

export type CreateBookPayload = Pick<Book, 'title' | 'author' | 'isbn'> &
    Partial<Pick<Book, 'year' | 'genre' | 'collection' | 'location' | 'cover_path'>>;

export type UpdateBookPayload = Partial<CreateBookPayload>;

export async function getBooks(): Promise<Book[]> {
    const response = await apiClient.get<ApiResponse<Book[]>>('/books');
    return response.data.data;
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
