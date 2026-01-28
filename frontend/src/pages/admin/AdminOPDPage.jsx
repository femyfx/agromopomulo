import { useState, useEffect, useRef } from 'react';
import { Plus, Pencil, Trash2, Building2, Search, Users, FileUp, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog';
import { opdApi } from '../../lib/api';
import { toast } from 'sonner';

export const AdminOPDPage = () => {
  const [opdList, setOpdList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [selectedOPD, setSelectedOPD] = useState(null);
  const [formData, setFormData] = useState({ nama: '', kode: '', alamat: '', jumlah_personil: 0, kategori: 'OPD' });
  const [saving, setSaving] = useState(false);
  const [importKategori, setImportKategori] = useState('');
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);

  const kategoriOptions = [
    { value: 'OPD', label: 'OPD', color: 'bg-emerald-100 text-emerald-700' },
    { value: 'DESA', label: 'Desa', color: 'bg-blue-100 text-blue-700' },
    { value: 'KECAMATAN', label: 'Kecamatan', color: 'bg-purple-100 text-purple-700' },
    { value: 'PUBLIK', label: 'Publik', color: 'bg-amber-100 text-amber-700' }
  ];

  useEffect(() => {
    loadOPD();
  }, []);

  const loadOPD = async () => {
    try {
      const res = await opdApi.getAll();
      setOpdList(res.data);
    } catch (error) {
      console.error('Failed to load OPD:', error);
      toast.error('Gagal memuat data OPD');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (opd = null) => {
    if (opd) {
      setSelectedOPD(opd);
      setFormData({ 
        nama: opd.nama, 
        kode: opd.kode || '', 
        alamat: opd.alamat || '',
        jumlah_personil: opd.jumlah_personil || 0,
        kategori: opd.kategori || 'OPD'
      });
    } else {
      setSelectedOPD(null);
      setFormData({ nama: '', kode: '', alamat: '', jumlah_personil: 0, kategori: 'OPD' });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.nama.trim()) {
      toast.error('Nama OPD wajib diisi');
      return;
    }

    setSaving(true);
    try {
      if (selectedOPD) {
        await opdApi.update(selectedOPD.id, formData);
        toast.success('OPD berhasil diupdate');
      } else {
        await opdApi.create(formData);
        toast.success('OPD berhasil ditambahkan');
      }
      setDialogOpen(false);
      loadOPD();
    } catch (error) {
      console.error('Save failed:', error);
      toast.error('Gagal menyimpan OPD');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedOPD) return;
    
    try {
      await opdApi.delete(selectedOPD.id);
      toast.success('OPD berhasil dihapus');
      setDeleteDialogOpen(false);
      setSelectedOPD(null);
      loadOPD();
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Gagal menghapus OPD');
    }
  };

  const handleOpenImportDialog = () => {
    setImportKategori('');
    setImportFile(null);
    setImportDialogOpen(true);
  };

  const handleImport = async () => {
    if (!importKategori) {
      toast.error('Pilih kategori terlebih dahulu');
      return;
    }
    if (!importFile) {
      toast.error('Pilih file Excel terlebih dahulu');
      return;
    }

    setImporting(true);
    try {
      const res = await opdApi.importExcel(importFile, importKategori);
      toast.success(res.data.message);
      setImportDialogOpen(false);
      setImportFile(null);
      setImportKategori('');
      loadOPD();
    } catch (error) {
      console.error('Import failed:', error);
      toast.error(error.response?.data?.detail || 'Gagal import data');
    } finally {
      setImporting(false);
    }
  };

  const handleDownloadTemplate = () => {
    // Create CSV template
    const csvContent = "nama,kode,alamat,jumlah_personil\nContoh OPD 1,001,Jl. Contoh No. 1,50\nContoh OPD 2,002,Jl. Contoh No. 2,30";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'template_import_opd.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredOPD = opdList.filter(opd => 
    opd.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (opd.kode && opd.kode.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div data-testid="admin-opd-page">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Kelola OPD</h1>
          <p className="text-slate-500">Kelola daftar OPD yang berpartisipasi</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="btn-primary" data-testid="add-opd-btn">
          <Plus className="h-4 w-4 mr-2" />
          Tambah OPD
        </Button>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Cari OPD..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="search-opd"
            />
          </div>
        </CardContent>
      </Card>

      {/* OPD List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      ) : filteredOPD.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOPD.map((opd) => (
            <Card key={opd.id} className="stat-card">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-slate-800 truncate">{opd.nama}</h4>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        opd.kategori === 'OPD' ? 'bg-emerald-100 text-emerald-700' :
                        opd.kategori === 'DESA' ? 'bg-blue-100 text-blue-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {opd.kategori || 'OPD'}
                      </span>
                    </div>
                    {opd.kode && <p className="text-sm text-slate-500">Kode: {opd.kode}</p>}
                    {opd.alamat && <p className="text-sm text-slate-400 truncate">{opd.alamat}</p>}
                    <div className="flex items-center gap-1 mt-1 text-sm text-blue-600">
                      <Users className="h-4 w-4" />
                      <span>{opd.jumlah_personil || 0} Personil</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleOpenDialog(opd)}
                    className="flex-1"
                    data-testid={`edit-opd-${opd.id}`}
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => { setSelectedOPD(opd); setDeleteDialogOpen(true); }}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    data-testid={`delete-opd-${opd.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="stat-card">
          <CardContent className="p-12 text-center">
            <Building2 className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">
              {searchTerm ? 'Tidak ada OPD yang cocok' : 'Belum ada data OPD'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedOPD ? 'Edit OPD' : 'Tambah OPD Baru'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="kategori">Kategori *</Label>
              <Select 
                value={formData.kategori} 
                onValueChange={(value) => setFormData({ ...formData, kategori: value })}
              >
                <SelectTrigger data-testid="select-opd-kategori">
                  <SelectValue placeholder="Pilih Kategori" />
                </SelectTrigger>
                <SelectContent>
                  {kategoriOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="nama">
                {formData.kategori === 'DESA' ? 'Nama Desa *' : formData.kategori === 'PUBLIK' ? 'Nama Instansi *' : 'Nama OPD *'}
              </Label>
              <Input
                id="nama"
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                placeholder={formData.kategori === 'DESA' ? 'Nama Desa' : formData.kategori === 'PUBLIK' ? 'Nama Instansi Publik' : 'Nama OPD'}
                data-testid="input-opd-nama"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kode">Kode</Label>
              <Input
                id="kode"
                value={formData.kode}
                onChange={(e) => setFormData({ ...formData, kode: e.target.value })}
                placeholder="Kode (opsional)"
                data-testid="input-opd-kode"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="alamat">Alamat</Label>
              <Input
                id="alamat"
                value={formData.alamat}
                onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                placeholder="Alamat (opsional)"
                data-testid="input-opd-alamat"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jumlah_personil">Jumlah Personil *</Label>
              <Input
                id="jumlah_personil"
                type="number"
                min="0"
                value={formData.jumlah_personil}
                onChange={(e) => setFormData({ ...formData, jumlah_personil: parseInt(e.target.value) || 0 })}
                placeholder="Jumlah ASN/Personil"
                data-testid="input-opd-personil"
              />
              <p className="text-xs text-slate-500">Target pohon = Jumlah Personil × 10</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={saving} className="btn-primary" data-testid="save-opd-btn">
              {saving ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus OPD?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus OPD "{selectedOPD?.nama}"? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700" data-testid="confirm-delete-opd">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
