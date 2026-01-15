import { useState, useEffect, useRef } from 'react';
import { Upload, Save, Image as ImageIcon, Type, FileText, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { settingsApi } from '../../lib/api';
import { toast } from 'sonner';

export const AdminSettingsPage = () => {
  const [settings, setSettings] = useState({
    logo_url: '',
    hero_title: '',
    hero_subtitle: '',
    hero_image_url: '',
    tentang_title: '',
    tentang_content: '',
    tentang_visi: '',
    tentang_misi: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingTentang, setSavingTentang] = useState(false);
  const [uploading, setUploading] = useState(false);
  const logoInputRef = useRef(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await settingsApi.get();
      setSettings(res.data);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsApi.update({
        hero_title: settings.hero_title,
        hero_subtitle: settings.hero_subtitle,
        hero_image_url: settings.hero_image_url
      });
      toast.success('Pengaturan berhasil disimpan');
    } catch (error) {
      console.error('Save failed:', error);
      toast.error('Gagal menyimpan pengaturan');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTentang = async () => {
    setSavingTentang(true);
    try {
      await settingsApi.update({
        tentang_title: settings.tentang_title,
        tentang_content: settings.tentang_content,
        tentang_visi: settings.tentang_visi,
        tentang_misi: settings.tentang_misi
      });
      toast.success('Konten Tentang berhasil disimpan');
    } catch (error) {
      console.error('Save failed:', error);
      toast.error('Gagal menyimpan konten Tentang');
    } finally {
      setSavingTentang(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 2MB');
      return;
    }

    setUploading(true);
    try {
      const res = await settingsApi.uploadLogo(file);
      setSettings(prev => ({ ...prev, logo_url: res.data.logo_url }));
      toast.success('Logo berhasil diupload');
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Gagal mengupload logo');
    } finally {
      setUploading(false);
      if (logoInputRef.current) logoInputRef.current.value = '';
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
    <div data-testid="admin-settings-page">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Pengaturan</h1>
        <p className="text-slate-500">Kelola pengaturan tampilan dashboard</p>
      </div>

      <Tabs defaultValue="branding" className="space-y-6">
        <TabsList>
          <TabsTrigger value="branding" className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="hero" className="flex items-center gap-2">
            <Type className="h-4 w-4" />
            Hero Section
          </TabsTrigger>
          <TabsTrigger value="tentang" className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            Tentang
          </TabsTrigger>
        </TabsList>

        <TabsContent value="branding">
          <Card>
            <CardHeader>
              <CardTitle>Logo Pemda</CardTitle>
              <CardDescription>Upload logo Pemerintah Daerah yang akan ditampilkan di header</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  {settings.logo_url ? (
                    <img 
                      src={settings.logo_url} 
                      alt="Logo Pemda" 
                      className="h-24 w-24 object-contain border border-slate-200 rounded-lg p-2"
                    />
                  ) : (
                    <div className="h-24 w-24 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-slate-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-600 mb-4">
                    Upload logo dalam format PNG, JPG, atau SVG. Ukuran maksimal 2MB. 
                    Disarankan menggunakan gambar dengan background transparan.
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    ref={logoInputRef}
                    className="hidden"
                    id="logo-upload"
                  />
                  <Button 
                    onClick={() => logoInputRef.current?.click()}
                    disabled={uploading}
                    variant="outline"
                    data-testid="upload-logo-btn"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? 'Uploading...' : 'Upload Logo'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hero">
          <Card>
            <CardHeader>
              <CardTitle>Hero Section</CardTitle>
              <CardDescription>Atur tampilan hero section di halaman utama</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="hero_title">Judul Utama</Label>
                <Input
                  id="hero_title"
                  value={settings.hero_title || ''}
                  onChange={(e) => setSettings({ ...settings, hero_title: e.target.value })}
                  placeholder="Gerakan Agro Mopomulo"
                  data-testid="input-hero-title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hero_subtitle">Subjudul</Label>
                <Textarea
                  id="hero_subtitle"
                  value={settings.hero_subtitle || ''}
                  onChange={(e) => setSettings({ ...settings, hero_subtitle: e.target.value })}
                  placeholder="Satu Orang Sepuluh Pohon untuk Masa Depan Daerah"
                  className="min-h-[80px]"
                  data-testid="input-hero-subtitle"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hero_image_url">URL Gambar Background</Label>
                <Input
                  id="hero_image_url"
                  value={settings.hero_image_url || ''}
                  onChange={(e) => setSettings({ ...settings, hero_image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  data-testid="input-hero-image"
                />
                <p className="text-xs text-slate-500">
                  Masukkan URL gambar untuk background hero section. Gunakan gambar landscape dengan resolusi tinggi.
                </p>
              </div>

              {settings.hero_image_url && (
                <div className="mt-4">
                  <Label>Preview</Label>
                  <div className="mt-2 relative h-48 rounded-lg overflow-hidden">
                    <img 
                      src={settings.hero_image_url} 
                      alt="Hero Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 to-transparent flex items-center">
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-white">{settings.hero_title || 'Judul'}</h3>
                        <p className="text-sm text-slate-300 mt-1">{settings.hero_subtitle || 'Subjudul'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <Button 
                onClick={handleSave} 
                disabled={saving}
                className="btn-primary"
                data-testid="save-settings-btn"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
