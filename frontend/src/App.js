import "@/App.css";
import React, { Suspense, lazy, memo } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

// Layouts - Load immediately (small files)
import { PublicLayout } from "./components/layout/PublicLayout";
import { AdminLayout } from "./components/layout/AdminLayout";

// Critical Public Page - Load immediately for LCP
import { HomePage } from "./pages/public/HomePage";

// Lazy load other public pages
const TentangPage = lazy(() => import("./pages/public/TentangPage").then(m => ({ default: m.TentangPage })));
const KontribusiOPDPage = lazy(() => import("./pages/public/KontribusiOPDPage").then(m => ({ default: m.KontribusiOPDPage })));
const PetaPenanamanPage = lazy(() => import("./pages/public/PetaPenanamanPage").then(m => ({ default: m.PetaPenanamanPage })));
const GaleriPage = lazy(() => import("./pages/public/GaleriPage").then(m => ({ default: m.GaleriPage })));
const EdukasiPage = lazy(() => import("./pages/public/EdukasiPage").then(m => ({ default: m.EdukasiPage })));
const PartisipasiPage = lazy(() => import("./pages/public/PartisipasiPage").then(m => ({ default: m.PartisipasiPage })));
const AgendaPage = lazy(() => import("./pages/public/AgendaPage").then(m => ({ default: m.AgendaPage })));
const BeritaPage = lazy(() => import("./pages/public/BeritaPage").then(m => ({ default: m.BeritaPage })));

// Lazy load admin pages (heavy components with charts/tables)
const AdminLoginPage = lazy(() => import("./pages/admin/AdminLoginPage").then(m => ({ default: m.AdminLoginPage })));
const AdminDashboardPage = lazy(() => import("./pages/admin/AdminDashboardPage").then(m => ({ default: m.AdminDashboardPage })));
const AdminOPDPage = lazy(() => import("./pages/admin/AdminOPDPage").then(m => ({ default: m.AdminOPDPage })));
const AdminPartisipasiPage = lazy(() => import("./pages/admin/AdminPartisipasiPage").then(m => ({ default: m.AdminPartisipasiPage })));
const AdminSettingsPage = lazy(() => import("./pages/admin/AdminSettingsPage").then(m => ({ default: m.AdminSettingsPage })));
const AdminGaleriPage = lazy(() => import("./pages/admin/AdminGaleriPage").then(m => ({ default: m.AdminGaleriPage })));
const AdminEdukasiPage = lazy(() => import("./pages/admin/AdminEdukasiPage").then(m => ({ default: m.AdminEdukasiPage })));
const AdminLaporanPage = lazy(() => import("./pages/admin/AdminLaporanPage").then(m => ({ default: m.AdminLaporanPage })));
const AdminAgendaPage = lazy(() => import("./pages/admin/AdminAgendaPage").then(m => ({ default: m.AdminAgendaPage })));
const AdminBeritaPage = lazy(() => import("./pages/admin/AdminBeritaPage").then(m => ({ default: m.AdminBeritaPage })));
const AdminKontakPage = lazy(() => import("./pages/admin/AdminKontakPage").then(m => ({ default: m.AdminKontakPage })));

// Loading fallback component - memoized
const PageLoader = memo(() => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
      <p className="mt-4 text-slate-500 text-sm">Memuat...</p>
    </div>
  </div>
));
PageLoader.displayName = 'PageLoader';

// Protected Route Component - memoized
const ProtectedRoute = memo(({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <PageLoader />;
  }
  
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return children;
});
ProtectedRoute.displayName = 'ProtectedRoute';

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/tentang" element={<TentangPage />} />
          <Route path="/kontribusi-opd" element={<KontribusiOPDPage />} />
          <Route path="/peta-penanaman" element={<PetaPenanamanPage />} />
          <Route path="/agenda" element={<AgendaPage />} />
          <Route path="/berita" element={<BeritaPage />} />
          <Route path="/galeri" element={<GaleriPage />} />
          <Route path="/edukasi" element={<EdukasiPage />} />
          <Route path="/partisipasi" element={<PartisipasiPage />} />
        </Route>

        {/* Admin Login */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* Protected Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="opd" element={<AdminOPDPage />} />
          <Route path="partisipasi" element={<AdminPartisipasiPage />} />
          <Route path="laporan" element={<AdminLaporanPage />} />
          <Route path="galeri" element={<AdminGaleriPage />} />
          <Route path="edukasi" element={<AdminEdukasiPage />} />
          <Route path="agenda" element={<AdminAgendaPage />} />
          <Route path="berita" element={<AdminBeritaPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster 
          position="top-right" 
          richColors 
          closeButton
          toastOptions={{
            style: {
              fontFamily: 'Plus Jakarta Sans, sans-serif'
            }
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
