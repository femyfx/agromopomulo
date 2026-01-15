import { useState, useEffect } from 'react';
import { BookOpen, ChevronRight, Calendar } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { edukasiApi } from '../../lib/api';
import { motion } from 'framer-motion';

export const EdukasiPage = () => {
  const [edukasi, setEdukasi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState(null);

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

  // Default articles if empty
  const defaultArticles = [
    {
      id: '1',
      judul: 'Manfaat Menanam Pohon untuk Lingkungan',
      konten: `Menanam pohon memiliki banyak manfaat bagi lingkungan dan kehidupan manusia. Berikut adalah beberapa manfaat utama:

1. **Menyerap Karbon Dioksida**: Pohon menyerap CO2 dan menghasilkan oksigen yang kita butuhkan untuk bernapas.

2. **Mencegah Erosi**: Akar pohon membantu menahan tanah dan mencegah erosi, terutama di daerah lereng.

3. **Mengurangi Polusi Udara**: Daun pohon dapat menyaring partikel polutan dari udara.

4. **Menyediakan Habitat**: Pohon menjadi rumah bagi berbagai jenis burung, serangga, dan hewan lainnya.

5. **Mengatur Suhu**: Pohon memberikan naungan dan membantu menurunkan suhu lingkungan sekitar.

Mari bersama-sama menjaga lingkungan dengan menanam pohon!`,
      gambar_url: 'https://images.unsplash.com/photo-1765333534690-ad3a985e7c42?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwxfHxsdXNoJTIwZ3JlZW4lMjBmb3Jlc3QlMjBsYW5kc2NhcGUlMjBpbmRvbmVzaWF8ZW58MHx8fHwxNzY4NDQ1ODE1fDA&ixlib=rb-4.1.0&q=85',
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      judul: 'Cara Menanam Pohon yang Benar',
      konten: `Menanam pohon dengan benar akan meningkatkan peluang pohon untuk tumbuh dengan sehat. Berikut langkah-langkahnya:

1. **Pilih Lokasi yang Tepat**: Pastikan lokasi memiliki cukup sinar matahari dan ruang untuk pertumbuhan akar.

2. **Siapkan Lubang Tanam**: Gali lubang 2-3 kali lebih lebar dari wadah bibit dan sedalam akar.

3. **Tanam dengan Hati-hati**: Keluarkan bibit dari wadah dengan hati-hati, jangan merusak akar.

4. **Siram dengan Cukup**: Siram pohon secara teratur, terutama di minggu-minggu pertama.

5. **Berikan Pupuk**: Gunakan pupuk organik untuk mendukung pertumbuhan.

6. **Rawat Secara Berkala**: Periksa kondisi pohon dan bersihkan gulma di sekitarnya.`,
      gambar_url: 'https://images.unsplash.com/photo-1631401551847-78450ef649d8?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHwxfHxzZWVkbGluZyUyMGluJTIwaGFuZHxlbnwwfHx8fDE3Njg0NDU4MTh8MA&ixlib=rb-4.1.0&q=85',
      created_at: new Date().toISOString()
    },
    {
      id: '3',
      judul: 'Jenis Pohon yang Cocok untuk Ditanam',
      konten: `Pemilihan jenis pohon yang tepat sangat penting untuk keberhasilan program penghijauan. Berikut beberapa jenis pohon yang direkomendasikan:

**Pohon Produktif:**
- Mangga
- Durian
- Kelapa
- Kakao
- Cengkeh

**Pohon Pelindung:**
- Mahoni
- Jati
- Trembesi
- Ketapang
- Flamboyan

**Pohon Buah-buahan Lokal:**
- Rambutan
- Duku
- Langsat
- Jambu

Pilihlah jenis pohon yang sesuai dengan kondisi tanah dan iklim daerah Anda.`,
      gambar_url: 'https://images.unsplash.com/photo-1758599668234-68f52db62425?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODh8MHwxfHNlYXJjaHwxfHxwbGFudGluZyUyMHRyZWVzJTIwY29tbXVuaXR5fGVufDB8fHx8MTc2ODQ0NTgxMnww&ixlib=rb-4.1.0&q=85',
      created_at: new Date().toISOString()
    }
  ];

  const displayArticles = edukasi.length > 0 ? edukasi : defaultArticles;

  return (
    <div className="min-h-screen" data-testid="edukasi-page">
      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-50 to-slate-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <p className="overline mb-4">EDUKASI</p>
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-800 tracking-tight mb-4">
              Edukasi Lingkungan
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Pelajari tentang pentingnya menanam pohon dan cara merawatnya dengan baik
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        ) : selectedArticle ? (
          /* Article Detail View */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <button
              onClick={() => setSelectedArticle(null)}
              className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-6 font-medium"
            >
              <ChevronRight className="h-5 w-5 rotate-180" />
              Kembali ke Daftar Artikel
            </button>
            <Card className="stat-card">
              <CardContent className="p-0">
                {selectedArticle.gambar_url && (
                  <img
                    src={selectedArticle.gambar_url}
                    alt={selectedArticle.judul}
                    className="w-full h-64 md:h-96 object-cover"
                  />
                )}
                <div className="p-8">
                  <h1 className="text-3xl font-bold text-slate-800 mb-4">{selectedArticle.judul}</h1>
                  <div className="flex items-center gap-2 text-slate-500 text-sm mb-6">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(selectedArticle.created_at).toLocaleDateString('id-ID', { 
                      day: 'numeric', month: 'long', year: 'numeric' 
                    })}</span>
                  </div>
                  <div className="prose prose-slate max-w-none">
                    {selectedArticle.konten.split('\n').map((paragraph, index) => (
                      <p key={index} className="text-slate-600 mb-4 leading-relaxed whitespace-pre-wrap">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          /* Article List View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayArticles.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className="stat-card overflow-hidden cursor-pointer group h-full"
                  onClick={() => setSelectedArticle(item)}
                >
                  <CardContent className="p-0 flex flex-col h-full">
                    {item.gambar_url && (
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={item.gambar_url}
                          alt={item.judul}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
                    )}
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-center gap-2 text-emerald-600 text-xs font-medium mb-2">
                        <BookOpen className="h-4 w-4" />
                        <span>ARTIKEL</span>
                      </div>
                      <h3 className="font-semibold text-lg text-slate-800 mb-2 group-hover:text-emerald-600 transition-colors">
                        {item.judul}
                      </h3>
                      <p className="text-sm text-slate-500 line-clamp-3 flex-1">
                        {item.konten.slice(0, 150)}...
                      </p>
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                        <span className="text-xs text-slate-400">
                          {new Date(item.created_at).toLocaleDateString('id-ID')}
                        </span>
                        <span className="text-emerald-600 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                          Baca
                          <ChevronRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
