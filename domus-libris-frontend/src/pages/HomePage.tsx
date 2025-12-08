// src/pages/HomePage.tsx
import { Link } from 'react-router-dom';

function BookStack() {
    return (
        <div className="relative overflow-hidden rounded-3xl bg-brand-tertiary/25 p-6 shadow-sm">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.45),_transparent)]" />
            <div className="relative flex h-56 items-end gap-3">
                <div className="h-40 w-10 rotate-[-4deg] rounded-md bg-brand-secondary/80 shadow-brand" />
                <div className="h-48 w-12 rotate-[3deg] rounded-md bg-brand-primary/80 shadow-brand" />
                <div className="h-36 w-9 rotate-[-2deg] rounded-md bg-brand-accent2/80 shadow-brand" />
                <div className="h-52 w-14 rotate-[2deg] rounded-md bg-brand-accent1/80 shadow-brand" />
                <div className="h-32 w-8 rotate-[-5deg] rounded-md bg-brand-tertiary/70 shadow-brand" />
            </div>
            <div className="mt-4 h-1.5 rounded-full bg-brand-primary/40" />
        </div>
    );
}

export function HomePage() {
    return (
        <main className="mx-auto max-w-6xl space-y-10 px-4 py-8 text-base leading-relaxed text-slate-900">
            <section className="grid gap-8 rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-brand md:grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)] md:p-8">
                <div className="space-y-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-secondary">
                        Welcome to
                    </p>
                    <h1 className="text-4xl font-bold text-brand-primary md:text-5xl">
                        Domus Libris
                    </h1>
                    <p className="max-w-2xl text-lg text-slate-700">
                        A warm, small library to care for our shared stories. Browse the catalogue,
                        become a patron, or log in to help manage the collection.
                    </p>
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <Link
                            to="/books"
                            className="inline-flex items-center justify-center rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand.secondary focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                        >
                            Browse books
                        </Link>
                        <Link
                            to="/become-a-patron"
                            className="inline-flex items-center justify-center rounded-lg border border-brand-primary px-5 py-2.5 text-sm font-semibold text-brand-primary transition hover:bg-brand-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand.secondary focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                        >
                            Become a patron
                        </Link>
                    </div>
                </div>
                <BookStack />
            </section>

            <section className="dl-card space-y-3">
                <h2 className="text-xl font-semibold text-brand-primary">What you can do</h2>
                <p className="text-slate-700 max-w-3xl">
                    Domus Libris keeps the essentials simple: track books, manage loans, and
                    welcome readers into the collection. Everyone has a place here.
                </p>
                <ul className="list-disc space-y-2 pl-5 text-slate-800">
                    <li>Browse the public catalogue anytime.</li>
                    <li>Request a patron account to borrow books.</li>
                    <li>Admins can manage books, patrons, and loans.</li>
                </ul>
            </section>
        </main>
    );
}
