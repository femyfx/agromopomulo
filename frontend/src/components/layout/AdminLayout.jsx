import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Building2, Users, Settings, LogOut, Menu, X, 
  TreePine, FileDown, FileUp, Image, BookOpen, ChevronDown, FileText,
  Calendar, Newspaper, Phone
} from 'lucide-react';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { settingsApi } from '../../lib/api';
import { motion, AnimatePresence } from 'framer-motion';

const sidebarItems = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/opd', label: 'Kelola OPD', icon: Building2 },
  { path: '/admin/partisipasi', label: 'Kelola Partisipasi', icon: Users },
  { path: '/admin/laporan', label: 'Laporan', icon: FileText },
  { path: '/admin/galeri', label: 'Kelola Galeri', icon: Image },
  { path: '/admin/edukasi', label: 'Kelola Edukasi', icon: BookOpen },
  { path: '/admin/agenda', label: 'Kelola Agenda', icon: Calendar },
  { path: '/admin/berita', label: 'Kelola Berita', icon: Newspaper },
  { path: '/admin/kontak', label: 'Pengaturan Kontak', icon: Phone },
  { path: '/admin/settings', label: 'Pengaturan', icon: Settings },
];

export const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settings, setSettings] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await settingsApi.get();
      setSettings(res.data);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-slate-200">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-200">
          {settings?.logo_url ? (
            <img src={settings.logo_url} alt="Logo Pemda" className="h-10 w-10 object-contain" />
          ) : (
            <div className="h-10 w-10 bg-emerald-600 rounded-full flex items-center justify-center">
              <TreePine className="h-6 w-6 text-white" />
            </div>
          )}
          <div>
            <p className="text-sm font-bold text-slate-800">Agro Mopomulo</p>
            <p className="text-xs text-slate-500">Admin Panel</p>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
              data-testid={`sidebar-${item.label.toLowerCase().replace(/\s/g, '-')}`}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-lg mb-3">
            <div className="h-9 w-9 bg-emerald-600 rounded-full flex items-center justify-center text-white font-medium">
              {user?.nama?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">{user?.nama || 'Admin'}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="w-full justify-start text-slate-600"
            onClick={handleLogout}
            data-testid="logout-btn"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Keluar
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            {settings?.logo_url ? (
              <img src={settings.logo_url} alt="Logo" className="h-8 w-8 object-contain" />
            ) : (
              <div className="h-8 w-8 bg-emerald-600 rounded-full flex items-center justify-center">
                <TreePine className="h-5 w-5 text-white" />
              </div>
            )}
            <span className="font-bold text-slate-800">Admin Panel</span>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-slate-100"
            data-testid="mobile-sidebar-btn"
          >
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-40 bg-black/50"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200"
            >
              <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-200">
                {settings?.logo_url ? (
                  <img src={settings.logo_url} alt="Logo" className="h-10 w-10 object-contain" />
                ) : (
                  <div className="h-10 w-10 bg-emerald-600 rounded-full flex items-center justify-center">
                    <TreePine className="h-6 w-6 text-white" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-bold text-slate-800">Agro Mopomulo</p>
                  <p className="text-xs text-slate-500">Admin Panel</p>
                </div>
              </div>
              <nav className="flex-1 px-4 py-6 space-y-1">
                {sidebarItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
              <div className="p-4 border-t border-slate-200">
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-slate-600"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Keluar
                </Button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0">
        <div className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
