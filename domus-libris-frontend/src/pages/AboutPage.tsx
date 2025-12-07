// src/pages/AboutPage.tsx
export function AboutPage() {
    return (
        <main className="mx-auto max-w-5xl space-y-6 px-4 py-6 text-base leading-relaxed text-slate-900">
            <div className="space-y-2">
                <h1 className="text-2xl font-semibold text-brand-primary">About Domus Libris</h1>
                <p className="text-slate-700">
                    Domus Libris is a coursework project for a small community library. The
                    frontend is built with React, TypeScript, and Tailwind; the backend runs on
                    Laravel with Passport authentication.
                </p>
                <p className="text-slate-700">
                    The goal is to keep library operations simple while remaining easy to extend
                    and customise.
                </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-xl font-semibold text-brand-primary">Who can do what?</h2>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-800">
                    <li>
                        <strong>Public visitors:</strong> View the home, about, and public books
                        listing.
                    </li>
                    <li>
                        <strong>Patrons:</strong> Log in, view their profile, and see their loans.
                    </li>
                    <li>
                        <strong>Admins:</strong> Manage books, patrons, and loans.
                    </li>
                </ul>
            </div>
        </main>
    );
}
