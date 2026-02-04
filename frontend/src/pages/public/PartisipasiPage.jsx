import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { TreePine, Send, User, Building2, Leaf, MapPin, ChevronRight, ChevronLeft, Upload, X, Navigation, Loader2, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Progress } from '../../components/ui/progress';
import { opdApi, partisipasiApi } from '../../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import axios from 'axios';
import { SuccessIcon, TreeIcon } from '../../components/EnvironmentIcons';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const steps = [
  { id: 1, title: 'Data Pribadi', icon: User },
  { id: 2, title: 'Instansi', icon: Building2 },
  { id: 3, title: 'Data Pohon', icon: Leaf },
  { id: 4, title: 'Lokasi & Bukti', icon: MapPin },
];

export const PartisipasiPage = () => {
  const navigate = useNavigate();
  const [opdList, setOpdList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedKategori, setSelectedKategori] = useState('');
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    email: '',
    nama_lengkap: '',
    nip: '',
    opd_id: '',
    alamat: '',
    nomor_whatsapp: '',
    jumlah_pohon: '',
    jenis_pohon: '',
    sumber_bibit: '',
    lokasi_tanam: '',
    latitude: '',
    longitude: '',
    bukti_url: ''
  });

  const [errors, setErrors] = useState({});
  const [gettingLocation, setGettingLocation] = useState(false);

  const kategoriOptions = [
    { value: 'OPD', label: 'OPD' },
    { value: 'DESA', label: 'Desa' },
    { value: 'KECAMATAN', label: 'Kecamatan' },
    { value: 'PUBLIK', label: 'Publik' }
  ];

  // Filter OPD by selected kategori
  const filteredOpdList = opdList.filter(opd => 
    !selectedKategori || opd.kategori === selectedKategori
  );

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
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleKategoriChange = (value) => {
    setSelectedKategori(value);
    // Reset opd_id when kategori changes
    setFormData(prev => ({ ...prev, opd_id: '' }));
    if (errors.opd_id) {
      setErrors(prev => ({ ...prev, opd_id: '' }));
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Browser Anda tidak mendukung geolokasi');
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData(prev => ({
          ...prev,
          latitude: latitude.toFixed(6),
          longitude: longitude.toFixed(6)
        }));
        toast.success('Lokasi berhasil didapatkan!');
        setGettingLocation(false);
      },
      (error) => {
        setGettingLocation(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error('Akses lokasi ditolak. Silakan izinkan akses lokasi di browser Anda.');
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error('Informasi lokasi tidak tersedia.');
            break;
          case error.TIMEOUT:
            toast.error('Waktu permintaan lokasi habis.');
            break;
          default:
            toast.error('Gagal mendapatkan lokasi.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar');
      return;
    }

    // Validate file size (max 2MB)
    const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
    if (file.size > MAX_FILE_SIZE) {
      toast.error('Ukuran file maksimal 2MB');
      return;
    }

    setUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      const res = await axios.post(`${API}/upload/image`, formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData(prev => ({ ...prev, bukti_url: res.data.url }));
      toast.success('Bukti berhasil diupload');
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Gagal mengupload bukti');
    } finally {
      setUploading(false);
    }
  };

  const removeBukti = () => {
    setFormData(prev => ({ ...prev, bukti_url: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 1:
        // Hanya nama_lengkap yang WAJIB di Step 1
        if (!formData.nama_lengkap) newErrors.nama_lengkap = 'Nama lengkap wajib diisi';
        // Email dan NIP adalah OPSIONAL - tidak perlu validasi wajib
        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = 'Format email tidak valid';
        }
        break;
      case 2:
        // Kategori dan OPD/Desa/Kecamatan/Publik WAJIB
        if (!formData.opd_id) newErrors.opd_id = 'Instansi wajib dipilih';
        // Alamat dan WhatsApp adalah OPSIONAL - tidak perlu validasi wajib
        break;
      case 3:
        // Semua field di Step 3 WAJIB
        if (!formData.jumlah_pohon) newErrors.jumlah_pohon = 'Jumlah pohon wajib diisi';
        else if (parseInt(formData.jumlah_pohon) < 1) newErrors.jumlah_pohon = 'Jumlah minimal 1 pohon';
        if (!formData.jenis_pohon) newErrors.jenis_pohon = 'Jenis pohon wajib dipilih';
        if (!formData.sumber_bibit) newErrors.sumber_bibit = 'Sumber bibit wajib dipilih';
        break;
      case 4:
        // Lokasi tanam WAJIB
        if (!formData.lokasi_tanam) newErrors.lokasi_tanam = 'Lokasi tanam wajib diisi';
        break;
      default:
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(4)) return;

    setLoading(true);
    try {
      // Combine latitude and longitude into titik_lokasi
      const titik_lokasi = formData.latitude && formData.longitude 
        ? `${formData.latitude}, ${formData.longitude}`
        : '';

      await partisipasiApi.create({
        ...formData,
        titik_lokasi,
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

  const progressPercentage = (currentStep / 4) * 100;

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
              <div className="flex justify-center mb-6">
                <SuccessIcon size="xl" />
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
      <section className="relative py-12 overflow-hidden">
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
            <div className="flex justify-center mb-4">
              <TreeIcon size="md" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-2">
              Form Partisipasi
            </h1>
            <p className="text-emerald-100 max-w-xl mx-auto">
              Daftarkan partisipasi Anda dalam program Agro Mopomulo
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-6 relative z-10">
        <Card className="stat-card">
          {/* Progress Section */}
          <CardHeader className="pb-4">
            <div className="space-y-4">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 font-medium">Langkah {currentStep} dari 4</span>
                  <span className="text-emerald-600 font-semibold">{Math.round(progressPercentage)}%</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>

              {/* Step Indicators */}
              <div className="flex justify-between">
                {steps.map((step) => (
                  <div 
                    key={step.id}
                    className={`flex flex-col items-center gap-1 ${
                      step.id <= currentStep ? 'text-emerald-600' : 'text-slate-400'
                    }`}
                  >
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                      step.id < currentStep 
                        ? 'bg-emerald-600 text-white' 
                        : step.id === currentStep 
                          ? 'bg-emerald-100 text-emerald-600 ring-2 ring-emerald-600' 
                          : 'bg-slate-100 text-slate-400'
                    }`}>
                      {step.id < currentStep ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <step.icon className="h-5 w-5" />
                      )}
                    </div>
                    <span className="text-xs font-medium hidden sm:block">{step.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit}>
              <AnimatePresence mode="wait">
                {/* Step 1: Data Pribadi */}
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-5"
                  >
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-slate-800">Data Pribadi</h3>
                      <p className="text-sm text-slate-500">Masukkan informasi data diri Anda</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="nama_lengkap">Nama Lengkap <span className="text-red-500">*</span></Label>
                      <Input
                        id="nama_lengkap"
                        name="nama_lengkap"
                        placeholder="Nama lengkap Anda"
                        value={formData.nama_lengkap}
                        onChange={handleChange}
                        className={`form-input ${errors.nama_lengkap ? 'border-red-500' : ''}`}
                        data-testid="input-nama"
                      />
                      {errors.nama_lengkap && <p className="text-sm text-red-500">{errors.nama_lengkap}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="nip">NIP <span className="text-slate-400 text-xs font-normal">(Opsional)</span></Label>
                      <Input
                        id="nip"
                        name="nip"
                        placeholder="Nomor Induk Pegawai"
                        value={formData.nip}
                        onChange={handleChange}
                        className="form-input"
                        data-testid="input-nip"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email <span className="text-slate-400 text-xs font-normal">(Opsional)</span></Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="email@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        className="form-input"
                        data-testid="input-email"
                      />
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Instansi */}
                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-5"
                  >
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-slate-800">Data Instansi</h3>
                      <p className="text-sm text-slate-500">Masukkan informasi instansi dan kontak Anda</p>
                    </div>

                    <div className="space-y-2">
                      <Label>Kategori Instansi <span className="text-red-500">*</span></Label>
                      <Select 
                        value={selectedKategori} 
                        onValueChange={handleKategoriChange}
                      >
                        <SelectTrigger className={`form-input ${!selectedKategori && errors.opd_id ? 'border-red-500' : ''}`} data-testid="select-kategori">
                          <SelectValue placeholder="Pilih Kategori (OPD/Desa/Kecamatan/Publik)" />
                        </SelectTrigger>
                        <SelectContent>
                          {kategoriOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="opd_id">
                        {selectedKategori === 'DESA' ? 'Pilih Desa' : selectedKategori === 'KECAMATAN' ? 'Pilih Kecamatan' : selectedKategori === 'PUBLIK' ? 'Pilih Instansi' : 'Pilih OPD'} <span className="text-red-500">*</span>
                      </Label>
                      <Select 
                        value={formData.opd_id} 
                        onValueChange={(value) => handleSelectChange('opd_id', value)}
                        disabled={!selectedKategori}
                      >
                        <SelectTrigger className={`form-input ${errors.opd_id ? 'border-red-500' : ''}`} data-testid="select-opd">
                          <SelectValue placeholder={
                            !selectedKategori 
                              ? "Pilih kategori terlebih dahulu" 
                              : selectedKategori === 'DESA' 
                                ? "Pilih Desa" 
                                : selectedKategori === 'KECAMATAN'
                                  ? "Pilih Kecamatan"
                                  : selectedKategori === 'PUBLIK' 
                                    ? "Pilih Instansi Publik" 
                                    : "Pilih OPD"
                          } />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredOpdList.length > 0 ? (
                            filteredOpdList.map((opd) => (
                              <SelectItem key={opd.id} value={opd.id}>
                                {opd.nama}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="" disabled>
                              {selectedKategori ? `Tidak ada data ${selectedKategori}` : 'Pilih kategori dahulu'}
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      {errors.opd_id && <p className="text-sm text-red-500">{errors.opd_id}</p>}
                      {selectedKategori && filteredOpdList.length === 0 && (
                        <p className="text-sm text-amber-600">Belum ada data {selectedKategori} yang terdaftar</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="alamat">Alamat <span className="text-slate-400 text-xs font-normal">(Opsional)</span></Label>
                      <Textarea
                        id="alamat"
                        name="alamat"
                        placeholder="Alamat lengkap Anda"
                        value={formData.alamat}
                        onChange={handleChange}
                        className="form-input min-h-[80px]"
                        data-testid="input-alamat"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="nomor_whatsapp">Nomor WhatsApp <span className="text-slate-400 text-xs font-normal">(Opsional)</span></Label>
                      <Input
                        id="nomor_whatsapp"
                        name="nomor_whatsapp"
                        placeholder="08xxxxxxxxxx"
                        value={formData.nomor_whatsapp}
                        onChange={handleChange}
                        className="form-input"
                        data-testid="input-wa"
                      />
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Data Pohon */}
                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-5"
                  >
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-slate-800">Data Pohon</h3>
                      <p className="text-sm text-slate-500">Informasi tentang pohon yang akan ditanam</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="jumlah_pohon">Jumlah Pohon <span className="text-red-500">*</span></Label>
                      <Input
                        id="jumlah_pohon"
                        name="jumlah_pohon"
                        type="number"
                        min="1"
                        placeholder="Minimal 10 pohon"
                        value={formData.jumlah_pohon}
                        onChange={handleChange}
                        className={`form-input ${errors.jumlah_pohon ? 'border-red-500' : ''}`}
                        data-testid="input-jumlah"
                      />
                      {errors.jumlah_pohon && <p className="text-sm text-red-500">{errors.jumlah_pohon}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="jenis_pohon">Jenis Pohon <span className="text-red-500">*</span></Label>
                      <Select 
                        value={formData.jenis_pohon} 
                        onValueChange={(value) => handleSelectChange('jenis_pohon', value)}
                      >
                        <SelectTrigger className={`form-input ${errors.jenis_pohon ? 'border-red-500' : ''}`} data-testid="select-jenis">
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
                      {errors.jenis_pohon && <p className="text-sm text-red-500">{errors.jenis_pohon}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sumber_bibit">Sumber Bibit <span className="text-red-500">*</span></Label>
                      <Select 
                        value={formData.sumber_bibit} 
                        onValueChange={(value) => handleSelectChange('sumber_bibit', value)}
                      >
                        <SelectTrigger className={`form-input ${errors.sumber_bibit ? 'border-red-500' : ''}`} data-testid="select-sumber-bibit">
                          <SelectValue placeholder="Pilih sumber bibit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pemerintah Daerah">Pemerintah Daerah</SelectItem>
                          <SelectItem value="Dinas Pertanian">Dinas Pertanian</SelectItem>
                          <SelectItem value="Dinas Kehutanan">Dinas Kehutanan</SelectItem>
                          <SelectItem value="Swadaya Masyarakat">Swadaya Masyarakat</SelectItem>
                          <SelectItem value="Bantuan CSR">Bantuan CSR</SelectItem>
                          <SelectItem value="Pembelian Mandiri">Pembelian Mandiri</SelectItem>
                          <SelectItem value="Lainnya">Lainnya</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.sumber_bibit && <p className="text-sm text-red-500">{errors.sumber_bibit}</p>}
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Lokasi & Bukti */}
                {currentStep === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-5"
                  >
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-slate-800">Lokasi & Bukti</h3>
                      <p className="text-sm text-slate-500">Informasi lokasi penanaman dan bukti dokumentasi</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lokasi_tanam">Lokasi Tanam <span className="text-red-500">*</span></Label>
                      <Input
                        id="lokasi_tanam"
                        name="lokasi_tanam"
                        placeholder="Nama lokasi penanaman (Desa/Kelurahan)"
                        value={formData.lokasi_tanam}
                        onChange={handleChange}
                        className={`form-input ${errors.lokasi_tanam ? 'border-red-500' : ''}`}
                        data-testid="input-lokasi"
                      />
                      {errors.lokasi_tanam && <p className="text-sm text-red-500">{errors.lokasi_tanam}</p>}
                    </div>

                    {/* Koordinat Section */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Titik Koordinat (Opsional)</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={getCurrentLocation}
                          disabled={gettingLocation}
                          className="text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                          data-testid="btn-get-location"
                        >
                          {gettingLocation ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Mencari Lokasi...
                            </>
                          ) : (
                            <>
                              <Navigation className="h-4 w-4 mr-2" />
                              Pilih Lokasi Saat Ini
                            </>
                          )}
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label htmlFor="latitude" className="text-xs text-slate-500">Latitude</Label>
                          <Input
                            id="latitude"
                            name="latitude"
                            type="text"
                            placeholder="Contoh: 0.5432"
                            value={formData.latitude}
                            onChange={handleChange}
                            className="form-input"
                            data-testid="input-latitude"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="longitude" className="text-xs text-slate-500">Longitude</Label>
                          <Input
                            id="longitude"
                            name="longitude"
                            type="text"
                            placeholder="Contoh: 123.4567"
                            value={formData.longitude}
                            onChange={handleChange}
                            className="form-input"
                            data-testid="input-longitude"
                          />
                        </div>
                      </div>
                      <p className="text-xs text-slate-500">
                        Masukkan koordinat secara manual atau klik "Pilih Lokasi Saat Ini" untuk mengambil lokasi GPS Anda
                      </p>
                      
                      {/* Preview coordinates if both filled */}
                      {formData.latitude && formData.longitude && (
                        <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-lg border border-emerald-200">
                          <MapPin className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                          <span className="text-sm text-emerald-700">
                            Koordinat: {formData.latitude}, {formData.longitude}
                          </span>
                          <a 
                            href={`https://www.google.com/maps?q=${formData.latitude},${formData.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-auto text-xs text-emerald-600 hover:underline"
                          >
                            Lihat di Maps
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Upload Bukti Penanaman (Opsional)</Label>
                      <div className="mt-2">
                        {formData.bukti_url ? (
                          <div className="relative inline-block">
                            <img 
                              src={formData.bukti_url} 
                              alt="Bukti"
                              className="w-full max-w-xs h-40 object-cover rounded-lg border border-slate-200"
                            />
                            <button
                              type="button"
                              onClick={removeBukti}
                              className="absolute -top-2 -right-2 h-6 w-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/50 transition-colors"
                          >
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileUpload}
                              ref={fileInputRef}
                              className="hidden"
                              id="bukti-upload"
                            />
                            <Upload className="h-10 w-10 text-slate-400 mx-auto mb-2" />
                            <p className="text-sm text-slate-600">
                              {uploading ? 'Mengupload...' : 'Klik untuk upload foto bukti penanaman'}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">PNG, JPG (max 5MB)</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t border-slate-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className={currentStep === 1 ? 'invisible' : ''}
                  data-testid="btn-prev"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Sebelumnya
                </Button>

                {currentStep < 4 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="btn-primary"
                    data-testid="btn-next"
                  >
                    Selanjutnya
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    className="btn-primary"
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
                        Kirim Data
                      </span>
                    )}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
