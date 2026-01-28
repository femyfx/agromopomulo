import { useState, useEffect, useRef } from 'react';
import { Search, FileUp, Filter, Building2, MapPin, ExternalLink, TreePine } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { partisipasiApi, importApi, opdApi } from '../../lib/api';
import { toast } from 'sonner';

export const AdminPartisipasiPage = () => {
  const [partisipasiList, setPartisipasiList] = useState([]);
  const [opdList, setOpdList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [kategoriFilter, setKategoriFilter] = useState('all');
  const [opdFilter, setOpdFilter] = useState('all');
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);

  const kategoriOptions = [
    { value: 'all', label: 'Semua Kategori' },
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
      const [partisipasiRes, opdRes] = await Promise.all([
        partisipasiApi.getAll(),
        opdApi.getAll()
      ]);
      setPartisipasiList(partisipasiRes.data);
      setOpdList(opdRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const loadPartisipasi = async () => {
    try {
      const res = await partisipasiApi.getAll();
      setPartisipasiList(res.data);
    } catch (error) {
      console.error('Failed to load partisipasi:', error);
      toast.error('Gagal memuat data partisipasi');
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const res = await importApi.excel(file);
      toast.success(`Import berhasil: ${res.data.imported} data`);
      if (res.data.errors?.length > 0) {
        console.warn('Import errors:', res.data.errors);
        toast.warning(`${res.data.errors.length} baris gagal diimport`);
      }
      loadPartisipasi();
    } catch (error) {
      console.error('Import failed:', error);
      toast.error('Gagal import data');
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const filteredList = partisipasiList.filter(p => {
    const matchSearch = p.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       p.nip.includes(searchTerm) ||
                       p.opd_nama?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Get OPD kategori for this partisipasi
    const opd = opdList.find(o => o.id === p.opd_id);
    const opdKategori = opd?.kategori || 'OPD';
    
    const matchKategori = kategoriFilter === 'all' || opdKategori === kategoriFilter;
    const matchOpd = opdFilter === 'all' || p.opd_id === opdFilter;
    return matchSearch && matchKategori && matchOpd;
  });

  // Filter OPD list based on selected kategori
  const filteredOpdList = kategoriFilter === 'all' 
    ? opdList 
    : opdList.filter(opd => opd.kategori === kategoriFilter);

  // Function to open Google Maps with coordinates
  const openLocationInMaps = (titikLokasi, lokasiTanam) => {
    if (titikLokasi) {
      // Parse coordinates from titik_lokasi (format: "lat, lng")
      const coords = titikLokasi.split(',').map(c => c.trim());
      if (coords.length === 2) {
        const url = `https://www.google.com/maps?q=${coords[0]},${coords[1]}`;
        window.open(url, '_blank');
        return;
      }
    }
    // If no coordinates, search by location name
    if (lokasiTanam) {
      const url = `https://www.google.com/maps/search/${encodeURIComponent(lokasiTanam + ', Gorontalo Utara')}`;
      window.open(url, '_blank');
      return;
    }
    toast.error('Lokasi tidak tersedia');
  };

  return (
    <div data-testid="admin-partisipasi-page">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Kelola Partisipasi</h1>
          <p className="text-slate-500">Kelola data partisipasi ASN dalam program</p>
        </div>
        <div>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleImport}
            ref={fileInputRef}
            className="hidden"
            id="import-file"
          />
          <Button 
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="bg-blue-600 hover:bg-blue-700"
            data-testid="import-excel-btn"
          >
            <FileUp className="h-4 w-4 mr-2" />
            {importing ? 'Importing...' : 'Import Excel'}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Cari nama, NIP, atau OPD..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="search-partisipasi"
              />
            </div>
            <Select value={kategoriFilter} onValueChange={(value) => {
              setKategoriFilter(value);
              setOpdFilter('all'); // Reset OPD filter when kategori changes
            }}>
              <SelectTrigger className="w-full sm:w-[180px]" data-testid="filter-kategori">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter Kategori" />
              </SelectTrigger>
              <SelectContent>
                {kategoriOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={opdFilter} onValueChange={setOpdFilter}>
              <SelectTrigger className="w-full sm:w-[220px]" data-testid="filter-opd">
                <Building2 className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter OPD" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {kategoriFilter === 'all' ? 'Semua OPD/Instansi' : `Semua ${kategoriOptions.find(o => o.value === kategoriFilter)?.label}`}
                </SelectItem>
                {filteredOpdList.map((opd) => (
                  <SelectItem key={opd.id} value={opd.id}>{opd.nama}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="stat-card">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-slate-800">{partisipasiList.length}</p>
            <p className="text-sm text-slate-500">Total</p>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {partisipasiList.filter(p => p.status === 'pending').length}
            </p>
            <p className="text-sm text-slate-500">Pending</p>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">
              {partisipasiList.filter(p => p.status === 'verified').length}
            </p>
            <p className="text-sm text-slate-500">Verified</p>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">
              {partisipasiList.reduce((sum, p) => sum + p.jumlah_pohon, 0).toLocaleString('id-ID')}
            </p>
            <p className="text-sm text-slate-500">Total Pohon</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      ) : filteredList.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nama</th>
                    <th>NIP</th>
                    <th>OPD</th>
                    <th>Pohon</th>
                    <th>Jenis</th>
                    <th>Status</th>
                    <th>Cek Lokasi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredList.map((p) => (
                    <tr key={p.id}>
                      <td className="font-medium">{p.nama_lengkap}</td>
                      <td>{p.nip}</td>
                      <td className="max-w-[150px] truncate">{p.opd_nama}</td>
                      <td className="font-semibold text-emerald-600">{p.jumlah_pohon}</td>
                      <td>{p.jenis_pohon}</td>
                      <td>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(p.status)}`}>
                          {getStatusIcon(p.status)}
                          {p.status}
                        </span>
                      </td>
                      <td>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openLocationInMaps(p.titik_lokasi, p.lokasi_tanam)}
                          className="text-blue-600 border-blue-300 hover:bg-blue-50"
                          data-testid={`location-${p.id}`}
                        >
                          <MapPin className="h-4 w-4 mr-1" />
                          <span className="hidden sm:inline">Lihat Maps</span>
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="stat-card">
          <CardContent className="p-12 text-center">
            <p className="text-slate-500">Tidak ada data partisipasi</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
