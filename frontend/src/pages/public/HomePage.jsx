import { useState, useEffect, useCallback, memo } from 'react';
import { Link } from 'react-router-dom';
import { TreePine, Users, Building2, MapPin, ArrowRight, Leaf, Target, Heart, Calendar, Newspaper, Clock } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { statsApi, settingsApi, agendaApi, beritaApi } from '../../lib/api';
import { motion } from 'framer-motion';
import { NewsPopup } from '../../components/NewsPopup';

// Glassmorphism stat card component
const StatCard = memo(({ icon: Icon, value, label, gradientFrom, gradientTo, testId, delay }) => (
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
      <div className="flex items-center gap-4">
        <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${gradientFrom} ${gradientTo} flex items-center justify-center shadow-lg`}>
          <Icon className="h-7 w-7 text-white" />
        </div>
        <div>
          <p className="text-3xl font-bold text-white tracking-tight drop-shadow-md">{value}</p>
          <p className="text-sm text-white/80 font-medium">{label}</p>
        </div>
      </div>
    </div>
  </motion.div>
));
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
                icon={TreePine}
                value={formatNumber(stats?.total_pohon)}
                label="Total Pohon"
                gradientFrom="from-emerald-400"
                gradientTo="to-emerald-600"
                testId="stat-total-pohon"
                delay={0.4}
              />
              <StatCard
                icon={Users}
                value={formatNumber(stats?.total_partisipan)}
                label="Partisipan"
                gradientFrom="from-amber-400"
                gradientTo="to-amber-600"
                testId="stat-partisipan"
                delay={0.5}
              />
              <StatCard
                icon={Building2}
                value={formatNumber(stats?.total_opd)}
                label="OPD Terlibat"
                gradientFrom="from-blue-400"
                gradientTo="to-blue-600"
                testId="stat-opd"
                delay={0.6}
              />
              <StatCard
                icon={MapPin}
                value={formatNumber(stats?.lokasi_stats?.length || 0)}
                label="Lokasi Tanam"
                gradientFrom="from-rose-400"
                gradientTo="to-rose-600"
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
