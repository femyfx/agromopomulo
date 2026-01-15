import { useState, useEffect } from 'react';
import { FileText, Download, TreePine, Users, Building2, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { statsApi, partisipasiApi } from '../../lib/api';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export const LaporanPage = () => {
  const [stats, setStats] = useState(null);
  const [partisipasi, setPartisipasi] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, partisipasiRes] = await Promise.all([
        statsApi.get(),
        partisipasiApi.getAll()
      ]);
      setStats(statsRes.data);
      setPartisipasi(partisipasiRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('id-ID').format(num || 0);
  };

  const chartColors = ['#059669', '#10B981', '#34D399', '#F59E0B', '#64748B', '#8B5CF6'];

  // Prepare pie chart data
  const pieData = stats?.jenis_pohon_stats?.slice(0, 6).map((item, index) => ({
    name: item.jenis,
    value: item.jumlah,
    color: chartColors[index % chartColors.length]
  })) || [];

  return (
    <div className="min-h-screen" data-testid="laporan-page">
      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-50 to-slate-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <p className="overline mb-4">LAPORAN</p>
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-800 tracking-tight mb-4">
              Laporan Program
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Ringkasan dan statistik program Agro Mopomulo
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
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <Card className="stat-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-xl bg-emerald-100 flex items-center justify-center">
                      <TreePine className="h-7 w-7 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-slate-800">{formatNumber(stats?.total_pohon)}</p>
                      <p className="text-sm text-slate-500">Total Pohon</p>
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
                      <p className="text-sm text-slate-500">Partisipan</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="stat-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-xl bg-blue-100 flex items-center justify-center">
                      <Building2 className="h-7 w-7 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-slate-800">{stats?.total_opd || 0}</p>
                      <p className="text-sm text-slate-500">OPD Terlibat</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="stat-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-xl bg-purple-100 flex items-center justify-center">
                      <Calendar className="h-7 w-7 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-slate-800">{stats?.lokasi_stats?.length || 0}</p>
                      <p className="text-sm text-slate-500">Lokasi Tanam</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              {/* Pie Chart - Tree Types */}
              {pieData.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Distribusi Jenis Pohon</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value) => formatNumber(value)}
                            contentStyle={{ 
                              backgroundColor: 'white', 
                              border: '1px solid #e2e8f0',
                              borderRadius: '8px'
                            }}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Top OPD */}
              <Card>
                <CardHeader>
                  <CardTitle>Top 5 OPD Kontributor</CardTitle>
                </CardHeader>
                <CardContent>
                  {stats?.opd_stats?.length > 0 ? (
                    <div className="space-y-4">
                      {stats.opd_stats.slice(0, 5).map((opd, index) => (
                        <div key={opd.opd_id} className="flex items-center gap-4">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                            index === 0 ? 'bg-amber-500' : 
                            index === 1 ? 'bg-slate-400' : 
                            index === 2 ? 'bg-amber-700' : 'bg-emerald-600'
                          }`}>
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-800 truncate">{opd.opd_nama}</p>
                            <p className="text-sm text-slate-500">{opd.jumlah_partisipan} partisipan</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-emerald-600">{formatNumber(opd.jumlah_pohon)}</p>
                            <p className="text-xs text-slate-500">pohon</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-center py-8">Belum ada data</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent Participations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-emerald-600" />
                  Partisipasi Terbaru
                </CardTitle>
              </CardHeader>
              <CardContent>
                {partisipasi.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Nama</th>
                          <th>OPD</th>
                          <th>Jenis Pohon</th>
                          <th>Jumlah</th>
                          <th>Lokasi</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {partisipasi.slice(0, 10).map((p) => (
                          <tr key={p.id}>
                            <td className="font-medium">{p.nama_lengkap}</td>
                            <td>{p.opd_nama}</td>
                            <td>{p.jenis_pohon}</td>
                            <td className="font-semibold text-emerald-600">{p.jumlah_pohon}</td>
                            <td>{p.lokasi_tanam}</td>
                            <td>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                p.status === 'verified' ? 'bg-green-100 text-green-700' :
                                p.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-slate-100 text-slate-700'
                              }`}>
                                {p.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-slate-500 text-center py-8">Belum ada data partisipasi</p>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};
