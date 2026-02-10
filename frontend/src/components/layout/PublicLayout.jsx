import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Menu, X, TreePine, Home, Info, Building2, MapPin, Image, BookOpen, UserPlus, LogIn, Calendar, Newspaper } from 'lucide-react';
import { Button } from '../ui/button';
import { settingsApi } from '../../lib/api';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { path: '/', label: 'Beranda', icon: Home },
  { path: '/tentang', label: 'Tentang', icon: Info },
  { path: '/kontribusi-opd', label: 'Kontribusi OPD', icon: Building2 },
  { path: '/peta-penanaman', label: 'Peta Penanaman', icon: MapPin },
  { path: '/agenda', label: 'Agenda', icon: Calendar },
  { path: '/berita', label: 'Berita', icon: Newspaper },
  { path: '/galeri', label: 'Galeri', icon: Image },
  { path: '/edukasi', label: 'Edukasi', icon: BookOpen },
  { path: '/partisipasi', label: 'Partisipasi', icon: UserPlus },
];

export const PublicLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settings, setSettings] = useState(null);
  const location = useLocation();

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

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              {settings?.logo_url ? (
                <img src={settings.logo_url} alt="Logo Pemda" className="h-10 w-10 object-contain" />
              ) : (
                <div className="h-10 w-10 bg-emerald-600 rounded-full flex items-center justify-center">
                  <TreePine className="h-6 w-6 text-white" />
                </div>
              )}
              <div className="hidden sm:block">
                <p className="text-sm font-bold text-slate-800">Program Agro Mopomulo</p>
                <p className="text-xs text-slate-500">Kabupaten Gorontalo Utara</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.slice(0, 8).map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              <Link to="/partisipasi">
                <Button className="hidden sm:flex btn-primary" data-testid="partisipasi-btn">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Partisipasi
                </Button>
              </Link>
              <button
                className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                data-testid="mobile-menu-btn"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-slate-200 bg-white"
            >
              <nav className="px-4 py-4 space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      location.pathname === item.path
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                ))}
                <Link
                  to="/admin/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100"
                >
                  <LogIn className="h-5 w-5" />
                  Login Admin
                </Link>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-slate-800 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                {settings?.logo_url ? (
                  <img src={settings.logo_url} alt="Logo Pemda" className="h-12 w-12 object-contain bg-white rounded-lg p-1" />
                ) : (
                  <div className="h-12 w-12 bg-emerald-600 rounded-lg flex items-center justify-center">
                    <TreePine className="h-7 w-7 text-white" />
                  </div>
                )}
                <div>
                  <p className="font-bold">Program Agro Mopomulo</p>
                  <p className="text-sm text-slate-400">Kabupaten Gorontalo Utara</p>
                </div>
              </div>
              <p className="text-slate-400 text-sm">
                Gerakan Satu Orang Sepuluh Pohon untuk masa depan yang lebih hijau dan berkelanjutan.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Tautan Cepat</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link to="/tentang" className="hover:text-white transition-colors">Tentang Program</Link></li>
                <li><Link to="/partisipasi" className="hover:text-white transition-colors">Form Partisipasi</Link></li>
                <li><Link to="/galeri" className="hover:text-white transition-colors">Galeri Kegiatan</Link></li>
                <li><Link to="/edukasi" className="hover:text-white transition-colors">Edukasi</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Kontak</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>Pemerintah Kabupaten Gorontalo Utara</li>
                <li>Jl. Trans Sulawesi, Kwandang</li>
                <li>Gorontalo Utara, Gorontalo</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700 mt-8 pt-8 text-center text-sm text-slate-400">
            <p>© {new Date().getFullYear()} Program Agro Mopomulo - Kabupaten Gorontalo Utara. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
