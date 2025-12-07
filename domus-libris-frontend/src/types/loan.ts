// src/types/loan.ts
export interface Loan {
    id: number;
    book_id: number;
    patron_id: number;
    status: 'ongoing' | 'returned' | 'overdue' | string;
    loan_date?: string; // legacy
    due_date?: string;  // legacy
    return_date?: string | null; // legacy
    returned_at?: string | null;
    loaned_at?: string;
    due_at?: string;
    book?: {
        id: number;
        title: string;
    };
    patron?: {
        id: number;
        name: string;
        email: string;
    };
}
