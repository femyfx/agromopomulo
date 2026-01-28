import { useState, useEffect, useCallback, memo } from 'react';
import { X, Newspaper, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { beritaApi, settingsApi } from '../lib/api';

export const NewsPopup = memo(() => {
  const [news, setNews] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [interval, setIntervalTime] = useState(5);
  const [selectedNews, setSelectedNews] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const [beritaRes, settingsRes] = await Promise.all([
        beritaApi.getActive(),
        settingsApi.get()
      ]);
      setNews(beritaRes.data);
      setIntervalTime(settingsRes.data.berita_popup_interval || 5);
      
      // Show first popup after 2 seconds
      if (beritaRes.data.length > 0) {
        setTimeout(() => {
          setIsVisible(true);
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to load news:', error);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (news.length === 0 || isDismissed) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        const nextIndex = (prev + 1) % news.length;
        setIsVisible(true);
        return nextIndex;
      });
    }, interval * 1000);

    return () => clearInterval(timer);
  }, [news, interval, isDismissed]);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
  }, []);

  const handleDismissAll = useCallback(() => {
    setIsDismissed(true);
    setIsVisible(false);
  }, []);

  const handleReadMore = useCallback((newsItem) => {
    setSelectedNews(newsItem);
    setIsVisible(false);
  }, []);

  const closeModal = useCallback(() => {
    setSelectedNews(null);
  }, []);

  const currentNews = news[currentIndex];

  if (news.length === 0) return null;

  return (
    <>
      {/* Popup */}
      <AnimatePresence>
        {isVisible && currentNews && !isDismissed && (
          <motion.div
            initial={{ opacity: 0, x: 100, y: -20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed top-20 right-4 z-50 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden"
            data-testid="news-popup"
          >
            {/* Header */}
            <div className="bg-emerald-600 text-white px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Newspaper className="h-4 w-4" />
                <span className="text-sm font-medium">Berita Terbaru</span>
              </div>
              <button 
                onClick={handleDismiss}
                className="hover:bg-emerald-700 rounded p-1 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              {currentNews.gambar_url && (
                <img 
                  src={currentNews.gambar_url} 
                  alt={currentNews.judul}
                  width={288}
                  height={128}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />
              )}
              <h4 className="font-bold text-slate-800 mb-2 line-clamp-2">
                {currentNews.judul}
              </h4>
              <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                {currentNews.deskripsi_singkat}
              </p>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => handleReadMore(currentNews)}
                  className="text-emerald-600 text-sm font-medium flex items-center gap-1 hover:text-emerald-700"
                >
                  Baca Selengkapnya
                  <ChevronRight className="h-4 w-4" />
                </button>
                <span className="text-xs text-slate-400">
                  {currentIndex + 1}/{news.length}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 pb-3">
              <button
                onClick={handleDismissAll}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                Tutup semua notifikasi
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full News Modal */}
      <AnimatePresence>
        {selectedNews && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {selectedNews.gambar_url && (
                <img 
                  src={selectedNews.gambar_url} 
                  alt={selectedNews.judul}
                  width={672}
                  height={256}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-64 object-cover"
                />
              )}
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-slate-800">
                    {selectedNews.judul}
                  </h2>
                  <button
                    onClick={closeModal}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <p className="text-slate-500 text-sm mb-4">
                  {new Date(selectedNews.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
                <div className="prose prose-slate max-w-none">
                  <p className="text-slate-600 whitespace-pre-wrap">
                    {selectedNews.isi_berita}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});

NewsPopup.displayName = 'NewsPopup';
