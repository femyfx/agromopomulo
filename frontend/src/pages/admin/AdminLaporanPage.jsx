import { useState, useEffect, useMemo } from 'react';
import { FileText, TreePine, Users, Building2, Calendar, FileDown, TrendingUp, Target, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { statsApi, partisipasiApi, exportApi } from '../../lib/api';
import { toast } from 'sonner';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export const AdminLaporanPage = () => {
  const [stats, setStats] = useState(null);
  const [progress, setProgress] = useState(null);
  const [partisipasi, setPartisipasi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [kategoriFilter, setKategoriFilter] = useState('all');

  const kategoriOptions = [
    { value: 'all', label: 'Lihat Semua' },
    { value: 'OPD', label: 'OPD' },
    { value: 'DESA', label: 'Desa' },
    { value: 'KECAMATAN', label: 'Kecamatan' },
    { value: 'PUBLIK', label: 'Publik' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, partisipasiRes, progressRes] = await Promise.all([
        statsApi.get(),
        partisipasiApi.getAll(),
        statsApi.getProgress()
      ]);
      setStats(statsRes.data);
      setPartisipasi(partisipasiRes.data);
      setProgress(progressRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
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

  // Filter progress data by kategori
  const filteredProgress = useMemo(() => {
    if (!progress?.progress_list) return { progress_list: [], summary: null };
    
    const filteredList = kategoriFilter === 'all' 
      ? progress.progress_list 
      : progress.progress_list.filter(item => item.kategori === kategoriFilter);
    
    // Recalculate summary based on filtered data
    const totalPersonil = filteredList.reduce((sum, item) => sum + (item.jumlah_personil || 0), 0);
    const totalTarget = filteredList.reduce((sum, item) => sum + (item.target_pohon || 0), 0);
    const totalTertanam = filteredList.reduce((sum, item) => sum + (item.pohon_tertanam || 0), 0);
    const overallProgress = totalTarget > 0 ? Math.round((totalTertanam / totalTarget) * 1000) / 10 : 0;
    
    return {
      progress_list: filteredList,
      summary: {
        total_personil: totalPersonil,
        total_target: totalTarget,
        total_tertanam: totalTertanam,
        overall_progress: overallProgress
      }
    };
  }, [progress, kategoriFilter]);

  const chartColors = ['#059669', '#10B981', '#34D399', '#F59E0B', '#64748B', '#8B5CF6'];

  const pieData = stats?.jenis_pohon_stats?.slice(0, 6).map((item, index) => ({
    name: item.jenis,
    value: item.jumlah,
    color: chartColors[index % chartColors.length]
  })) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div data-testid="admin-laporan-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Laporan Program</h1>
          <p className="text-slate-500">Ringkasan dan statistik program Agro Mopomulo</p>
        </div>
        <div className="flex flex-wrap gap-3">
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
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
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

        {/* Bar Chart - OPD Contribution */}
        {stats?.opd_stats?.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Kontribusi per OPD</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={stats.opd_stats.slice(0, 5)} 
                    margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="opd_nama" 
                      stroke="#64748b" 
                      fontSize={10}
                      angle={-45}
                      textAnchor="end"
                      height={100}
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
                      contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                    />
                    <Bar dataKey="jumlah_pohon" fill="#059669" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Top OPD Table */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Ranking Kontribusi OPD</CardTitle>
        </CardHeader>
        <CardContent>
          {stats?.opd_stats?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Nama OPD</th>
                    <th>Jumlah Partisipan</th>
                    <th>Total Pohon</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.opd_stats.map((opd, index) => (
                    <tr key={opd.opd_id}>
                      <td>
                        <span className={`inline-flex items-center justify-center h-8 w-8 rounded-full text-sm font-bold ${
                          index === 0 ? 'bg-amber-500 text-white' : 
                          index === 1 ? 'bg-slate-400 text-white' : 
                          index === 2 ? 'bg-amber-700 text-white' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="font-medium">{opd.opd_nama}</td>
                      <td>{opd.jumlah_partisipan} orang</td>
                      <td className="font-semibold text-emerald-600">{formatNumber(opd.jumlah_pohon)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-slate-500 text-center py-8">Belum ada data</p>
          )}
        </CardContent>
      </Card>

      {/* Progress Table - Target vs Actual */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
                Progress Penanaman per OPD
              </CardTitle>
              <p className="text-sm text-slate-500 mt-1">
                Rumus: Target = 10 pohon × Jumlah Personil
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-500" />
              <Select value={kategoriFilter} onValueChange={setKategoriFilter}>
                <SelectTrigger className="w-[160px]" data-testid="filter-kategori-progress">
                  <SelectValue placeholder="Filter Kategori" />
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
          </div>
        </CardHeader>
        <CardContent>
          {/* Summary Stats */}
          {filteredProgress?.summary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-slate-50 rounded-lg">
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-800">{formatNumber(filteredProgress.summary.total_personil)}</p>
                <p className="text-xs text-slate-500">Total Personil</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{formatNumber(filteredProgress.summary.total_target)}</p>
                <p className="text-xs text-slate-500">Target Pohon</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-600">{formatNumber(filteredProgress.summary.total_tertanam)}</p>
                <p className="text-xs text-slate-500">Sudah Tertanam</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-600">{filteredProgress.summary.overall_progress}%</p>
                <p className="text-xs text-slate-500">
                  {kategoriFilter === 'all' ? 'Progress Keseluruhan' : `Progress ${kategoriOptions.find(o => o.value === kategoriFilter)?.label}`}
                </p>
              </div>
            </div>
          )}

          {filteredProgress?.progress_list?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nama OPD</th>
                    <th className="text-center">Kategori</th>
                    <th className="text-center">Jumlah Personil</th>
                    <th className="text-center">Target Pohon</th>
                    <th className="text-center">Tertanam</th>
                    <th className="w-[200px]">Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProgress.progress_list.map((item) => (
                    <tr key={item.opd_id}>
                      <td className="font-medium">{item.opd_nama}</td>
                      <td className="text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          item.kategori === 'OPD' ? 'bg-emerald-100 text-emerald-700' :
                          item.kategori === 'DESA' ? 'bg-blue-100 text-blue-700' :
                          item.kategori === 'KECAMATAN' ? 'bg-purple-100 text-purple-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {item.kategori || 'OPD'}
                        </span>
                      </td>
                      <td className="text-center">
                        <span className="inline-flex items-center gap-1 text-blue-600">
                          <Users className="h-4 w-4" />
                          {formatNumber(item.jumlah_personil)}
                        </span>
                      </td>
                      <td className="text-center">
                        <span className="inline-flex items-center gap-1 text-slate-600">
                          <Target className="h-4 w-4" />
                          {formatNumber(item.target_pohon)}
                        </span>
                      </td>
                      <td className="text-center font-semibold text-emerald-600">
                        {formatNumber(item.pohon_tertanam)}
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={item.progress_persen} 
                            className="flex-1 h-3"
                            indicatorClassName={
                              item.progress_persen >= 71 ? 'bg-emerald-500' :
                              item.progress_persen >= 51 ? 'bg-amber-500' : 'bg-red-500'
                            }
                          />
                          <span className={`text-sm font-semibold min-w-[50px] text-right ${
                            item.progress_persen >= 71 ? 'text-emerald-600' :
                            item.progress_persen >= 51 ? 'text-amber-600' : 'text-red-500'
                          }`}>
                            {item.progress_persen}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-slate-500 text-center py-8">
              {kategoriFilter !== 'all' 
                ? `Belum ada data untuk kategori ${kategoriOptions.find(o => o.value === kategoriFilter)?.label}. Tambahkan jumlah personil di menu Kelola OPD.`
                : 'Belum ada data. Tambahkan jumlah personil di menu Kelola OPD.'
              }
            </p>
          )}
        </CardContent>
      </Card>

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
                    <th>Tanggal</th>
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
                      <td className="text-slate-500 text-sm">
                        {new Date(p.created_at).toLocaleDateString('id-ID')}
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
    </div>
  );
};
