import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

// Layouts
import { PublicLayout } from "./components/layout/PublicLayout";
import { AdminLayout } from "./components/layout/AdminLayout";

// Public Pages
import { HomePage } from "./pages/public/HomePage";
import { TentangPage } from "./pages/public/TentangPage";
import { KontribusiOPDPage } from "./pages/public/KontribusiOPDPage";
import { PetaPenanamanPage } from "./pages/public/PetaPenanamanPage";
import { GaleriPage } from "./pages/public/GaleriPage";
import { EdukasiPage } from "./pages/public/EdukasiPage";
import { PartisipasiPage } from "./pages/public/PartisipasiPage";

// Admin Pages
import { AdminLoginPage } from "./pages/admin/AdminLoginPage";
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { AdminOPDPage } from "./pages/admin/AdminOPDPage";
import { AdminPartisipasiPage } from "./pages/admin/AdminPartisipasiPage";
import { AdminSettingsPage } from "./pages/admin/AdminSettingsPage";
import { AdminGaleriPage } from "./pages/admin/AdminGaleriPage";
import { AdminEdukasiPage } from "./pages/admin/AdminEdukasiPage";
import { AdminLaporanPage } from "./pages/admin/AdminLaporanPage";
import { AdminAgendaPage } from "./pages/admin/AdminAgendaPage";
import { AdminBeritaPage } from "./pages/admin/AdminBeritaPage";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/tentang" element={<TentangPage />} />
        <Route path="/kontribusi-opd" element={<KontribusiOPDPage />} />
        <Route path="/peta-penanaman" element={<PetaPenanamanPage />} />
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
