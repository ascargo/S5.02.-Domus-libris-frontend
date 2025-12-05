import type { ReactNode } from 'react';

export type BookStatus = 'available' | 'loaned' | 'reserved' | 'lost' | 'missing';

interface StatusTagProps {
    status: BookStatus;
}

const STATUS_STYLES: Record<BookStatus, string> = {
    available: 'bg-brand-softGreen text-brand-primary border-brand-softGreen',
    loaned: 'bg-brand-softYellow text-brand-primary border-brand-softYellow',
    reserved: 'bg-brand-tertiary text-brand-primary border-brand-tertiary',
    lost: 'bg-white text-brand-secondary border-brand-secondary',
    missing: 'bg-white text-brand-secondary border-brand-secondary',
};

const STATUS_LABELS: Record<BookStatus, ReactNode> = {
    available: 'Available',
    loaned: 'Loaned',
    reserved: 'Reserved',
    lost: 'Lost',
    missing: 'Missing',
};

export function StatusTag({ status }: StatusTagProps) {
    const classes = STATUS_STYLES[status];
    const label = STATUS_LABELS[status];

    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${classes}`}
        >
            {label}
        </span>
    );
}
