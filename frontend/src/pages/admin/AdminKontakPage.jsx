import { useState, useEffect } from 'react';
import { Phone, MessageSquare, Save, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { kontakWhatsAppApi } from '../../lib/api';
import { toast } from 'sonner';

export const AdminKontakPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    nomor_whatsapp: '',
    pesan_default: ''
  });
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    loadKontak();
  }, []);

  // Update preview URL when form changes
  useEffect(() => {
    if (formData.nomor_whatsapp) {
      // Normalize number for preview
      let normalizedNumber = formData.nomor_whatsapp
        .replace(/[^0-9]/g, '')
        .replace(/^0/, '62');
      
      if (!normalizedNumber.startsWith('62')) {
        normalizedNumber = '62' + normalizedNumber;
      }
      
      let url = `https://wa.me/${normalizedNumber}`;
      if (formData.pesan_default) {
        url += `?text=${encodeURIComponent(formData.pesan_default)}`;
      }
      setPreviewUrl(url);
    } else {
      setPreviewUrl('');
    }
  }, [formData]);

  const loadKontak = async () => {
    try {
      const res = await kontakWhatsAppApi.get();
      if (res.data && res.data.nomor_whatsapp) {
        // Format nomor untuk display (tambah +)
        let displayNumber = res.data.nomor_whatsapp;
        if (displayNumber && !displayNumber.startsWith('+')) {
          displayNumber = '+' + displayNumber;
        }
        setFormData({
          nomor_whatsapp: displayNumber || '',
          pesan_default: res.data.pesan_default || ''
        });
      }
    } catch (error) {
      console.error('Failed to load kontak:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.nomor_whatsapp.trim()) {
      toast.error('Nomor WhatsApp wajib diisi');
      return;
    }

    setSaving(true);
    try {
      await kontakWhatsAppApi.save({
        nomor_whatsapp: formData.nomor_whatsapp,
        pesan_default: formData.pesan_default
      });
      toast.success('Pengaturan kontak berhasil disimpan');
    } catch (error) {
      console.error('Failed to save:', error);
      const errorMsg = error.response?.data?.detail || 'Gagal menyimpan pengaturan';
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleTestWhatsApp = () => {
    if (previewUrl) {
      window.open(previewUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div data-testid="admin-kontak-page">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Pengaturan Kontak</h1>
        <p className="text-slate-500">Kelola nomor WhatsApp untuk fitur "Hubungi Kami"</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-emerald-600" />
              Nomor WhatsApp Admin
            </CardTitle>
            <CardDescription>
              Nomor ini akan digunakan untuk tombol "Hubungi Kami" di halaman publik
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nomor_whatsapp">
                Nomor WhatsApp <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nomor_whatsapp"
                type="tel"
                placeholder="Contoh: 081234567890 atau +6281234567890"
                value={formData.nomor_whatsapp}
                onChange={(e) => setFormData(prev => ({ ...prev, nomor_whatsapp: e.target.value }))}
                className="font-mono"
                data-testid="input-nomor-wa"
              />
              <p className="text-xs text-slate-500">
                Format yang diterima: 08xxx, +628xxx, atau 628xxx
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pesan_default">
                Pesan Default <span className="text-slate-400">(Opsional)</span>
              </Label>
              <Textarea
                id="pesan_default"
                placeholder="Contoh: Halo Admin, saya ingin bertanya tentang Program Agro Mopomulo..."
                value={formData.pesan_default}
                onChange={(e) => setFormData(prev => ({ ...prev, pesan_default: e.target.value }))}
                rows={3}
                data-testid="input-pesan-default"
              />
              <p className="text-xs text-slate-500">
                Pesan ini akan otomatis terisi saat pengunjung mengklik "Hubungi Kami"
              </p>
            </div>

            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              data-testid="btn-simpan-kontak"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Simpan Pengaturan
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Preview Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-green-600" />
              Preview
            </CardTitle>
            <CardDescription>
              Pratinjau tampilan dan link WhatsApp
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {previewUrl ? (
              <>
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800 font-medium mb-2">Link WhatsApp:</p>
                  <p className="text-xs text-green-700 font-mono break-all">{previewUrl}</p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                  <p className="text-sm text-slate-700 mb-3">
                    Saat pengunjung klik "Hubungi Kami", akan diarahkan ke WhatsApp dengan:
                  </p>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li>• <strong>Nomor:</strong> {formData.nomor_whatsapp}</li>
                    {formData.pesan_default && (
                      <li>• <strong>Pesan:</strong> "{formData.pesan_default.substring(0, 50)}..."</li>
                    )}
                  </ul>
                </div>

                <Button
                  onClick={handleTestWhatsApp}
                  variant="outline"
                  className="w-full border-green-500 text-green-600 hover:bg-green-50"
                  data-testid="btn-test-wa"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Test Buka WhatsApp
                </Button>
              </>
            ) : (
              <div className="p-6 text-center text-slate-400">
                <Phone className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Masukkan nomor WhatsApp untuk melihat preview</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Info Box */}
      <Card className="mt-6 bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className="text-blue-600">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Informasi:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                <li>Nomor akan otomatis dikonversi ke format internasional (628xxx)</li>
                <li>Hanya satu nomor aktif yang disimpan dalam sistem</li>
                <li>Menu "Hubungi Kami" akan muncul di sidebar halaman publik</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
