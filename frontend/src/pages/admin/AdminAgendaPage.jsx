import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Calendar, MapPin, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog';
import { agendaApi } from '../../lib/api';
import { toast } from 'sonner';

export const AdminAgendaPage = () => {
  const [agendaList, setAgendaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAgenda, setSelectedAgenda] = useState(null);
  const [formData, setFormData] = useState({
    nama_kegiatan: '',
    hari: '',
    tanggal: '',
    lokasi_kecamatan: '',
    lokasi_desa: '',
    deskripsi: ''
  });
  const [saving, setSaving] = useState(false);

  const hariOptions = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

  useEffect(() => {
    loadAgenda();
  }, []);

  const loadAgenda = async () => {
    try {
      const res = await agendaApi.getAll();
      setAgendaList(res.data);
    } catch (error) {
      console.error('Failed to load agenda:', error);
      toast.error('Gagal memuat data agenda');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (agenda = null) => {
    if (agenda) {
      setSelectedAgenda(agenda);
      setFormData({
        nama_kegiatan: agenda.nama_kegiatan,
        hari: agenda.hari,
        tanggal: agenda.tanggal,
        lokasi_kecamatan: agenda.lokasi_kecamatan,
        lokasi_desa: agenda.lokasi_desa,
        deskripsi: agenda.deskripsi || ''
      });
    } else {
      setSelectedAgenda(null);
      setFormData({
        nama_kegiatan: '',
        hari: '',
        tanggal: '',
        lokasi_kecamatan: '',
        lokasi_desa: '',
        deskripsi: ''
      });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.nama_kegiatan || !formData.hari || !formData.tanggal || !formData.lokasi_kecamatan || !formData.lokasi_desa) {
      toast.error('Mohon lengkapi semua field yang wajib');
      return;
    }

    setSaving(true);
    try {
      if (selectedAgenda) {
        await agendaApi.update(selectedAgenda.id, formData);
        toast.success('Agenda berhasil diupdate');
      } else {
        await agendaApi.create(formData);
        toast.success('Agenda berhasil ditambahkan');
      }
      setDialogOpen(false);
      loadAgenda();
    } catch (error) {
      console.error('Save failed:', error);
      toast.error('Gagal menyimpan agenda');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await agendaApi.update(id, { status: newStatus });
      toast.success('Status agenda berhasil diupdate');
      loadAgenda();
    } catch (error) {
      console.error('Update failed:', error);
      toast.error('Gagal mengupdate status');
    }
  };

  const handleDelete = async () => {
    if (!selectedAgenda) return;
    try {
      await agendaApi.delete(selectedAgenda.id);
      toast.success('Agenda berhasil dihapus');
      setDeleteDialogOpen(false);
      setSelectedAgenda(null);
      loadAgenda();
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Gagal menghapus agenda');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ongoing': return 'bg-green-100 text-green-700';
      case 'completed': return 'bg-gray-100 text-gray-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'ongoing': return 'Berlangsung';
      case 'completed': return 'Selesai';
      default: return 'Akan Datang';
    }
  };

  return (
    <div data-testid="admin-agenda-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Kelola Agenda</h1>
          <p className="text-slate-500">Kelola agenda kegiatan penanaman</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="btn-primary" data-testid="add-agenda-btn">
          <Plus className="h-4 w-4 mr-2" />
          Tambah Agenda
        </Button>
      </div>

      {/* Agenda List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      ) : agendaList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agendaList.map((agenda) => (
            <Card key={agenda.id} className="stat-card hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(agenda.status)}`}>
                    {getStatusLabel(agenda.status)}
                  </span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(agenda)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => { setSelectedAgenda(agenda); setDeleteDialogOpen(true); }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <h3 className="font-bold text-lg text-slate-800 mb-3">{agenda.nama_kegiatan}</h3>
                
                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-emerald-600" />
                    <span>{agenda.hari}, {new Date(agenda.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-emerald-600" />
                    <span>Kec. {agenda.lokasi_kecamatan}, Desa {agenda.lokasi_desa}</span>
                  </div>
                </div>

                {agenda.deskripsi && (
                  <p className="mt-3 text-sm text-slate-500 line-clamp-2">{agenda.deskripsi}</p>
                )}

                <div className="mt-4 pt-4 border-t">
                  <Select value={agenda.status} onValueChange={(value) => handleStatusChange(agenda.id, value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upcoming">Akan Datang</SelectItem>
                      <SelectItem value="ongoing">Berlangsung</SelectItem>
                      <SelectItem value="completed">Selesai</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="stat-card">
          <CardContent className="p-12 text-center">
            <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">Belum ada agenda kegiatan</p>
            <Button onClick={() => handleOpenDialog()} className="mt-4" variant="outline">
              Tambah Agenda Pertama
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedAgenda ? 'Edit Agenda' : 'Tambah Agenda Baru'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nama Kegiatan *</Label>
              <Input
                value={formData.nama_kegiatan}
                onChange={(e) => setFormData({ ...formData, nama_kegiatan: e.target.value })}
                placeholder="Contoh: Penanaman Pohon di Desa Kwandang"
                data-testid="input-nama-kegiatan"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Hari *</Label>
                <Select value={formData.hari} onValueChange={(value) => setFormData({ ...formData, hari: value })}>
                  <SelectTrigger data-testid="select-hari">
                    <SelectValue placeholder="Pilih Hari" />
                  </SelectTrigger>
                  <SelectContent>
                    {hariOptions.map((hari) => (
                      <SelectItem key={hari} value={hari}>{hari}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tanggal *</Label>
                <Input
                  type="date"
                  value={formData.tanggal}
                  onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                  data-testid="input-tanggal"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kecamatan *</Label>
                <Input
                  value={formData.lokasi_kecamatan}
                  onChange={(e) => setFormData({ ...formData, lokasi_kecamatan: e.target.value })}
                  placeholder="Nama Kecamatan"
                  data-testid="input-kecamatan"
                />
              </div>
              <div className="space-y-2">
                <Label>Desa *</Label>
                <Input
                  value={formData.lokasi_desa}
                  onChange={(e) => setFormData({ ...formData, lokasi_desa: e.target.value })}
                  placeholder="Nama Desa"
                  data-testid="input-desa"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Deskripsi (Opsional)</Label>
              <Textarea
                value={formData.deskripsi}
                onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                placeholder="Deskripsi singkat kegiatan..."
                className="min-h-[80px]"
                data-testid="input-deskripsi"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={saving} className="btn-primary" data-testid="save-agenda-btn">
              {saving ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Agenda?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus agenda "{selectedAgenda?.nama_kegiatan}"?
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
