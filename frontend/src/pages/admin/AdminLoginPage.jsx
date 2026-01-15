import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TreePine, LogIn, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nama: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error('Email dan password wajib diisi');
      return;
    }

    if (isRegister && !formData.nama) {
      toast.error('Nama wajib diisi');
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        await register(formData.email, formData.password, formData.nama);
        toast.success('Registrasi berhasil!');
      } else {
        await login(formData.email, formData.password);
        toast.success('Login berhasil!');
      }
      navigate('/admin');
    } catch (error) {
      console.error('Auth error:', error);
      toast.error(error.response?.data?.detail || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-slate-100 p-4" data-testid="admin-login-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="h-12 w-12 bg-emerald-600 rounded-full flex items-center justify-center">
              <TreePine className="h-7 w-7 text-white" />
            </div>
            <div className="text-left">
              <p className="font-bold text-slate-800">Agro Mopomulo</p>
              <p className="text-xs text-slate-500">Admin Panel</p>
            </div>
          </Link>
        </div>

        <Card className="stat-card">
          <CardHeader className="text-center">
            <CardTitle>{isRegister ? 'Registrasi Admin' : 'Login Admin'}</CardTitle>
            <CardDescription>
              {isRegister 
                ? 'Buat akun admin baru untuk mengelola program'
                : 'Masuk ke panel admin untuk mengelola program'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <div className="space-y-2">
                  <Label htmlFor="nama">Nama Lengkap</Label>
                  <Input
                    id="nama"
                    name="nama"
                    placeholder="Nama lengkap Anda"
                    value={formData.nama}
                    onChange={handleChange}
                    className="form-input"
                    data-testid="input-nama"
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  data-testid="input-email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="form-input pr-10"
                    data-testid="input-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="btn-primary w-full"
                disabled={loading}
                data-testid="submit-login-btn"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {isRegister ? 'Mendaftar...' : 'Masuk...'}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    {isRegister ? 'Daftar' : 'Masuk'}
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsRegister(!isRegister)}
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                data-testid="toggle-auth-mode"
              >
                {isRegister 
                  ? 'Sudah punya akun? Login' 
                  : 'Belum punya akun? Daftar'
                }
              </button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-slate-500 hover:text-slate-700">
            ← Kembali ke Beranda
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
