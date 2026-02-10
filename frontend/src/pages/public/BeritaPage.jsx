import { useState, useEffect } from 'react';
import { Newspaper, X, Search } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { beritaApi } from '../../lib/api';
import { motion, AnimatePresence } from 'framer-motion';

export const BeritaPage = () => {
  const [berita, setBerita] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBerita, setSelectedBerita] = useState(null);

  useEffect(() => {
    loadBerita();
  }, []);

  const loadBerita = async () => {
    try {
      const res = await beritaApi.getActive();
      setBerita(res.data);
    } catch (error) {
      console.error('Failed to load berita:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBerita = berita.filter(item =>
    item.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.deskripsi_singkat.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen" data-testid="berita-page">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-600 to-emerald-700 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-emerald-200 text-sm font-medium mb-2">INFORMASI TERKINI</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Berita & Informasi
            </h1>
            <p className="text-emerald-100 max-w-2xl mx-auto">
              Update terkini seputar Program Agro Mopomulo Kabupaten Gorontalo Utara
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search & Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search */}
          <div className="flex justify-between items-center mb-8">
            <p className="text-slate-600">
              Menampilkan <span className="font-semibold">{filteredBerita.length}</span> berita
            </p>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Cari berita..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="search-berita"
              />
            </div>
          </div>

          {/* Berita List */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
          ) : filteredBerita.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBerita.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card 
                    className="h-full hover:shadow-lg transition-shadow overflow-hidden group cursor-pointer"
                    onClick={() => {
                      // Prioritaskan link_berita, fallback ke isi_berita jika itu URL
                      const link = item.link_berita || item.isi_berita;
                      if (link) {
                        try {
                          new URL(link);
                          window.open(link, '_blank', 'noopener,noreferrer');
                        } catch {
                          // Jika bukan URL, tampilkan modal detail
                          setSelectedBerita(item);
                        }
                      } else {
                        setSelectedBerita(item);
                      }
                    }}
                    data-testid={`berita-card-${item.id}`}
                  >
                    {item.gambar_url && (
                      <div className="h-48 overflow-hidden">
                        <img 
                          src={item.gambar_url} 
                          alt={item.judul}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <CardContent className="p-6">
                      <p className="text-xs text-slate-400 mb-2">
                        {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                      <h3 className="font-bold text-slate-800 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                        {item.judul}
                      </h3>
                      <p className="text-sm text-slate-500 line-clamp-3">{item.deskripsi_singkat}</p>
                      <div className="mt-3 flex items-center text-emerald-600 text-sm font-medium">
                        <span>Baca Selengkapnya</span>
                        <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Newspaper className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">
                  {searchQuery ? 'Tidak ada berita yang cocok dengan pencarian' : 'Belum ada berita'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedBerita && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setSelectedBerita(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {selectedBerita.gambar_url && (
                <img 
                  src={selectedBerita.gambar_url} 
                  alt={selectedBerita.judul}
                  className="w-full h-64 object-cover"
                />
              )}
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <p className="text-sm text-slate-400 mb-2">
                      {new Date(selectedBerita.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                    <h2 className="text-2xl font-bold text-slate-800">
                      {selectedBerita.judul}
                    </h2>
                  </div>
                  <button
                    onClick={() => setSelectedBerita(null)}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                    data-testid="close-modal-btn"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="prose prose-slate max-w-none">
                  <p className="text-slate-600 whitespace-pre-wrap">
                    {selectedBerita.isi_berita}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
