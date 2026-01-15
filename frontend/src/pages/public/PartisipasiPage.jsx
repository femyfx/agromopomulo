import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TreePine, Send, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { opdApi, partisipasiApi } from '../../lib/api';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export const PartisipasiPage = () => {
  const navigate = useNavigate();
  const [opdList, setOpdList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    nama_lengkap: '',
    nip: '',
    opd_id: '',
    alamat: '',
    nomor_whatsapp: '',
    jumlah_pohon: '',
    jenis_pohon: '',
    lokasi_tanam: ''
  });

  useEffect(() => {
    loadOPD();
  }, []);

  const loadOPD = async () => {
    try {
      const res = await opdApi.getAll();
      setOpdList(res.data);
    } catch (error) {
      console.error('Failed to load OPD:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.email || !formData.nama_lengkap || !formData.nip || !formData.opd_id || 
        !formData.alamat || !formData.nomor_whatsapp || !formData.jumlah_pohon || 
        !formData.jenis_pohon || !formData.lokasi_tanam) {
      toast.error('Mohon lengkapi semua field');
      return;
    }

    setLoading(true);
    try {
      await partisipasiApi.create({
        ...formData,
        jumlah_pohon: parseInt(formData.jumlah_pohon)
      });
      setSubmitted(true);
      toast.success('Partisipasi berhasil didaftarkan!');
    } catch (error) {
      console.error('Failed to submit:', error);
      toast.error(error.response?.data?.detail || 'Gagal mendaftarkan partisipasi');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-slate-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Card className="stat-card max-w-md mx-auto">
            <CardContent className="p-8">
              <div className="h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Terima Kasih!</h2>
              <p className="text-slate-600 mb-6">
                Partisipasi Anda telah berhasil didaftarkan. Kami akan memverifikasi data Anda segera.
              </p>
              <Button 
                onClick={() => navigate('/')} 
                className="btn-primary"
                data-testid="back-to-home-btn"
              >
                Kembali ke Beranda
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" data-testid="partisipasi-page">
      {/* Hero */}
      <section className="relative py-16 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1631401551847-78450ef649d8?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHwxfHxzZWVkbGluZyUyMGluJTIwaGFuZHxlbnwwfHx8fDE3Njg0NDU4MTh8MA&ixlib=rb-4.1.0&q=85')`
          }}
        />
        <div className="absolute inset-0 bg-emerald-900/80" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="h-16 w-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-6">
              <TreePine className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-4">
              Form Partisipasi
            </h1>
            <p className="text-lg text-emerald-100 max-w-2xl mx-auto">
              Daftarkan partisipasi Anda dalam program Agro Mopomulo
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-8 relative z-10">
        <Card className="stat-card">
          <CardHeader>
            <CardTitle>Data Partisipasi ASN</CardTitle>
            <CardDescription>
              Lengkapi form berikut untuk mendaftarkan partisipasi Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-input"
                    data-testid="input-email"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nama_lengkap">Nama Lengkap *</Label>
                  <Input
                    id="nama_lengkap"
                    name="nama_lengkap"
                    placeholder="Nama lengkap Anda"
                    value={formData.nama_lengkap}
                    onChange={handleChange}
                    className="form-input"
                    data-testid="input-nama"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nip">NIP *</Label>
                  <Input
                    id="nip"
                    name="nip"
                    placeholder="Nomor Induk Pegawai"
                    value={formData.nip}
                    onChange={handleChange}
                    className="form-input"
                    data-testid="input-nip"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="opd_id">OPD *</Label>
                  <Select 
                    value={formData.opd_id} 
                    onValueChange={(value) => handleSelectChange('opd_id', value)}
                  >
                    <SelectTrigger className="form-input" data-testid="select-opd">
                      <SelectValue placeholder="Pilih OPD" />
                    </SelectTrigger>
                    <SelectContent>
                      {opdList.map((opd) => (
                        <SelectItem key={opd.id} value={opd.id}>
                          {opd.nama}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="alamat">Alamat *</Label>
                <Textarea
                  id="alamat"
                  name="alamat"
                  placeholder="Alamat lengkap Anda"
                  value={formData.alamat}
                  onChange={handleChange}
                  className="form-input min-h-[80px]"
                  data-testid="input-alamat"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nomor_whatsapp">Nomor WhatsApp *</Label>
                  <Input
                    id="nomor_whatsapp"
                    name="nomor_whatsapp"
                    placeholder="08xxxxxxxxxx"
                    value={formData.nomor_whatsapp}
                    onChange={handleChange}
                    className="form-input"
                    data-testid="input-wa"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jumlah_pohon">Jumlah Pohon *</Label>
                  <Input
                    id="jumlah_pohon"
                    name="jumlah_pohon"
                    type="number"
                    min="1"
                    placeholder="Minimal 10 pohon"
                    value={formData.jumlah_pohon}
                    onChange={handleChange}
                    className="form-input"
                    data-testid="input-jumlah"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="jenis_pohon">Jenis Pohon *</Label>
                  <Select 
                    value={formData.jenis_pohon} 
                    onValueChange={(value) => handleSelectChange('jenis_pohon', value)}
                  >
                    <SelectTrigger className="form-input" data-testid="select-jenis">
                      <SelectValue placeholder="Pilih jenis pohon" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mangga">Mangga</SelectItem>
                      <SelectItem value="Durian">Durian</SelectItem>
                      <SelectItem value="Kelapa">Kelapa</SelectItem>
                      <SelectItem value="Mahoni">Mahoni</SelectItem>
                      <SelectItem value="Jati">Jati</SelectItem>
                      <SelectItem value="Trembesi">Trembesi</SelectItem>
                      <SelectItem value="Rambutan">Rambutan</SelectItem>
                      <SelectItem value="Jambu">Jambu</SelectItem>
                      <SelectItem value="Kakao">Kakao</SelectItem>
                      <SelectItem value="Cengkeh">Cengkeh</SelectItem>
                      <SelectItem value="Lainnya">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lokasi_tanam">Lokasi Tanam *</Label>
                  <Input
                    id="lokasi_tanam"
                    name="lokasi_tanam"
                    placeholder="Lokasi penanaman pohon"
                    value={formData.lokasi_tanam}
                    onChange={handleChange}
                    className="form-input"
                    data-testid="input-lokasi"
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="btn-primary w-full"
                disabled={loading}
                data-testid="submit-partisipasi-btn"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Mengirim...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    Daftarkan Partisipasi
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
