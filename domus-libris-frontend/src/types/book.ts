export interface Book {
    id: number;
    title: string;
    author: string;
    isbn: string;
    year: number|null;
    genre: string;
    collection?: string;
    location?: string;
    cover_path?: string;
}
