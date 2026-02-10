import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Newspaper, Image, Link, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Switch } from '../../components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog';
import { beritaApi, settingsApi } from '../../lib/api';
import { toast } from 'sonner';

export const AdminBeritaPage = () => {
  const [beritaList, setBeritaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBerita, setSelectedBerita] = useState(null);
  const [popupInterval, setPopupInterval] = useState(5);
  const [savingInterval, setSavingInterval] = useState(false);
  const [formData, setFormData] = useState({
    judul: '',
    deskripsi_singkat: '',
    link_berita: '',
    gambar_url: '',
    gambar_type: 'link'
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [beritaRes, settingsRes] = await Promise.all([
        beritaApi.getAll(),
        settingsApi.get()
      ]);
      setBeritaList(beritaRes.data);
      setPopupInterval(settingsRes.data.berita_popup_interval || 5);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (berita = null) => {
    if (berita) {
      setSelectedBerita(berita);
      setFormData({
        judul: berita.judul,
        deskripsi_singkat: berita.deskripsi_singkat,
        isi_berita: berita.isi_berita,
        gambar_url: berita.gambar_url || '',
        gambar_type: berita.gambar_type || 'link'
      });
    } else {
      setSelectedBerita(null);
      setFormData({
        judul: '',
        deskripsi_singkat: '',
        isi_berita: '',
        gambar_url: '',
        gambar_type: 'link'
      });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.judul || !formData.deskripsi_singkat || !formData.isi_berita) {
      toast.error('Mohon lengkapi semua field yang wajib');
      return;
    }

    setSaving(true);
    try {
      if (selectedBerita) {
        await beritaApi.update(selectedBerita.id, formData);
        toast.success('Berita berhasil diupdate');
      } else {
        await beritaApi.create(formData);
        toast.success('Berita berhasil ditambahkan');
      }
      setDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Save failed:', error);
      toast.error('Gagal menyimpan berita');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (berita) => {
    try {
      await beritaApi.update(berita.id, { is_active: !berita.is_active });
      toast.success(`Berita ${!berita.is_active ? 'diaktifkan' : 'dinonaktifkan'}`);
      loadData();
    } catch (error) {
      console.error('Toggle failed:', error);
      toast.error('Gagal mengubah status berita');
    }
  };

  const handleDelete = async () => {
    if (!selectedBerita) return;
    try {
      await beritaApi.delete(selectedBerita.id);
      toast.success('Berita berhasil dihapus');
      setDeleteDialogOpen(false);
      setSelectedBerita(null);
      loadData();
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Gagal menghapus berita');
    }
  };

  const handleSaveInterval = async () => {
    setSavingInterval(true);
    try {
      await settingsApi.update({ berita_popup_interval: popupInterval });
      toast.success('Interval popup berhasil disimpan');
    } catch (error) {
      console.error('Save interval failed:', error);
      toast.error('Gagal menyimpan interval');
    } finally {
      setSavingInterval(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, gambar_url: reader.result, gambar_type: 'file' });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div data-testid="admin-berita-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Kelola Berita</h1>
          <p className="text-slate-500">Kelola berita dan pengaturan popup</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="btn-primary" data-testid="add-berita-btn">
          <Plus className="h-4 w-4 mr-2" />
          Tambah Berita
        </Button>
      </div>

      {/* Popup Settings */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg">Pengaturan Popup Berita</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4">
            <div className="flex-1 max-w-xs space-y-2">
              <Label>Interval Popup (detik)</Label>
              <Input
                type="number"
                min="1"
                max="60"
                value={popupInterval}
                onChange={(e) => setPopupInterval(parseInt(e.target.value) || 5)}
                data-testid="input-popup-interval"
              />
              <p className="text-xs text-slate-500">Jeda waktu antar popup berita (dalam detik)</p>
            </div>
            <Button onClick={handleSaveInterval} disabled={savingInterval} variant="outline">
              {savingInterval ? 'Menyimpan...' : 'Simpan Interval'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Berita List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      ) : beritaList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {beritaList.map((berita) => (
            <Card key={berita.id} className={`stat-card hover:shadow-lg transition-shadow ${!berita.is_active ? 'opacity-60' : ''}`}>
              {berita.gambar_url && (
                <div className="h-40 overflow-hidden rounded-t-xl">
                  <img 
                    src={berita.gambar_url} 
                    alt={berita.judul}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    {berita.is_active ? (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">Aktif</span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">Nonaktif</span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleToggleActive(berita)} title={berita.is_active ? 'Nonaktifkan' : 'Aktifkan'}>
                      {berita.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(berita)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => { setSelectedBerita(berita); setDeleteDialogOpen(true); }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <h3 className="font-bold text-lg text-slate-800 mb-2 line-clamp-2">{berita.judul}</h3>
                <p className="text-sm text-slate-500 line-clamp-2 mb-3">{berita.deskripsi_singkat}</p>
                
                <div className="text-xs text-slate-400">
                  {new Date(berita.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="stat-card">
          <CardContent className="p-12 text-center">
            <Newspaper className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">Belum ada berita</p>
            <Button onClick={() => handleOpenDialog()} className="mt-4" variant="outline">
              Tambah Berita Pertama
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedBerita ? 'Edit Berita' : 'Tambah Berita Baru'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Judul Berita *</Label>
              <Input
                value={formData.judul}
                onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                placeholder="Masukkan judul berita..."
                data-testid="input-judul"
              />
            </div>
            <div className="space-y-2">
              <Label>Deskripsi Singkat *</Label>
              <Textarea
                value={formData.deskripsi_singkat}
                onChange={(e) => setFormData({ ...formData, deskripsi_singkat: e.target.value })}
                placeholder="Ringkasan singkat berita (muncul di popup)..."
                className="min-h-[60px]"
                data-testid="input-deskripsi"
              />
            </div>
            <div className="space-y-2">
              <Label>Isi Berita *</Label>
              <Textarea
                value={formData.isi_berita}
                onChange={(e) => setFormData({ ...formData, isi_berita: e.target.value })}
                placeholder="Isi lengkap berita..."
                className="min-h-[150px]"
                data-testid="input-isi"
              />
            </div>
            <div className="space-y-2">
              <Label>Gambar</Label>
              <div className="flex gap-4 mb-2">
                <Button
                  type="button"
                  variant={formData.gambar_type === 'link' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFormData({ ...formData, gambar_type: 'link', gambar_url: '' })}
                >
                  <Link className="h-4 w-4 mr-2" />
                  URL Link
                </Button>
                <Button
                  type="button"
                  variant={formData.gambar_type === 'file' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFormData({ ...formData, gambar_type: 'file', gambar_url: '' })}
                >
                  <Image className="h-4 w-4 mr-2" />
                  Upload File
                </Button>
              </div>
              {formData.gambar_type === 'link' ? (
                <Input
                  value={formData.gambar_url}
                  onChange={(e) => setFormData({ ...formData, gambar_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  data-testid="input-gambar-url"
                />
              ) : (
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  data-testid="input-gambar-file"
                />
              )}
              {formData.gambar_url && (
                <div className="mt-2">
                  <img 
                    src={formData.gambar_url} 
                    alt="Preview" 
                    className="max-h-40 rounded-lg object-cover"
                  />
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={saving} className="btn-primary" data-testid="save-berita-btn">
              {saving ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Berita?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus berita "{selectedBerita?.judul}"?
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
