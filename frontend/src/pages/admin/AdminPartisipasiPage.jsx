import { useState, useEffect, useRef } from 'react';
import { Search, FileUp, Filter, Building2, MapPin, ExternalLink, TreePine, Pencil, Trash2, X, Save, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
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

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPartisipasi, setEditingPartisipasi] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [saving, setSaving] = useState(false);

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingPartisipasi, setDeletingPartisipasi] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const kategoriOptions = [
    { value: 'all', label: 'Semua Kategori' },
    { value: 'OPD', label: 'OPD' },
    { value: 'DESA', label: 'Desa' },
    { value: 'KECAMATAN', label: 'Kecamatan' },
    { value: 'PUBLIK', label: 'Publik' }
  ];

  const jenisPohonOptions = [
    'Mangga', 'Durian', 'Kelapa', 'Mahoni', 'Jati', 'Trembesi', 
    'Rambutan', 'Jambu', 'Kakao', 'Cengkeh', 'Lainnya'
  ];

  const sumberBibitOptions = [
    'Pemerintah Daerah', 'Dinas Pertanian', 'Dinas Kehutanan',
    'Swadaya Masyarakat', 'Bantuan CSR', 'Pembelian Mandiri', 'Lainnya'
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

  // === EDIT FUNCTIONS ===
  const openEditModal = (partisipasi) => {
    setEditingPartisipasi(partisipasi);
    // Parse titik_lokasi to get lat/lng
    let latitude = '';
    let longitude = '';
    if (partisipasi.titik_lokasi && partisipasi.titik_lokasi !== 'None') {
      const coords = partisipasi.titik_lokasi.split(',').map(c => c.trim());
      if (coords.length === 2) {
        latitude = coords[0];
        longitude = coords[1];
      }
    }
    setEditFormData({
      nama_lengkap: partisipasi.nama_lengkap || '',
      nip: partisipasi.nip || '',
      email: partisipasi.email || '',
      opd_id: partisipasi.opd_id || '',
      alamat: partisipasi.alamat || '',
      nomor_whatsapp: partisipasi.nomor_whatsapp || '',
      jumlah_pohon: partisipasi.jumlah_pohon || 0,
      jenis_pohon: partisipasi.jenis_pohon || '',
      sumber_bibit: partisipasi.sumber_bibit || '',
      lokasi_tanam: partisipasi.lokasi_tanam || '',
      latitude: latitude,
      longitude: longitude,
      bukti_url: partisipasi.bukti_url || ''
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingPartisipasi(null);
    setEditFormData({});
  };

  const handleEditChange = (field, value) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveEdit = async () => {
    if (!editingPartisipasi) return;

    // Validate required fields
    if (!editFormData.nama_lengkap) {
      toast.error('Nama lengkap wajib diisi');
      return;
    }
    if (!editFormData.opd_id) {
      toast.error('OPD/Instansi wajib dipilih');
      return;
    }
    if (!editFormData.jumlah_pohon || parseInt(editFormData.jumlah_pohon) < 1) {
      toast.error('Jumlah pohon minimal 1');
      return;
    }

    setSaving(true);
    try {
      // Combine lat/lng into titik_lokasi
      const titik_lokasi = editFormData.latitude && editFormData.longitude
        ? `${editFormData.latitude}, ${editFormData.longitude}`
        : '';

      const updateData = {
        nama_lengkap: editFormData.nama_lengkap,
        nip: editFormData.nip || '',
        email: editFormData.email || '',
        opd_id: editFormData.opd_id,
        alamat: editFormData.alamat || '',
        nomor_whatsapp: editFormData.nomor_whatsapp || '',
        jumlah_pohon: parseInt(editFormData.jumlah_pohon),
        jenis_pohon: editFormData.jenis_pohon || '',
        sumber_bibit: editFormData.sumber_bibit || '',
        lokasi_tanam: editFormData.lokasi_tanam || '',
        titik_lokasi: titik_lokasi,
        bukti_url: editFormData.bukti_url || ''
      };

      await partisipasiApi.update(editingPartisipasi.id, updateData);
      toast.success('Data partisipasi berhasil diperbarui');
      closeEditModal();
      loadPartisipasi();
    } catch (error) {
      console.error('Failed to update:', error);
      toast.error('Gagal memperbarui data');
    } finally {
      setSaving(false);
    }
  };

  // === DELETE FUNCTIONS ===
  const openDeleteModal = (partisipasi) => {
    setDeletingPartisipasi(partisipasi);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletingPartisipasi(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingPartisipasi) return;

    setDeleting(true);
    try {
      await partisipasiApi.delete(deletingPartisipasi.id);
      toast.success('Data partisipasi berhasil dihapus');
      closeDeleteModal();
      loadPartisipasi();
    } catch (error) {
      console.error('Failed to delete:', error);
      toast.error('Gagal menghapus data');
    } finally {
      setDeleting(false);
    }
  };

  const filteredList = partisipasiList.filter(p => {
    const matchSearch = p.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       p.nip?.includes(searchTerm) ||
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
    if (titikLokasi && titikLokasi !== 'None') {
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
            <p className="text-2xl font-bold text-slate-800">{filteredList.length}</p>
            <p className="text-sm text-slate-500">
              {kategoriFilter === 'all' ? 'Total Partisipan' : `Partisipan ${kategoriOptions.find(o => o.value === kategoriFilter)?.label}`}
            </p>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">
              {filteredList.reduce((sum, p) => sum + p.jumlah_pohon, 0).toLocaleString('id-ID')}
            </p>
            <p className="text-sm text-slate-500">Total Pohon</p>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{filteredOpdList.length}</p>
            <p className="text-sm text-slate-500">
              {kategoriFilter === 'all' ? 'Total OPD/Instansi' : `Jumlah ${kategoriOptions.find(o => o.value === kategoriFilter)?.label}`}
            </p>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">
              {filteredList.length > 0 ? Math.round(filteredList.reduce((sum, p) => sum + p.jumlah_pohon, 0) / filteredList.length) : 0}
            </p>
            <p className="text-sm text-slate-500">Rata-rata Pohon/Orang</p>
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
                    <th>OPD/Instansi</th>
                    <th>Kategori</th>
                    <th>Pohon</th>
                    <th>Jenis</th>
                    <th>Cek Lokasi</th>
                    <th className="text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredList.map((p) => {
                    const opd = opdList.find(o => o.id === p.opd_id);
                    const kategori = opd?.kategori || 'OPD';
                    return (
                      <tr key={p.id}>
                        <td className="font-medium">{p.nama_lengkap}</td>
                        <td>{p.nip || '-'}</td>
                        <td className="max-w-[150px] truncate">{p.opd_nama}</td>
                        <td>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            kategori === 'OPD' ? 'bg-emerald-100 text-emerald-700' :
                            kategori === 'DESA' ? 'bg-blue-100 text-blue-700' :
                            kategori === 'KECAMATAN' ? 'bg-purple-100 text-purple-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {kategori}
                          </span>
                        </td>
                        <td className="font-semibold text-emerald-600">{p.jumlah_pohon}</td>
                        <td>{p.jenis_pohon}</td>
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
                        <td>
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditModal(p)}
                              className="text-amber-600 border-amber-300 hover:bg-amber-50"
                              data-testid={`edit-${p.id}`}
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="hidden lg:inline ml-1">Edit</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openDeleteModal(p)}
                              className="text-red-600 border-red-300 hover:bg-red-50"
                              data-testid={`delete-${p.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="hidden lg:inline ml-1">Hapus</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="stat-card">
          <CardContent className="p-12 text-center">
            <TreePine className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">
              {kategoriFilter !== 'all' 
                ? `Tidak ada data partisipasi untuk kategori ${kategoriOptions.find(o => o.value === kategoriFilter)?.label}`
                : 'Tidak ada data partisipasi'
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Edit Modal */}
      {showEditModal && editingPartisipasi && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={closeEditModal}></div>
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-800">Edit Data Partisipasi</h3>
                <button
                  onClick={closeEditModal}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                {/* Data Pribadi */}
                <div>
                  <h4 className="font-medium text-slate-700 mb-3 border-b pb-2">Data Pribadi</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-nama">Nama Lengkap <span className="text-red-500">*</span></Label>
                      <Input
                        id="edit-nama"
                        value={editFormData.nama_lengkap || ''}
                        onChange={(e) => handleEditChange('nama_lengkap', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-nip">NIP</Label>
                      <Input
                        id="edit-nip"
                        value={editFormData.nip || ''}
                        onChange={(e) => handleEditChange('nip', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-email">Email</Label>
                      <Input
                        id="edit-email"
                        type="email"
                        value={editFormData.email || ''}
                        onChange={(e) => handleEditChange('email', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-whatsapp">Nomor WhatsApp</Label>
                      <Input
                        id="edit-whatsapp"
                        value={editFormData.nomor_whatsapp || ''}
                        onChange={(e) => handleEditChange('nomor_whatsapp', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Instansi */}
                <div>
                  <h4 className="font-medium text-slate-700 mb-3 border-b pb-2">Instansi</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="edit-opd">OPD/Instansi <span className="text-red-500">*</span></Label>
                      <Select 
                        value={editFormData.opd_id || ''} 
                        onValueChange={(value) => handleEditChange('opd_id', value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Pilih OPD/Instansi" />
                        </SelectTrigger>
                        <SelectContent>
                          {opdList.map((opd) => (
                            <SelectItem key={opd.id} value={opd.id}>
                              {opd.nama} ({opd.kategori})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="edit-alamat">Alamat</Label>
                      <Input
                        id="edit-alamat"
                        value={editFormData.alamat || ''}
                        onChange={(e) => handleEditChange('alamat', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Data Pohon */}
                <div>
                  <h4 className="font-medium text-slate-700 mb-3 border-b pb-2">Data Pohon</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="edit-jumlah">Jumlah Pohon <span className="text-red-500">*</span></Label>
                      <Input
                        id="edit-jumlah"
                        type="number"
                        min="1"
                        value={editFormData.jumlah_pohon || ''}
                        onChange={(e) => handleEditChange('jumlah_pohon', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-jenis">Jenis Pohon</Label>
                      <Select 
                        value={editFormData.jenis_pohon || ''} 
                        onValueChange={(value) => handleEditChange('jenis_pohon', value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Pilih Jenis" />
                        </SelectTrigger>
                        <SelectContent>
                          {jenisPohonOptions.map((jenis) => (
                            <SelectItem key={jenis} value={jenis}>{jenis}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="edit-sumber">Sumber Bibit</Label>
                      <Select 
                        value={editFormData.sumber_bibit || ''} 
                        onValueChange={(value) => handleEditChange('sumber_bibit', value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Pilih Sumber" />
                        </SelectTrigger>
                        <SelectContent>
                          {sumberBibitOptions.map((sumber) => (
                            <SelectItem key={sumber} value={sumber}>{sumber}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Lokasi */}
                <div>
                  <h4 className="font-medium text-slate-700 mb-3 border-b pb-2">Lokasi Penanaman</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="edit-lokasi">Nama Lokasi</Label>
                      <Input
                        id="edit-lokasi"
                        value={editFormData.lokasi_tanam || ''}
                        onChange={(e) => handleEditChange('lokasi_tanam', e.target.value)}
                        placeholder="Contoh: Desa Kwandang"
                        className="mt-1"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="edit-lat">Latitude</Label>
                        <Input
                          id="edit-lat"
                          value={editFormData.latitude || ''}
                          onChange={(e) => handleEditChange('latitude', e.target.value)}
                          placeholder="Contoh: 0.803652"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-lng">Longitude</Label>
                        <Input
                          id="edit-lng"
                          value={editFormData.longitude || ''}
                          onChange={(e) => handleEditChange('longitude', e.target.value)}
                          placeholder="Contoh: 122.881664"
                          className="mt-1"
                        />
                      </div>
                    </div>
                    {editFormData.latitude && editFormData.longitude && (
                      <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-lg border border-emerald-200">
                        <MapPin className="h-4 w-4 text-emerald-600" />
                        <span className="text-sm text-emerald-700">
                          Koordinat: {editFormData.latitude}, {editFormData.longitude}
                        </span>
                        <a 
                          href={`https://www.google.com/maps?q=${editFormData.latitude},${editFormData.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-auto text-xs text-emerald-600 hover:underline"
                        >
                          Lihat di Maps
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex justify-end gap-3">
                <Button variant="outline" onClick={closeEditModal}>
                  Batal
                </Button>
                <Button 
                  onClick={handleSaveEdit} 
                  disabled={saving}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Simpan Perubahan
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingPartisipasi && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={closeDeleteModal}></div>
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 text-center mb-2">
                  Konfirmasi Hapus
                </h3>
                <p className="text-slate-600 text-center mb-2">
                  Apakah Anda yakin ingin menghapus data partisipasi:
                </p>
                <div className="bg-slate-50 rounded-lg p-3 mb-4">
                  <p className="font-medium text-slate-800">{deletingPartisipasi.nama_lengkap}</p>
                  <p className="text-sm text-slate-500">{deletingPartisipasi.opd_nama}</p>
                  <p className="text-sm text-emerald-600">{deletingPartisipasi.jumlah_pohon} pohon {deletingPartisipasi.jenis_pohon}</p>
                </div>
                <p className="text-sm text-red-600 text-center mb-4">
                  Tindakan ini tidak dapat dibatalkan.
                </p>
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={closeDeleteModal}
                    className="flex-1"
                  >
                    Batal
                  </Button>
                  <Button 
                    onClick={handleConfirmDelete}
                    disabled={deleting}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    {deleting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Menghapus...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Ya, Hapus
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
