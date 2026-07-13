import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { lazy, Suspense, useMemo } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import { ToastProvider } from './components/Toast';
import { Loading } from './components/Loading';
import { AuthProvider } from './lib/auth';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';

const Home = lazy(() => import('./pages/Home'));
const PromptDetail = lazy(() => import('./pages/PromptDetail'));
const PromptOutputs = lazy(() => import('./pages/PromptOutputs'));
const Categories = lazy(() => import('./pages/Categories'));
const CategoryView = lazy(() => import('./pages/CategoryView'));
const Trending = lazy(() => import('./pages/Trending'));
const Latest = lazy(() => import('./pages/Latest'));
const Popular = lazy(() => import('./pages/Popular'));
const Search = lazy(() => import('./pages/Search'));
const Contact = lazy(() => import('./pages/Contact'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Admin = lazy(() => import('./pages/Admin'));
const Login = lazy(() => import('./pages/Login'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const PromptForm = lazy(() => import('./pages/PromptForm'));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const AdminProfile = lazy(() => import('./pages/admin/AdminProfile'));
const AdminPrompts = lazy(() => import('./pages/admin/AdminPrompts'));
const AdminPromptDetail = lazy(() => import('./pages/admin/AdminPromptDetail'));

function PageLoader() {
  return <Loading label="Loading page" />;
}

function AppShell() {
  const location = useLocation();
  const isAdmin = useMemo(() =>
    location.pathname.startsWith('/admin'),
  [location.pathname]);

  if (isAdmin) {
    return (
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin/forgot-password" element={<ForgotPassword />} />
          <Route path="/admin/reset-password" element={<ResetPassword />} />
          <Route path="/admin" element={<ProtectedRoute><AdminLayout><Admin /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/new" element={<ProtectedRoute><AdminLayout><PromptForm /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/edit/:id" element={<ProtectedRoute><AdminLayout><PromptForm /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/categories" element={<ProtectedRoute><AdminLayout><AdminCategories /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/analytics" element={<ProtectedRoute><AdminLayout><Admin /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/prompts" element={<ProtectedRoute><AdminLayout><AdminPrompts /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/prompts/:slug" element={<ProtectedRoute><AdminLayout><AdminPromptDetail /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute><AdminLayout><AdminSettings /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/profile" element={<ProtectedRoute><AdminLayout><AdminProfile /></AdminLayout></ProtectedRoute>} />
        </Routes>
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/prompt/:slug" element={<PromptDetail />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/category/:slug" element={<CategoryView />} />
            <Route path="/trending" element={<Trending />} />
            <Route path="/latest" element={<Latest />} />
            <Route path="/popular" element={<Popular />} />
            <Route path="/search" element={<Search />} />
            <Route path="/outputs" element={<PromptOutputs />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <ScrollToTop />
          <AppShell />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
