import { useState, useEffect, useCallback, memo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Leaf, Target, Heart, Calendar, Newspaper, Clock, MapPin, TreePine } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { statsApi, settingsApi, agendaApi, beritaApi } from '../../lib/api';
import { motion } from 'framer-motion';
import { NewsPopup } from '../../components/NewsPopup';

// Custom SVG Icons matching reference design - Modern Badge Style
const TotalPohonIcon = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
    <defs>
      <linearGradient id="greenBg" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stopColor="#e8f5e9"/>
        <stop offset="100%" stopColor="#c8e6c9"/>
      </linearGradient>
      <filter id="greenGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
    {/* Outer glow ring */}
    <circle cx="50" cy="50" r="47" fill="none" stroke="#a5d6a7" strokeWidth="4" opacity="0.5" filter="url(#greenGlow)"/>
    {/* Main circle background */}
    <circle cx="50" cy="50" r="42" fill="url(#greenBg)" stroke="#81c784" strokeWidth="2"/>
    {/* Tree cross-section rings */}
    <circle cx="50" cy="50" r="30" fill="none" stroke="#a5d6a7" strokeWidth="3" opacity="0.6"/>
    <circle cx="50" cy="50" r="22" fill="none" stroke="#81c784" strokeWidth="2" opacity="0.5"/>
    <circle cx="50" cy="50" r="14" fill="none" stroke="#66bb6a" strokeWidth="2" opacity="0.4"/>
    {/* Center with sprout */}
    <circle cx="50" cy="52" r="8" fill="#c8e6c9"/>
    {/* Sprout/Leaf emerging from center */}
    <path d="M50 48 Q44 38 50 28 Q56 38 50 48" fill="#4caf50" stroke="#2e7d32" strokeWidth="1"/>
    <path d="M50 48 L50 32" stroke="#2e7d32" strokeWidth="1.5" fill="none"/>
    {/* Small leaves */}
    <path d="M50 38 Q42 34 38 28" fill="none" stroke="#4caf50" strokeWidth="2" strokeLinecap="round"/>
    <path d="M50 38 Q58 34 62 28" fill="none" stroke="#4caf50" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const PartisipanIcon = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
    <defs>
      <linearGradient id="goldBg" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stopColor="#fff8e1"/>
        <stop offset="100%" stopColor="#ffecb3"/>
      </linearGradient>
      <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
    {/* Outer glow ring */}
    <circle cx="50" cy="50" r="47" fill="none" stroke="#ffe082" strokeWidth="4" opacity="0.5" filter="url(#goldGlow)"/>
    {/* Main circle background */}
    <circle cx="50" cy="50" r="42" fill="url(#goldBg)" stroke="#ffd54f" strokeWidth="2"/>
    {/* Cupped hands */}
    <path d="M28 58 Q24 48 30 40 Q36 38 42 44 L46 50" fill="none" stroke="#8d6e63" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M72 58 Q76 48 70 40 Q64 38 58 44 L54 50" fill="none" stroke="#8d6e63" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M28 58 Q38 72 50 74 Q62 72 72 58" fill="none" stroke="#8d6e63" strokeWidth="2.5" strokeLinecap="round"/>
    {/* Soil/base in hands */}
    <ellipse cx="50" cy="58" rx="14" ry="6" fill="#a1887f"/>
    {/* Seedling stem */}
    <path d="M50 52 L50 34" stroke="#558b2f" strokeWidth="2.5" strokeLinecap="round"/>
    {/* Two leaves */}
    <ellipse cx="42" cy="32" rx="8" ry="12" fill="#8bc34a" stroke="#689f38" strokeWidth="1" transform="rotate(-25 42 32)"/>
    <ellipse cx="58" cy="32" rx="8" ry="12" fill="#8bc34a" stroke="#689f38" strokeWidth="1" transform="rotate(25 58 32)"/>
    {/* Leaf veins */}
    <path d="M42 38 L42 26" stroke="#689f38" strokeWidth="1" transform="rotate(-25 42 32)"/>
    <path d="M58 38 L58 26" stroke="#689f38" strokeWidth="1" transform="rotate(25 58 32)"/>
  </svg>
);

const OPDTerlibatIcon = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
    <defs>
      <linearGradient id="blueBg" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stopColor="#e3f2fd"/>
        <stop offset="100%" stopColor="#bbdefb"/>
      </linearGradient>
      <filter id="blueGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
    {/* Outer glow ring */}
    <circle cx="50" cy="50" r="47" fill="none" stroke="#90caf9" strokeWidth="4" opacity="0.5" filter="url(#blueGlow)"/>
    {/* Main circle background */}
    <circle cx="50" cy="50" r="42" fill="url(#blueBg)" stroke="#64b5f6" strokeWidth="2"/>
    {/* Building base */}
    <rect x="32" y="42" width="36" height="30" fill="#42a5f5" rx="2"/>
    {/* Building tower/roof */}
    <rect x="42" y="30" width="16" height="12" fill="#1e88e5"/>
    {/* Flag pole */}
    <line x1="50" y1="30" x2="50" y2="20" stroke="#1565c0" strokeWidth="2"/>
    {/* Flag */}
    <path d="M50 20 L60 24 L50 28 Z" fill="#ef5350"/>
    {/* Windows row 1 */}
    <rect x="36" y="46" width="6" height="6" fill="#e3f2fd" rx="1"/>
    <rect x="47" y="46" width="6" height="6" fill="#e3f2fd" rx="1"/>
    <rect x="58" y="46" width="6" height="6" fill="#e3f2fd" rx="1"/>
    {/* Windows row 2 */}
    <rect x="36" y="56" width="6" height="6" fill="#e3f2fd" rx="1"/>
    <rect x="58" y="56" width="6" height="6" fill="#e3f2fd" rx="1"/>
    {/* Door */}
    <rect x="47" y="56" width="6" height="16" fill="#e3f2fd" rx="1"/>
    {/* Decorative leaf on right */}
    <ellipse cx="76" cy="58" rx="6" ry="12" fill="#66bb6a" stroke="#43a047" strokeWidth="1" transform="rotate(15 76 58)"/>
    <path d="M76 66 L76 50" stroke="#43a047" strokeWidth="1" transform="rotate(15 76 58)"/>
  </svg>
);

const LokasiTanamIcon = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
    <defs>
      <linearGradient id="coralBg" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stopColor="#fbe9e7"/>
        <stop offset="100%" stopColor="#ffccbc"/>
      </linearGradient>
      <filter id="coralGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
    {/* Outer glow ring */}
    <circle cx="50" cy="50" r="47" fill="none" stroke="#ffab91" strokeWidth="4" opacity="0.5" filter="url(#coralGlow)"/>
    {/* Main circle background */}
    <circle cx="50" cy="50" r="42" fill="url(#coralBg)" stroke="#ff8a65" strokeWidth="2"/>
    {/* Ground segments - blocky terrain */}
    <path d="M25 65 L35 60 L45 62 L55 58 L65 62 L75 65 L75 75 L25 75 Z" fill="#8bc34a"/>
    <path d="M30 68 L40 64 L50 66 L60 62 L70 68 L70 75 L30 75 Z" fill="#7cb342"/>
    {/* Large leaf left */}
    <ellipse cx="35" cy="45" rx="7" ry="14" fill="#66bb6a" stroke="#43a047" strokeWidth="1.5" transform="rotate(-10 35 45)"/>
    <path d="M35 55 L35 35" stroke="#43a047" strokeWidth="1.5" transform="rotate(-10 35 45)"/>
    {/* Large leaf right */}
    <ellipse cx="65" cy="45" rx="7" ry="14" fill="#66bb6a" stroke="#43a047" strokeWidth="1.5" transform="rotate(10 65 45)"/>
    <path d="M65 55 L65 35" stroke="#43a047" strokeWidth="1.5" transform="rotate(10 65 45)"/>
    {/* Center plant - main sprout */}
    <ellipse cx="50" cy="42" rx="9" ry="16" fill="#4caf50" stroke="#388e3c" strokeWidth="1.5"/>
    <path d="M50 54 L50 30" stroke="#388e3c" strokeWidth="2"/>
    {/* Small sprouts */}
    <ellipse cx="42" cy="55" rx="4" ry="8" fill="#81c784" stroke="#66bb6a" strokeWidth="1"/>
    <ellipse cx="58" cy="55" rx="4" ry="8" fill="#81c784" stroke="#66bb6a" strokeWidth="1"/>
  </svg>
);

// Glassmorphism stat card component with custom icons
const StatCard = memo(({ iconType, value, label, testId, delay }) => {
  const renderIcon = () => {
    switch(iconType) {
      case 'pohon': return <TotalPohonIcon />;
      case 'partisipan': return <PartisipanIcon />;
      case 'opd': return <OPDTerlibatIcon />;
      case 'lokasi': return <LokasiTanamIcon />;
      default: return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
    >
      <div 
        className="backdrop-blur-xl bg-white/20 border border-white/30 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:bg-white/30"
        data-testid={testId}
      >
        <div className="flex flex-col items-center text-center gap-3">
          <div className="h-20 w-20">
            {renderIcon()}
          </div>
          <div>
            <p className="text-4xl font-bold text-slate-800 tracking-tight drop-shadow-sm">{value}</p>
            <p className="text-sm text-slate-600 font-medium mt-1">{label}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
});
StatCard.displayName = 'StatCard';

// Memoized agenda card with glassmorphism
const AgendaCard = memo(({ item, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1 }}
  >
    <div className="backdrop-blur-md bg-white/90 border border-white/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex flex-col items-center justify-center shadow-md">
            <span className="text-xs font-medium text-white/90 uppercase">
              {new Date(item.tanggal).toLocaleDateString('id-ID', { month: 'short' })}
            </span>
            <span className="text-2xl font-bold text-white">
              {new Date(item.tanggal).getDate()}
            </span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2 ${
            item.status === 'ongoing' ? 'bg-green-100 text-green-700' :
            item.status === 'completed' ? 'bg-gray-100 text-gray-600' :
            'bg-blue-100 text-blue-700'
          }`}>
            {item.status === 'ongoing' ? 'Berlangsung' : item.status === 'completed' ? 'Selesai' : 'Akan Datang'}
          </span>
          <h3 className="font-bold text-slate-800 mb-2 line-clamp-2 text-lg">{item.nama_kegiatan}</h3>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Clock className="h-4 w-4" />
            <span>{item.hari}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
            <MapPin className="h-4 w-4" />
            <span className="truncate">Kec. {item.lokasi_kecamatan}, Desa {item.lokasi_desa}</span>
          </div>
        </div>
      </div>
    </div>
  </motion.div>
));
AgendaCard.displayName = 'AgendaCard';

// Memoized berita card with glassmorphism
const BeritaCard = memo(({ item, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1 }}
  >
    <div className="backdrop-blur-md bg-white/90 border border-white/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer">
      {item.gambar_url && (
        <div className="h-48 overflow-hidden">
          <img 
            src={item.gambar_url} 
            alt={item.judul}
            width={400}
            height={192}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <div className="p-6">
        <p className="text-xs text-slate-400 mb-2 font-medium">
          {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
        <h3 className="font-bold text-slate-800 mb-2 line-clamp-2 text-lg group-hover:text-emerald-600 transition-colors">
          {item.judul}
        </h3>
        <p className="text-sm text-slate-500 line-clamp-3">{item.deskripsi_singkat}</p>
      </div>
    </div>
  </motion.div>
));
BeritaCard.displayName = 'BeritaCard';

// Memoized OPD card with glassmorphism
const OPDCard = memo(({ opd, index, formatNumber }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1 }}
  >
    <div className={`backdrop-blur-md bg-white/90 border border-white/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 ${index === 0 ? 'ring-2 ring-amber-400 ring-offset-2' : ''}`}>
      <div className="flex items-center gap-4 mb-4">
        <div className={`h-14 w-14 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg ${
          index === 0 ? 'bg-gradient-to-br from-amber-400 to-amber-600' : 
          index === 1 ? 'bg-gradient-to-br from-slate-400 to-slate-600' : 
          'bg-gradient-to-br from-amber-600 to-amber-800'
        }`}>
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-slate-800 truncate text-lg">{opd.opd_nama}</h4>
          <p className="text-sm text-slate-500">{opd.jumlah_partisipan} partisipan</p>
        </div>
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <span className="text-sm text-slate-500 font-medium">Total Pohon</span>
        <span className="text-2xl font-bold text-emerald-600">
          {formatNumber(opd.jumlah_pohon)}
        </span>
      </div>
    </div>
  </motion.div>
));
OPDCard.displayName = 'OPDCard';

export const HomePage = () => {
  const [stats, setStats] = useState(null);
  const [settings, setSettings] = useState(null);
  const [agenda, setAgenda] = useState([]);
  const [berita, setBerita] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [statsRes, settingsRes, agendaRes, beritaRes] = await Promise.all([
        statsApi.get(),
        settingsApi.get(),
        agendaApi.getUpcoming(),
        beritaApi.getActive()
      ]);
      setStats(statsRes.data);
      setSettings(settingsRes.data);
      setAgenda(agendaRes.data);
      setBerita(beritaRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const formatNumber = useCallback((num) => {
    return new Intl.NumberFormat('id-ID').format(num || 0);
  }, []);

  // Hero background image URL
  const heroImageUrl = settings?.hero_image_url || 'https://images.unsplash.com/photo-1765333534690-ad3a985e7c42?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwxfHxsdXNoJTIwZ3JlZW4lMjBmb3Jlc3QlMjBsYW5kc2NhcGUlMjBpbmRvbmVzaWF8ZW58MHx8fHwxNzY4NDQ1ODE1fDA&ixlib=rb-4.1.0&q=85&w=1920';

  return (
    <div className="min-h-screen">
      {/* News Popup */}
      <NewsPopup />
      
      {/* Hero Section - Glassmorphism Design */}
      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
        {/* Background Image - Full screen */}
        <img
          src={heroImageUrl}
          alt="Hutan hijau Gorontalo Utara"
          width={1920}
          height={1080}
          fetchpriority="high"
          decoding="sync"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: 'center' }}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
        
        {/* Content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
            <div className="max-w-3xl mx-auto text-center">
              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-emerald-400 text-sm sm:text-base font-semibold tracking-widest uppercase mb-4"
              >
                KABUPATEN GORONTALO UTARA
              </motion.p>
              
              {/* Main Title */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-6 drop-shadow-lg"
              >
                {settings?.hero_title || 'Satu Orang Sepuluh Pohon'}
              </motion.h1>
              
              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-xl sm:text-2xl text-white/90 mb-10 font-light drop-shadow-md"
              >
                {settings?.hero_subtitle || 'untuk Masa Depan Daerah'}
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-wrap justify-center gap-4"
              >
                <Link to="/partisipasi">
                  <Button 
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold" 
                    data-testid="hero-partisipasi-btn"
                  >
                    Ikut Berpartisipasi
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/tentang">
                  <Button 
                    variant="outline" 
                    className="backdrop-blur-md bg-white/10 border-2 border-white/40 text-white hover:bg-white/20 text-lg px-8 py-6 rounded-xl shadow-lg transition-all duration-300 font-semibold"
                  >
                    Pelajari Lebih Lanjut
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Stats Cards - Bottom of Hero */}
        <div className="relative z-10 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              <StatCard
                iconType="pohon"
                value={formatNumber(stats?.total_pohon)}
                label="Total Pohon"
                testId="stat-total-pohon"
                delay={0.4}
              />
              <StatCard
                iconType="partisipan"
                value={formatNumber(stats?.total_partisipan)}
                label="Partisipan"
                testId="stat-partisipan"
                delay={0.5}
              />
              <StatCard
                iconType="opd"
                value={formatNumber(stats?.total_opd)}
                label="OPD Terlibat"
                testId="stat-opd"
                delay={0.6}
              />
              <StatCard
                iconType="lokasi"
                value={formatNumber(stats?.lokasi_stats?.length || 0)}
                label="Lokasi Tanam"
                testId="stat-lokasi"
                delay={0.7}
              />
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-emerald-600 text-sm font-semibold tracking-widest uppercase mb-4">TENTANG PROGRAM</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-6">
                Mopomulo: Satu Orang Sepuluh Pohon
              </h2>
              <p className="text-slate-600 mb-8 leading-relaxed text-lg">
                Program Agro Mopomulo adalah gerakan penghijauan yang mengajak seluruh ASN 
                dan masyarakat Kabupaten Gorontalo Utara untuk menanam pohon. Dengan target 
                setiap orang menanam 10 pohon, kita bersama membangun masa depan yang lebih hijau.
              </p>
              <div className="space-y-5 mb-8">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-md">
                    <Leaf className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-lg">Pelestarian Lingkungan</h4>
                    <p className="text-slate-500">Menjaga keseimbangan ekosistem dan keanekaragaman hayati</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center flex-shrink-0 shadow-md">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-lg">Ketahanan Pangan</h4>
                    <p className="text-slate-500">Mendukung ketersediaan pangan melalui tanaman produktif</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center flex-shrink-0 shadow-md">
                    <Heart className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-lg">Partisipasi Masyarakat</h4>
                    <p className="text-slate-500">Membangun kesadaran kolektif akan pentingnya penghijauan</p>
                  </div>
                </div>
              </div>
              <Link to="/tentang">
                <Button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                  Selengkapnya
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <img
                src="https://images.unsplash.com/photo-1758599668234-68f52db62425?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODh8MHwxfHNlYXJjaHwxfHxwbGFudGluZyUyMHRyZWVzJTIwY29tbXVuaXR5fGVufDB8fHx8MTc2ODQ0NTgxMnww&ixlib=rb-4.1.0&q=85&w=800"
                alt="Kegiatan Penanaman"
                width={800}
                height={500}
                loading="lazy"
                decoding="async"
                className="rounded-3xl shadow-2xl w-full h-[450px] object-cover"
              />
              <div className="absolute -bottom-6 -left-6 backdrop-blur-xl bg-white/90 border border-white/50 rounded-2xl shadow-xl p-5">
                <p className="text-5xl font-bold text-emerald-600">10</p>
                <p className="text-sm text-slate-500 font-medium">Pohon per Orang</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Top OPD Section */}
      {stats?.opd_stats?.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-emerald-600 text-sm font-semibold tracking-widest uppercase mb-4">KONTRIBUSI</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-800">OPD dengan Kontribusi Terbanyak</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stats.opd_stats.slice(0, 3).map((opd, index) => (
                <OPDCard key={opd.opd_id} opd={opd} index={index} formatNumber={formatNumber} />
              ))}
            </div>
            <div className="text-center mt-10">
              <Link to="/kontribusi-opd">
                <Button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                  Lihat Semua OPD
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Agenda Section */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-emerald-600 text-sm font-semibold tracking-widest uppercase mb-4">KEGIATAN</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800">Agenda Penanaman</h2>
            <p className="text-slate-500 mt-4 text-lg">Jadwal kegiatan penanaman yang akan datang</p>
          </div>
          
          {agenda.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agenda.slice(0, 6).map((item, index) => (
                <AgendaCard key={item.id} item={item} index={index} />
              ))}
            </div>
          ) : (
            <div className="backdrop-blur-md bg-white/90 border border-white/50 rounded-2xl shadow-lg">
              <div className="p-12 text-center">
                <Calendar className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 text-lg">Belum ada agenda kegiatan</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Berita Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-emerald-600 text-sm font-semibold tracking-widest uppercase mb-4">INFORMASI</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800">Berita Terbaru</h2>
            <p className="text-slate-500 mt-4 text-lg">Update terkini seputar program Agro Mopomulo</p>
          </div>
          
          {berita.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {berita.slice(0, 6).map((item, index) => (
                <BeritaCard key={item.id} item={item} index={index} />
              ))}
            </div>
          ) : (
            <div className="backdrop-blur-md bg-white/90 border border-white/50 rounded-2xl shadow-lg">
              <div className="p-12 text-center">
                <Newspaper className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 text-lg">Belum ada berita</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-white blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-white blur-3xl"></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Mari Bergabung dalam Gerakan Penghijauan
            </h2>
            <p className="text-emerald-100 mb-10 text-lg sm:text-xl max-w-2xl mx-auto">
              Setiap pohon yang ditanam adalah investasi untuk generasi mendatang. 
              Daftarkan partisipasi Anda sekarang.
            </p>
            <Link to="/partisipasi">
              <Button 
                className="bg-white text-emerald-700 hover:bg-emerald-50 text-lg px-10 py-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 font-bold" 
                data-testid="cta-partisipasi-btn"
              >
                <TreePine className="mr-2 h-6 w-6" />
                Daftar Partisipasi Sekarang
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};
