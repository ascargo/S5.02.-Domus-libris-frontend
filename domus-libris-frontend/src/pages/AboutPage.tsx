// src/pages/AboutPage.tsx
export function AboutPage() {
    return (
        <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 text-base leading-relaxed text-slate-900">
            <div className="relative overflow-hidden rounded-3xl border border-brand-tertiary/60 bg-white/95 p-6 shadow-brand">
                <div className="absolute left-0 top-0 h-2 w-24 rounded-b-full bg-brand-secondary/80" />
                <h1 className="text-3xl font-semibold text-brand-primary">About Domus Libris</h1>
                <p className="mt-3 max-w-3xl text-slate-700">
                    Domus Libris is a coursework project for a small community library. The frontend
                    is built with React, TypeScript, and Tailwind; the backend runs on Laravel with
                    Passport authentication. Our aim is to keep operations simple while remaining
                    easy to extend and customise.
                </p>
            </div>

            <section className="dl-card space-y-3">
                <h2 className="text-xl font-semibold text-brand-primary">Who can do what?</h2>
                <ul className="mt-2 list-disc space-y-2 pl-5 text-slate-800">
                    <li>
                        <strong>Public visitors:</strong> View the home, about, and public catalogue.
                    </li>
                    <li>
                        <strong>Patrons:</strong> Log in, view their profile, and see their loans.
                    </li>
                    <li>
                        <strong>Admins:</strong> Manage books, patrons, and loans.
                    </li>
                </ul>
            </section>
        </main>
    );
}
