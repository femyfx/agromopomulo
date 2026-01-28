import { useState, useEffect } from 'react';
import { TreePine, Users, Building2, FileDown, Bell, TrendingUp, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { statsApi, partisipasiApi, exportApi } from '../../lib/api';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [recentPartisipasi, setRecentPartisipasi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

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
      setRecentPartisipasi(partisipasiRes.data.slice(0, 5));
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const res = await exportApi.excel();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'data_partisipasi_agro_mopomulo.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Export Excel berhasil');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Gagal export Excel');
    } finally {
      setExporting(false);
    }
  };

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const res = await exportApi.pdf();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'laporan_agro_mopomulo.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Export PDF berhasil');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Gagal export PDF');
    } finally {
      setExporting(false);
    }
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('id-ID').format(num || 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div data-testid="admin-dashboard">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard Admin</h1>
        <p className="text-slate-500">Selamat datang di panel admin Agro Mopomulo</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Total Pohon</p>
                  <p className="text-3xl font-bold text-slate-800">{formatNumber(stats?.total_pohon)}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <TreePine className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Total Partisipan</p>
                  <p className="text-3xl font-bold text-slate-800">{formatNumber(stats?.total_partisipan)}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Users className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Total OPD</p>
                  <p className="text-3xl font-bold text-slate-800">{stats?.total_opd || 0}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Lokasi Tanam</p>
                  <p className="text-3xl font-bold text-slate-800">{stats?.lokasi_stats?.length || 0}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Export Buttons */}
      <div className="flex flex-wrap gap-4 mb-8">
        <Button 
          onClick={handleExportExcel} 
          disabled={exporting}
          className="bg-green-600 hover:bg-green-700"
          data-testid="export-excel-btn"
        >
          <FileDown className="h-4 w-4 mr-2" />
          Export Excel
        </Button>
        <Button 
          onClick={handleExportPDF} 
          disabled={exporting}
          className="bg-red-600 hover:bg-red-700"
          data-testid="export-pdf-btn"
        >
          <FileDown className="h-4 w-4 mr-2" />
          Export PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* OPD Stats Chart */}
        {stats?.opd_stats?.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
                Kontribusi per OPD
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[420px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={stats.opd_stats.slice(0, 5)} 
                    margin={{ top: 20, right: 30, left: 20, bottom: 140 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="opd_nama" 
                      stroke="#64748b" 
                      fontSize={10}
                      angle={-45}
                      textAnchor="end"
                      height={140}
                      interval={0}
                      tickFormatter={(value) => value.length > 18 ? value.slice(0, 18) + '...' : value}
                    />
                    <YAxis 
                      stroke="#64748b" 
                      fontSize={12}
                      tickFormatter={(value) => formatNumber(value)}
                    />
                    <Tooltip 
                      formatter={(value) => [formatNumber(value), 'Pohon']}
                      contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                    />
                    <Bar dataKey="jumlah_pohon" fill="#059669" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-amber-600" />
              Partisipasi Terbaru
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentPartisipasi.length > 0 ? (
              <div className="space-y-4">
                {recentPartisipasi.map((p) => (
                  <div key={p.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                    <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
                      {p.nama_lengkap.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 truncate">{p.nama_lengkap}</p>
                      <p className="text-sm text-slate-500 truncate">{p.opd_nama}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-600">{p.jumlah_pohon}</p>
                      <p className="text-xs text-slate-500">pohon</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-center py-8">Belum ada partisipasi</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tree Types */}
      {stats?.jenis_pohon_stats?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Distribusi Jenis Pohon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {stats.jenis_pohon_stats.slice(0, 6).map((jenis, index) => (
                <div key={jenis.jenis} className="text-center p-4 bg-slate-50 rounded-lg">
                  <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-2">
                    <TreePine className="h-5 w-5 text-emerald-600" />
                  </div>
                  <p className="font-medium text-slate-800 text-sm truncate">{jenis.jenis}</p>
                  <p className="text-xs text-slate-500">{formatNumber(jenis.jumlah)} pohon</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
