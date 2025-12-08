Domus Libris (Frontend)

Domus Libris is a small “homey” library app for:

- Browsing the public catalogue.
- Patrons: requesting an account, logging in, viewing their profile and loans.
- Admins: managing books, patrons, and loans, plus viewing dashboard stats.

How to Use Domus Libris

Public area

- Home / About: overview of the library.
- Catalogue: browse books (public).
- Become a patron: request an account and log in as a patron.

Patron area

- Profile: view/update name/email.
- My loans: view personal loans.
- Dashboard: basic stats (if enabled for patrons).

Admin area

- Dashboard: total books, loans, active loans/patrons, recent books.
- Books: search, paginate, add/edit/delete, view details.
- Patrons: search, paginate, create/edit/delete patrons.
- Loans: create/edit/delete/return loans, filter/search, only show available books for lending.

🚀 Technologies

**Backend (API)**

- Laravel 12 + Passport (Bearer token auth)
- PHP 8.2
- MySQL

**Frontend**

- React + Vite
- TypeScript
- Tailwind CSS
- Axios for API calls
- React Router

📦 Installation & Setup

1. Clone repositories
   Backend:

git clone https://github.com/ascargo/Sprint5.-lms_api.git - domus-libris-api
cd domus-libris-api

Frontend:
git clone https://github.com/ascargo/S5.02.-Domus-libris-frontend.git - domus-libris-frontend
cd domus-libris-frontend

```

2) Backend (Laravel API)

cd domus-libris-api
composer install
cp .env.example .env
php artisan key:generate


Configure '.env' for MySQL:
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=lms_api
DB_USERNAME=your_mysql_user
DB_PASSWORD=your_mysql_password

- Create the database manually if needed:
  sql
  CREATE DATABASE domus_libris CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
- Ensure your MySQL user has privileges on that DB.

Then run:
php artisan migrate --seed
note: For a clean setup: use an empty DB or run php artisan migrate:fresh --seed (this drops/recreates tables, wiping existing data).
php artisan passport:install
php artisan serve

API base URL (default): `http://127.0.0.1:8000`

3) Frontend (React + Vite)
cd S5.02.-Domus-libris-frontend
cd domus-libris-frontend
npm install

create a '.env.local' file with
VITE_API_BASE_URL=http://127.0.0.1:8000 in it.

Run the dev server:
npm run dev

Frontend: `http://localhost:5173`

🔑 Authentication (API)
Key endpoints:
- `POST /api/v1/auth/register` → create patron + token
- `POST /api/v1/auth/login` → authenticate + token
- `GET /api/v1/patrons/me` → current user
- Loans (admin): `GET/POST/PUT/DELETE /api/v1/loans`
- Patron loans: `GET /api/v1/loans/my` (fallback `/my/loans`)

All private requests require:

Authorization: Bearer <TOKEN>
Accept: application/json


Seeder credentials (if provided by backend):
- Admin: `admin@example.com` / `password`
- Patron: `user@example.com` / `password`

📚 Features (Frontend)
- Public: Home, About, Catalogue, Become-a-patron signup, Login.
- Patron: Profile edit (name/email), My loans, basic dashboard view.
- Admin: Dashboard stats + recent books, Books CRUD with search/pagination/view, Patrons CRUD with search/pagination, Loans create/edit/return/delete with filtering.
- UI: Warm “home library” theme, brand palette, consistent cards/tables, focus-visible states, responsive layout.

🗂️ Project Structure (Frontend)
src/
├── api/          # Axios API calls (auth, books, patrons, loans, dashboard)
├── auth/         # Token/user helpers
├── components/   # Layout, shared UI (StatusTag, etc.)
├── pages/        # Home, About, BecomePatron, Login, Books, Patrons, Loans, Dashboard, Profile
├── types/        # TypeScript types (auth, book, patron, loan, api response)
├── index.css     # Global Tailwind layers (cards/tables, base styles)
└── router/       # AppRouter with public/admin routes

## 🎨 Styling
- Brand palette:
  - `brand.primary:   #22333B`
  - `brand.secondary: #950952`
  - `brand.tertiary:  #A0C1D1`
  - `brand.accent1:   #F5F2B2`
  - `brand.accent2:   #B8C480`
- Typography: extended sans/display stack in Tailwind; base gradient background; reusable `.dl-card` and `.dl-table`.

🧪 Best Practices
- Use feature branches and merge into develop/main.
- Keep `.env` files out of version control.
- Ensure backend is running (Passport keys, migrations) before testing the frontend.
- For patron endpoints, ensure the correct path (`/loans/my` or `/my/loans`) is available.
```
