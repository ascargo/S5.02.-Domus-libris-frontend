import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from '../components/Layout/AppLayout';
import { HomePage } from '../pages/HomePage';
import { BooksPage } from '../pages/BooksPage';
import { DashboardPage } from '../pages/DashboardPage';
import { PatronsPage } from '../pages/PatronsPage';
import { PatronDetailPage } from '../pages/PatronDetailPage';
import { LoansPage } from '../pages/LoansPage';
import { MyLoansPage } from '../pages/MyLoansPage';
import { MyProfilePage } from '../pages/MyProfilePage';
import { LoginPage } from '../pages/LoginPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { AboutPage } from '../pages/AboutPage';
import { BecomePatronPage } from '../pages/BecomePatronPage';

export function AppRouter() {
    return (
        <BrowserRouter>
            <AppLayout>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/become-a-patron" element={<BecomePatronPage />} />
                    <Route path="/books" element={<BooksPage />} />
                    <Route path="/admin/books" element={<BooksPage />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/patrons" element={<PatronsPage />} />
                    <Route path="/patrons/:id" element={<PatronDetailPage />} />
                    <Route path="/loans" element={<LoansPage />} />
                    <Route path="/my-loans" element={<MyLoansPage />} />
                    <Route path="/my-profile" element={<MyProfilePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </AppLayout>
        </BrowserRouter>
    );
}
