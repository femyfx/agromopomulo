import { useState, useEffect } from 'react';
import { Image, X } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { galleryApi } from '../../lib/api';
import { motion, AnimatePresence } from 'framer-motion';

export const GaleriPage = () => {
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    loadGallery();
  }, []);

  const loadGallery = async () => {
    try {
      const res = await galleryApi.getAll();
      setGallery(res.data);
    } catch (error) {
      console.error('Failed to load gallery:', error);
    } finally {
      setLoading(false);
    }
  };

  // Default images if gallery is empty
  const defaultImages = [
    {
      id: '1',
      title: 'Kegiatan Penanaman Pohon',
      image_url: 'https://images.unsplash.com/photo-1717566196437-60ba72e8f1d5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwyfHxsdXNoJTIwZ3JlZW4lMjBmb3Jlc3QlMjBsYW5kc2NhcGUlMjBpbmRvbmVzaWF8ZW58MHx8fHwxNzY4NDQ1ODE1fDA&ixlib=rb-4.1.0&q=85',
      description: 'Dokumentasi kegiatan penanaman pohon bersama masyarakat'
    },
    {
      id: '2',
      title: 'Gotong Royong Menanam',
      image_url: 'https://images.unsplash.com/photo-1758599668356-c8c919e24dda?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODh8MHwxfHNlYXJjaHwyfHxwbGFudGluZyUyMHRyZWVzJTIwY29tbXVuaXR5fGVufDB8fHx8MTc2ODQ0NTgxMnww&ixlib=rb-4.1.0&q=85',
      description: 'Kegiatan gotong royong menanam pohon di area publik'
    },
    {
      id: '3',
      title: 'Hutan Hijau Gorontalo',
      image_url: 'https://images.unsplash.com/photo-1728051767709-32ef3258277c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHw0fHxsdXNoJTIwZ3JlZW4lMjBmb3Jlc3QlMjBsYW5kc2NhcGUlMjBpbmRvbmVzaWF8ZW58MHx8fHwxNzY4NDQ1ODE1fDA&ixlib=rb-4.1.0&q=85',
      description: 'Pemandangan hutan hijau di Gorontalo Utara'
    }
  ];

  const displayImages = gallery.length > 0 ? gallery : defaultImages;

  return (
    <div className="min-h-screen" data-testid="galeri-page">
      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-50 to-slate-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <p className="overline mb-4">GALERI</p>
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-800 tracking-tight mb-4">
              Galeri Kegiatan
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Dokumentasi kegiatan program Agro Mopomulo di Kabupaten Gorontalo Utara
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayImages.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className="stat-card overflow-hidden cursor-pointer group"
                  onClick={() => setSelectedImage(item)}
                >
                  <CardContent className="p-0">
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <h3 className="font-semibold text-white">{item.title}</h3>
                        {item.description && (
                          <p className="text-sm text-white/80 mt-1">{item.description}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <button
              className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={selectedImage.image_url}
              alt={selectedImage.title}
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute bottom-8 left-0 right-0 text-center">
              <h3 className="text-xl font-semibold text-white">{selectedImage.title}</h3>
              {selectedImage.description && (
                <p className="text-white/80 mt-2">{selectedImage.description}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
