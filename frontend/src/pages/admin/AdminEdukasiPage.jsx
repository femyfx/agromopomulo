import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog';
import { edukasiApi } from '../../lib/api';
import { toast } from 'sonner';

export const AdminEdukasiPage = () => {
  const [edukasi, setEdukasi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({ judul: '', konten: '', gambar_url: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadEdukasi();
  }, []);

  const loadEdukasi = async () => {
    try {
      const res = await edukasiApi.getAll();
      setEdukasi(res.data);
    } catch (error) {
      console.error('Failed to load edukasi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (item = null) => {
    if (item) {
      setSelectedItem(item);
      setFormData({ judul: item.judul, konten: item.konten, gambar_url: item.gambar_url || '' });
    } else {
      setSelectedItem(null);
      setFormData({ judul: '', konten: '', gambar_url: '' });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.judul.trim() || !formData.konten.trim()) {
      toast.error('Judul dan konten wajib diisi');
      return;
    }

    setSaving(true);
    try {
      if (selectedItem) {
        await edukasiApi.update(selectedItem.id, formData);
        toast.success('Artikel berhasil diupdate');
      } else {
        await edukasiApi.create(formData);
        toast.success('Artikel berhasil ditambahkan');
      }
      setDialogOpen(false);
      loadEdukasi();
    } catch (error) {
      console.error('Save failed:', error);
      toast.error('Gagal menyimpan artikel');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    
    try {
      await edukasiApi.delete(selectedItem.id);
      toast.success('Artikel berhasil dihapus');
      setDeleteDialogOpen(false);
      setSelectedItem(null);
      loadEdukasi();
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Gagal menghapus artikel');
    }
  };

  return (
    <div data-testid="admin-edukasi-page">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Kelola Edukasi</h1>
          <p className="text-slate-500">Kelola artikel edukasi tentang lingkungan</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="btn-primary" data-testid="add-edukasi-btn">
          <Plus className="h-4 w-4 mr-2" />
          Tambah Artikel
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      ) : edukasi.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {edukasi.map((item) => (
            <Card key={item.id} className="stat-card">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  {item.gambar_url && (
                    <img 
                      src={item.gambar_url} 
                      alt={item.judul}
                      className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-800 mb-2">{item.judul}</h4>
                    <p className="text-sm text-slate-500 line-clamp-3">{item.konten}</p>
                    <p className="text-xs text-slate-400 mt-2">
                      {new Date(item.created_at).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleOpenDialog(item)}
                    className="flex-1"
                    data-testid={`edit-edukasi-${item.id}`}
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => { setSelectedItem(item); setDeleteDialogOpen(true); }}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    data-testid={`delete-edukasi-${item.id}`}
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
            <BookOpen className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">Belum ada artikel edukasi</p>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedItem ? 'Edit Artikel' : 'Tambah Artikel Baru'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor="judul">Judul Artikel *</Label>
              <Input
                id="judul"
                value={formData.judul}
                onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                placeholder="Judul artikel edukasi"
                data-testid="input-edukasi-judul"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gambar_url">URL Gambar (opsional)</Label>
              <Input
                id="gambar_url"
                value={formData.gambar_url}
                onChange={(e) => setFormData({ ...formData, gambar_url: e.target.value })}
                placeholder="https://example.com/image.jpg"
                data-testid="input-edukasi-image"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="konten">Konten Artikel *</Label>
              <Textarea
                id="konten"
                value={formData.konten}
                onChange={(e) => setFormData({ ...formData, konten: e.target.value })}
                placeholder="Tulis konten artikel di sini..."
                className="min-h-[200px]"
                data-testid="input-edukasi-konten"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={saving} className="btn-primary" data-testid="save-edukasi-btn">
              {saving ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Artikel?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus artikel "{selectedItem?.judul}"?
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
