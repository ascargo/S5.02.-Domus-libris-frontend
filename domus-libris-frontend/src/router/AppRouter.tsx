import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from '../components/Layout/AppLayout';
import { HomePage } from '../pages/HomePage';
import { BooksPage } from '../pages/BooksPage';
import { AdminBooksPage } from '../pages/AdminBooksPage';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { NotFoundPage } from '../pages/NotFoundPage';

export function AppRouter() {
    return (
        <BrowserRouter>
            <AppLayout>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/books" element={<BooksPage />} />
                    <Route path="/admin/books" element={<AdminBooksPage />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </AppLayout>
        </BrowserRouter>
    );
}
