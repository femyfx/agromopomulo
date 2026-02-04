import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { statsApi } from '../../lib/api';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BuildingIcon, UsersIcon, TreeIcon, GrowthIcon } from '../../components/EnvironmentIcons';

export const KontribusiOPDPage = () => {
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

  const chartColors = ['#059669', '#10B981', '#34D399', '#6EE7B7', '#A7F3D0'];

  return (
    <div className="min-h-screen" data-testid="kontribusi-opd-page">
      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-50 to-slate-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <p className="overline mb-4">KONTRIBUSI</p>
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-800 tracking-tight mb-4">
              Kontribusi OPD
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Lihat kontribusi dari setiap Organisasi Perangkat Daerah dalam program Agro Mopomulo
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
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <Card className="stat-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-xl bg-emerald-100 flex items-center justify-center">
                      <Building2 className="h-7 w-7 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-slate-800">{stats?.total_opd || 0}</p>
                      <p className="text-sm text-slate-500">Total OPD</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="stat-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-xl bg-amber-100 flex items-center justify-center">
                      <Users className="h-7 w-7 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-slate-800">{formatNumber(stats?.total_partisipan)}</p>
                      <p className="text-sm text-slate-500">Total Partisipan</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="stat-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-xl bg-blue-100 flex items-center justify-center">
                      <TreePine className="h-7 w-7 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-slate-800">{formatNumber(stats?.total_pohon)}</p>
                      <p className="text-sm text-slate-500">Total Pohon</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Chart */}
            {stats?.opd_stats?.length > 0 && (
              <Card className="mb-12">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                    Grafik Kontribusi per OPD
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={stats.opd_stats.slice(0, 10)}
                        margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis 
                          dataKey="opd_nama" 
                          stroke="#64748b" 
                          fontSize={11}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          interval={0}
                          tickFormatter={(value) => value.length > 15 ? value.slice(0, 15) + '...' : value}
                        />
                        <YAxis 
                          stroke="#64748b" 
                          fontSize={12}
                          tickFormatter={(value) => formatNumber(value)}
                        />
                        <Tooltip 
                          formatter={(value) => [formatNumber(value), 'Pohon']}
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px'
                          }}
                        />
                        <Bar dataKey="jumlah_pohon" radius={[4, 4, 0, 0]}>
                          {stats.opd_stats.slice(0, 10).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* OPD List */}
            <div>
              <h2 className="section-title mb-6">Daftar Kontribusi OPD</h2>
              {stats?.opd_stats?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {stats.opd_stats.map((opd, index) => (
                    <motion.div
                      key={opd.opd_id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className={`stat-card ${index < 3 ? 'ring-2 ring-amber-400' : ''}`}>
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white font-bold ${
                              index === 0 ? 'bg-amber-500' : 
                              index === 1 ? 'bg-slate-400' : 
                              index === 2 ? 'bg-amber-700' : 'bg-emerald-600'
                            }`}>
                              {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-slate-800 truncate" title={opd.opd_nama}>
                                {opd.opd_nama}
                              </h4>
                              <p className="text-sm text-slate-500">{opd.jumlah_partisipan} partisipan</p>
                            </div>
                          </div>
                          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-sm text-slate-500">Total Pohon</span>
                            <span className="text-xl font-bold text-emerald-600">
                              {formatNumber(opd.jumlah_pohon)}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <Card className="stat-card">
                  <CardContent className="p-12 text-center">
                    <Building2 className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">Belum ada data kontribusi OPD</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
