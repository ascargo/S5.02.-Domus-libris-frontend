import { apiClient } from './apiClient';
import type { ApiResponse } from '../types/api';
import type { Book } from '../types/book';

export async function getBooks(): Promise<Book[]> {
    const response = await apiClient.get<ApiResponse<Book[]>>('/books');
    return response.data.data;
}
