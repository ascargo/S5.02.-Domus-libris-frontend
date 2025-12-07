import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from '../components/Layout/AppLayout';
import { HomePage } from '../pages/HomePage';
import { BooksPage } from '../pages/BooksPage';
import { AdminBooksPage } from '../pages/AdminBooksPage';
import { DashboardPage } from '../pages/DashboardPage';
import { PatronsPage } from '../pages/PatronsPage';
import { PatronDetailPage } from '../pages/PatronDetailPage';
import { LoansPage } from '../pages/LoansPage';
import { MyLoansPage } from '../pages/MyLoansPage';
import { LoginPage } from '../pages/LoginPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { isAdmin } from '../auth/auth';

function BooksRoute() {
    return isAdmin() ? <AdminBooksPage /> : <BooksPage />;
}

export function AppRouter() {
    return (
        <BrowserRouter>
            <AppLayout>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/books" element={<BooksRoute />} />
                    <Route path="/admin/books" element={<AdminBooksPage />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/patrons" element={<PatronsPage />} />
                    <Route path="/patrons/:id" element={<PatronDetailPage />} />
                    <Route path="/loans" element={<LoansPage />} />
                    <Route path="/my-loans" element={<MyLoansPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </AppLayout>
        </BrowserRouter>
    );
}
