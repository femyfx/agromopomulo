import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TreePine, Users, Building2, MapPin, ArrowRight, Leaf, Target, Heart } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { statsApi, settingsApi } from '../../lib/api';
import { motion } from 'framer-motion';

export const HomePage = () => {
  const [stats, setStats] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, settingsRes] = await Promise.all([
        statsApi.get(),
        settingsApi.get()
      ]);
      setStats(statsRes.data);
      setSettings(settingsRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('id-ID').format(num || 0);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('${settings?.hero_image_url || 'https://images.unsplash.com/photo-1765333534690-ad3a985e7c42?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwxfHxsdXNoJTIwZ3JlZW4lMjBmb3Jlc3QlMjBsYW5kc2NhcGUlMjBpbmRvbmVzaWF8ZW58MHx8fHwxNzY4NDQ1ODE1fDA&ixlib=rb-4.1.0&q=85'}')`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <p className="overline text-emerald-400 mb-4">KABUPATEN GORONTALO UTARA</p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-6">
                {settings?.hero_title || 'Gerakan Agro Mopomulo'}
              </h1>
              <p className="text-xl text-slate-300 mb-8">
                {settings?.hero_subtitle || 'Satu Orang Sepuluh Pohon untuk Masa Depan Daerah'}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-wrap gap-4"
            >
              <Link to="/partisipasi">
                <Button className="btn-primary text-lg px-8 py-6" data-testid="hero-partisipasi-btn">
                  Ikut Berpartisipasi
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/tentang">
                <Button variant="outline" className="text-lg px-8 py-6 border-white/30 text-white hover:bg-white/10">
                  Pelajari Lebih Lanjut
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative -mt-20 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <Card className="stat-card" data-testid="stat-total-pohon">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-xl bg-emerald-100 flex items-center justify-center">
                      <TreePine className="h-7 w-7 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-slate-800 tracking-tight">
                        {formatNumber(stats?.total_pohon)}
                      </p>
                      <p className="text-sm text-slate-500">Total Pohon</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Card className="stat-card" data-testid="stat-partisipan">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-xl bg-amber-100 flex items-center justify-center">
                      <Users className="h-7 w-7 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-slate-800 tracking-tight">
                        {formatNumber(stats?.total_partisipan)}
                      </p>
                      <p className="text-sm text-slate-500">Partisipan</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <Card className="stat-card" data-testid="stat-opd">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-xl bg-blue-100 flex items-center justify-center">
                      <Building2 className="h-7 w-7 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-slate-800 tracking-tight">
                        {formatNumber(stats?.total_opd)}
                      </p>
                      <p className="text-sm text-slate-500">OPD Terlibat</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <Card className="stat-card" data-testid="stat-lokasi">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-xl bg-rose-100 flex items-center justify-center">
                      <MapPin className="h-7 w-7 text-rose-600" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-slate-800 tracking-tight">
                        {formatNumber(stats?.lokasi_stats?.length || 0)}
                      </p>
                      <p className="text-sm text-slate-500">Lokasi Tanam</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <p className="overline mb-4">TENTANG PROGRAM</p>
              <h2 className="section-title mb-6">
                Mopomulo: Satu Orang Sepuluh Pohon
              </h2>
              <p className="text-slate-600 mb-6 leading-relaxed">
                Program Agro Mopomulo adalah gerakan penghijauan yang mengajak seluruh ASN 
                dan masyarakat Kabupaten Gorontalo Utara untuk menanam pohon. Dengan target 
                setiap orang menanam 10 pohon, kita bersama membangun masa depan yang lebih hijau.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <Leaf className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">Pelestarian Lingkungan</h4>
                    <p className="text-sm text-slate-500">Menjaga keseimbangan ekosistem dan keanekaragaman hayati</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Target className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">Ketahanan Pangan</h4>
                    <p className="text-sm text-slate-500">Mendukung ketersediaan pangan melalui tanaman produktif</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-rose-100 flex items-center justify-center flex-shrink-0">
                    <Heart className="h-5 w-5 text-rose-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">Partisipasi Masyarakat</h4>
                    <p className="text-sm text-slate-500">Membangun kesadaran kolektif akan pentingnya penghijauan</p>
                  </div>
                </div>
              </div>
              <Link to="/tentang">
                <Button className="btn-outline">
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
                src="https://images.unsplash.com/photo-1758599668234-68f52db62425?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODh8MHwxfHNlYXJjaHwxfHxwbGFudGluZyUyMHRyZWVzJTIwY29tbXVuaXR5fGVufDB8fHx8MTc2ODQ0NTgxMnww&ixlib=rb-4.1.0&q=85"
                alt="Kegiatan Penanaman"
                className="rounded-2xl shadow-xl w-full h-[400px] object-cover"
              />
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-4">
                <p className="text-4xl font-bold text-emerald-600">10</p>
                <p className="text-sm text-slate-500">Pohon per Orang</p>
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
              <p className="overline mb-4">KONTRIBUSI</p>
              <h2 className="section-title">OPD dengan Kontribusi Terbanyak</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stats.opd_stats.slice(0, 3).map((opd, index) => (
                <motion.div
                  key={opd.opd_id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`stat-card ${index === 0 ? 'ring-2 ring-amber-500' : ''}`}>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                          index === 0 ? 'bg-amber-500' : index === 1 ? 'bg-slate-400' : 'bg-amber-700'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-slate-800 truncate">{opd.opd_nama}</h4>
                          <p className="text-sm text-slate-500">{opd.jumlah_partisipan} partisipan</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">Total Pohon</span>
                        <span className="text-2xl font-bold text-emerald-600">
                          {formatNumber(opd.jumlah_pohon)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link to="/kontribusi-opd">
                <Button className="btn-outline">
                  Lihat Semua OPD
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-emerald-600 to-emerald-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Mari Bergabung dalam Gerakan Penghijauan
            </h2>
            <p className="text-emerald-100 mb-8 text-lg">
              Setiap pohon yang ditanam adalah investasi untuk generasi mendatang. 
              Daftarkan partisipasi Anda sekarang.
            </p>
            <Link to="/partisipasi">
              <Button className="bg-white text-emerald-700 hover:bg-emerald-50 text-lg px-8 py-6" data-testid="cta-partisipasi-btn">
                <TreePine className="mr-2 h-5 w-5" />
                Daftar Partisipasi Sekarang
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};
