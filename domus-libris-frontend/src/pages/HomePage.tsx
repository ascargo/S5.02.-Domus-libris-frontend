// src/pages/HomePage.tsx
import { Link } from 'react-router-dom';

export function HomePage() {
    return (
        <main className="mx-auto max-w-5xl space-y-8 px-4 py-6 text-base leading-relaxed text-slate-900">
            <section className="space-y-3 rounded-2xl bg-white px-6 py-8 shadow-sm border border-slate-200">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-secondary">
                    Welcome to
                </p>
                <h1 className="text-4xl font-bold text-brand-primary">Domus Libris</h1>
                <p className="max-w-2xl text-lg text-slate-700">
                    A small library to care for our shared stories. Browse the catalog, become
                    a patron, or sign in to help manage the collection.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                    <Link
                        to="/books"
                        className="inline-flex items-center justify-center rounded bg-brand-primary px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-secondary"
                    >
                        Browse books
                    </Link>
                    <Link
                        to="/become-a-patron"
                        className="inline-flex items-center justify-center rounded border border-brand-primary px-5 py-2 text-sm font-semibold text-brand-primary transition hover:bg-brand-primary/10"
                    >
                        Become a patron
                    </Link>
                </div>
            </section>

            <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-brand-primary">What you can do</h2>
                <p className="text-slate-700">
                    Domus Libris keeps the essentials simple: track books, manage loans, and
                    welcome readers into the collection.
                </p>
                <ul className="list-disc space-y-1 pl-5 text-slate-800">
                    <li>Browse the public catalog anytime.</li>
                    <li>Request a patron account to borrow books.</li>
                    <li>Admins can manage books, patrons, and loans.</li>
                </ul>
            </section>
        </main>
    );
}
