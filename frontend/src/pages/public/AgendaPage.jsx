import { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Filter } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { agendaApi } from '../../lib/api';
import { motion } from 'framer-motion';

export const AgendaPage = () => {
  const [agenda, setAgenda] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadAgenda();
  }, []);

  const loadAgenda = async () => {
    try {
      const res = await agendaApi.getAll();
      setAgenda(res.data);
    } catch (error) {
      console.error('Failed to load agenda:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAgenda = agenda.filter(item => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

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
    <div className="min-h-screen" data-testid="agenda-page">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-600 to-emerald-700 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-emerald-200 text-sm font-medium mb-2">JADWAL KEGIATAN</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Agenda Penanaman
            </h1>
            <p className="text-emerald-100 max-w-2xl mx-auto">
              Jadwal kegiatan penanaman pohon Program Agro Mopomulo di Kabupaten Gorontalo Utara
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filter & Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filter */}
          <div className="flex justify-between items-center mb-8">
            <p className="text-slate-600">
              Menampilkan <span className="font-semibold">{filteredAgenda.length}</span> agenda
            </p>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-500" />
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-40" data-testid="filter-status">
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  <SelectItem value="upcoming">Akan Datang</SelectItem>
                  <SelectItem value="ongoing">Berlangsung</SelectItem>
                  <SelectItem value="completed">Selesai</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Agenda List */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
          ) : filteredAgenda.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAgenda.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="h-16 w-16 rounded-xl bg-emerald-100 flex flex-col items-center justify-center">
                            <span className="text-xs font-medium text-emerald-600 uppercase">
                              {new Date(item.tanggal).toLocaleDateString('id-ID', { month: 'short' })}
                            </span>
                            <span className="text-2xl font-bold text-emerald-700">
                              {new Date(item.tanggal).getDate()}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mb-2 ${getStatusColor(item.status)}`}>
                            {getStatusLabel(item.status)}
                          </span>
                          <h3 className="font-bold text-slate-800 mb-2 line-clamp-2">{item.nama_kegiatan}</h3>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm text-slate-500">
                              <Clock className="h-3.5 w-3.5" />
                              <span>{item.hari}</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-slate-500">
                              <MapPin className="h-3.5 w-3.5" />
                              <span className="truncate">Kec. {item.lokasi_kecamatan}, Desa {item.lokasi_desa}</span>
                            </div>
                          </div>
                          {item.deskripsi && (
                            <p className="mt-3 text-sm text-slate-500 line-clamp-2">{item.deskripsi}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">Belum ada agenda kegiatan</p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
};
