import { useState, useEffect } from 'react';
import { MapPin, TreePine, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { statsApi } from '../../lib/api';
import { motion } from 'framer-motion';

export const PetaPenanamanPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await statsApi.get();
      setStats(res.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('id-ID').format(num || 0);
  };

  return (
    <div className="min-h-screen" data-testid="peta-penanaman-page">
      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-50 to-slate-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <p className="overline mb-4">LOKASI</p>
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-800 tracking-tight mb-4">
              Peta Penanaman
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Sebaran lokasi penanaman pohon di Kabupaten Gorontalo Utara
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        ) : (
          <>
            {/* Map Placeholder */}
            <Card className="mb-12 overflow-hidden">
              <CardContent className="p-0">
                <div className="relative h-[400px] bg-gradient-to-br from-emerald-100 to-blue-100">
                  {/* Simple Map Illustration */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="relative">
                        <div className="h-48 w-48 rounded-full bg-emerald-200/50 flex items-center justify-center mx-auto">
                          <div className="h-32 w-32 rounded-full bg-emerald-300/50 flex items-center justify-center">
                            <MapPin className="h-16 w-16 text-emerald-600" />
                          </div>
                        </div>
                        {/* Decorative pins */}
                        {stats?.lokasi_stats?.slice(0, 5).map((_, index) => (
                          <div
                            key={index}
                            className="absolute"
                            style={{
                              top: `${20 + Math.random() * 60}%`,
                              left: `${20 + Math.random() * 60}%`,
                            }}
                          >
                            <div className="h-6 w-6 bg-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                              <TreePine className="h-3 w-3 text-white" />
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="mt-6 text-slate-600 font-medium">Kabupaten Gorontalo Utara</p>
                      <p className="text-sm text-slate-500">Provinsi Gorontalo, Indonesia</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location Stats */}
            <div className="mb-8">
              <h2 className="section-title mb-6">Lokasi Penanaman</h2>
              {stats?.lokasi_stats?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {stats.lokasi_stats.map((lokasi, index) => (
                    <motion.div
                      key={lokasi.lokasi}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="stat-card">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                              <MapPin className="h-6 w-6 text-emerald-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-slate-800 truncate" title={lokasi.lokasi}>
                                {lokasi.lokasi}
                              </h4>
                              <div className="flex items-center gap-4 mt-2">
                                <div className="flex items-center gap-1 text-sm text-slate-500">
                                  <TreePine className="h-4 w-4" />
                                  <span>{formatNumber(lokasi.jumlah_pohon)} pohon</span>
                                </div>
                                <div className="flex items-center gap-1 text-sm text-slate-500">
                                  <Users className="h-4 w-4" />
                                  <span>{lokasi.jumlah_partisipan} orang</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <Card className="stat-card">
                  <CardContent className="p-12 text-center">
                    <MapPin className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">Belum ada data lokasi penanaman</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Tree Types */}
            {stats?.jenis_pohon_stats?.length > 0 && (
              <div>
                <h2 className="section-title mb-6">Jenis Pohon yang Ditanam</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {stats.jenis_pohon_stats.map((jenis, index) => (
                    <motion.div
                      key={jenis.jenis}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="stat-card text-center">
                        <CardContent className="p-4">
                          <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-2">
                            <TreePine className="h-5 w-5 text-emerald-600" />
                          </div>
                          <p className="font-medium text-slate-800 text-sm truncate" title={jenis.jenis}>
                            {jenis.jenis}
                          </p>
                          <p className="text-xs text-slate-500">{formatNumber(jenis.jumlah)} pohon</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
