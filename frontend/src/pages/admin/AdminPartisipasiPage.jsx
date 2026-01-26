import { useState, useEffect, useRef } from 'react';
import { Search, FileUp, CheckCircle, XCircle, Clock, Filter, Building2, MapPin, ExternalLink } from 'lucide-react';
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
  const [statusFilter, setStatusFilter] = useState('all');
  const [opdFilter, setOpdFilter] = useState('all');
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);

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

  const handleStatusChange = async (id, newStatus) => {
    try {
      await partisipasiApi.update(id, { status: newStatus });
      toast.success('Status berhasil diupdate');
      loadPartisipasi();
    } catch (error) {
      console.error('Update failed:', error);
      toast.error('Gagal mengupdate status');
    }
  };

  const handleDelete = async () => {
    if (!selectedPartisipasi) return;
    
    try {
      await partisipasiApi.delete(selectedPartisipasi.id);
      toast.success('Partisipasi berhasil dihapus');
      setDeleteDialogOpen(false);
      setSelectedPartisipasi(null);
      loadPartisipasi();
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Gagal menghapus partisipasi');
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
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchOpd = opdFilter === 'all' || p.opd_id === opdFilter;
    return matchSearch && matchStatus && matchOpd;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      case 'imported': return 'bg-blue-100 text-blue-700';
      default: return 'bg-yellow-100 text-yellow-700';
    }
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
            <Select value={opdFilter} onValueChange={setOpdFilter}>
              <SelectTrigger className="w-full sm:w-[220px]" data-testid="filter-opd">
                <Building2 className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter OPD" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua OPD</SelectItem>
                {opdList.map((opd) => (
                  <SelectItem key={opd.id} value={opd.id}>{opd.nama}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]" data-testid="filter-status">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="imported">Imported</SelectItem>
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
                    <th>Aksi</th>
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
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => { setSelectedPartisipasi(p); setDetailDialogOpen(true); }}
                            data-testid={`view-${p.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Select 
                            value={p.status} 
                            onValueChange={(value) => handleStatusChange(p.id, value)}
                          >
                            <SelectTrigger className="w-[100px] h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="verified">Verified</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => { setSelectedPartisipasi(p); setDeleteDialogOpen(true); }}
                            className="text-red-600 hover:text-red-700"
                            data-testid={`delete-${p.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detail Partisipasi</DialogTitle>
          </DialogHeader>
          {selectedPartisipasi && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Nama Lengkap</p>
                  <p className="font-medium">{selectedPartisipasi.nama_lengkap}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">NIP</p>
                  <p className="font-medium">{selectedPartisipasi.nip}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Email</p>
                  <p className="font-medium">{selectedPartisipasi.email}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">No. WhatsApp</p>
                  <p className="font-medium">{selectedPartisipasi.nomor_whatsapp}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-slate-500">OPD</p>
                  <p className="font-medium">{selectedPartisipasi.opd_nama}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-slate-500">Alamat</p>
                  <p className="font-medium">{selectedPartisipasi.alamat}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Jumlah Pohon</p>
                  <p className="font-bold text-emerald-600 text-xl">{selectedPartisipasi.jumlah_pohon}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Jenis Pohon</p>
                  <p className="font-medium">{selectedPartisipasi.jenis_pohon}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-slate-500">Sumber Bibit</p>
                  <p className="font-medium">{selectedPartisipasi.sumber_bibit || '-'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-slate-500">Lokasi Tanam</p>
                  <p className="font-medium">{selectedPartisipasi.lokasi_tanam}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-slate-500">Titik Koordinat</p>
                  <p className="font-medium">{selectedPartisipasi.titik_lokasi || '-'}</p>
                </div>
                {selectedPartisipasi.bukti_url && (
                  <div className="col-span-2">
                    <p className="text-sm text-slate-500 mb-2">Bukti Penanaman</p>
                    <img 
                      src={selectedPartisipasi.bukti_url} 
                      alt="Bukti" 
                      className="w-full max-h-48 object-cover rounded-lg"
                    />
                  </div>
                )}
                <div>
                  <p className="text-sm text-slate-500">Status</p>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedPartisipasi.status)}`}>
                    {getStatusIcon(selectedPartisipasi.status)}
                    {selectedPartisipasi.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Tanggal Daftar</p>
                  <p className="font-medium">{new Date(selectedPartisipasi.created_at).toLocaleDateString('id-ID')}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Partisipasi?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus data partisipasi "{selectedPartisipasi?.nama_lengkap}"?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
