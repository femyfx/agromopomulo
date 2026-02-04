import { useState, useEffect, useMemo, useCallback } from 'react';
import { MapPin, TreePine, Users, Filter, X, Leaf } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { statsApi, partisipasiApi } from '../../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon issue in Leaflet with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom tree marker icon with environmental theme
const createCustomIcon = (color = '#059669') => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 36px;
        height: 36px;
        background: linear-gradient(135deg, ${color} 0%, ${color}dd 100%);
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg style="transform: rotate(45deg); width: 18px; height: 18px;" viewBox="0 0 24 24" fill="white">
          <path d="M12 2L8 8H4L8 14H2L12 22L22 14H16L20 8H16L12 2Z"/>
        </svg>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
};

// Cluster icon
const createClusterCustomIcon = (cluster) => {
  const count = cluster.getChildCount();
  let size = 40;
  let color = '#059669';
  
  if (count > 50) {
    size = 56;
    color = '#047857';
  } else if (count > 20) {
    size = 48;
    color = '#059669';
  }
  
  return L.divIcon({
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: linear-gradient(135deg, ${color} 0%, ${color}dd 100%);
        border-radius: 50%;
        border: 4px solid white;
        box-shadow: 0 4px 16px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: ${count > 50 ? '16px' : '14px'};
        font-family: 'Plus Jakarta Sans', sans-serif;
      ">
        ${count}
      </div>
    `,
    className: 'custom-cluster-icon',
    iconSize: L.point(size, size),
  });
};

// Map bounds setter component
const SetBoundsComponent = ({ markers }) => {
  const map = useMap();
  
  useEffect(() => {
    if (markers && markers.length > 0) {
      const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    }
  }, [markers, map]);
  
  return null;
};

export const PetaPenanamanPage = () => {
  const [stats, setStats] = useState(null);
  const [partisipasi, setPartisipasi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterKecamatan, setFilterKecamatan] = useState('all');
  const [filterJenisPohon, setFilterJenisPohon] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Gorontalo Utara center coordinates
  const gorontaloUtaraCenter = [0.9, 122.5];
  const defaultZoom = 10;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, partisipasiRes] = await Promise.all([
        statsApi.get(),
        partisipasiApi.getAll()
      ]);
      setStats(statsRes.data);
      setPartisipasi(partisipasiRes.data || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Parse coordinates from titik_lokasi string
  const parseCoordinates = useCallback((titikLokasi) => {
    if (!titikLokasi) return null;
    const parts = titikLokasi.split(',').map(s => s.trim());
    if (parts.length !== 2) return null;
    const lat = parseFloat(parts[0]);
    const lng = parseFloat(parts[1]);
    if (isNaN(lat) || isNaN(lng)) return null;
    // Validate coordinates are within reasonable range for Gorontalo
    if (lat < -2 || lat > 3 || lng < 120 || lng > 126) return null;
    return { lat, lng };
  }, []);

  // Get unique kecamatan from OPD names
  const kecamatanList = useMemo(() => {
    const kecamatans = new Set();
    partisipasi.forEach(p => {
      if (p.opd_nama && p.opd_nama.includes('CAMAT')) {
        const match = p.opd_nama.match(/CAMAT\s+(\w+)/i);
        if (match) kecamatans.add(match[1]);
      }
      if (p.lokasi_tanam) {
        kecamatans.add(p.lokasi_tanam);
      }
    });
    return Array.from(kecamatans).sort();
  }, [partisipasi]);

  // Get unique jenis pohon
  const jenisPohonList = useMemo(() => {
    const jenis = new Set();
    partisipasi.forEach(p => {
      if (p.jenis_pohon) jenis.add(p.jenis_pohon);
    });
    return Array.from(jenis).sort();
  }, [partisipasi]);

  // Filter and prepare markers
  const markers = useMemo(() => {
    return partisipasi
      .filter(p => {
        // Filter by kecamatan
        if (filterKecamatan !== 'all') {
          const matchKecamatan = p.opd_nama?.toLowerCase().includes(filterKecamatan.toLowerCase()) ||
                                  p.lokasi_tanam?.toLowerCase().includes(filterKecamatan.toLowerCase());
          if (!matchKecamatan) return false;
        }
        // Filter by jenis pohon
        if (filterJenisPohon !== 'all' && p.jenis_pohon !== filterJenisPohon) {
          return false;
        }
        return true;
      })
      .map(p => {
        const coords = parseCoordinates(p.titik_lokasi);
        if (!coords) return null;
        return {
          ...p,
          lat: coords.lat,
          lng: coords.lng,
        };
      })
      .filter(Boolean);
  }, [partisipasi, filterKecamatan, filterJenisPohon, parseCoordinates]);

  const formatNumber = (num) => {
    return new Intl.NumberFormat('id-ID').format(num || 0);
  };

  const clearFilters = () => {
    setFilterKecamatan('all');
    setFilterJenisPohon('all');
  };

  const hasActiveFilters = filterKecamatan !== 'all' || filterJenisPohon !== 'all';

  // Get color based on jenis pohon
  const getMarkerColor = (jenisPohon) => {
    const colors = {
      'Durian': '#7c3aed',
      'Mangga': '#f59e0b',
      'Rambutan': '#ef4444',
      'Kelapa': '#10b981',
      'Cengkeh': '#8b5cf6',
      'Pala': '#ec4899',
      'Coklat': '#92400e',
      'Aren': '#64748b',
    };
    return colors[jenisPohon] || '#059669';
  };

  return (
    <div className="min-h-screen" data-testid="peta-penanaman-page">
      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-50 to-slate-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <p className="overline mb-4">LOKASI</p>
            <h1 className="heading-display mb-4">
              Peta Penanaman
            </h1>
            <p className="body-large max-w-2xl mx-auto">
              Sebaran lokasi penanaman pohon di Kabupaten Gorontalo Utara
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
          <>
            {/* Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="stat-card">
                  <CardContent className="p-4 text-center">
                    <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-2">
                      <MapPin className="h-6 w-6 text-emerald-600" />
                    </div>
                    <p className="text-2xl font-bold text-slate-800">{markers.length}</p>
                    <p className="text-xs text-slate-500">Titik Lokasi</p>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="stat-card">
                  <CardContent className="p-4 text-center">
                    <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-2">
                      <Users className="h-6 w-6 text-amber-600" />
                    </div>
                    <p className="text-2xl font-bold text-slate-800">{formatNumber(stats?.total_partisipan)}</p>
                    <p className="text-xs text-slate-500">Partisipan</p>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="stat-card">
                  <CardContent className="p-4 text-center">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2">
                      <TreePine className="h-6 w-6 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-slate-800">{formatNumber(stats?.total_pohon)}</p>
                    <p className="text-xs text-slate-500">Total Pohon</p>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="stat-card">
                  <CardContent className="p-4 text-center">
                    <div className="h-12 w-12 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-2">
                      <Leaf className="h-6 w-6 text-rose-600" />
                    </div>
                    <p className="text-2xl font-bold text-slate-800">{stats?.jenis_pohon_stats?.length || 0}</p>
                    <p className="text-xs text-slate-500">Jenis Pohon</p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Filter Section */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2"
                    data-testid="toggle-filters-btn"
                  >
                    <Filter className="h-4 w-4" />
                    {showFilters ? 'Sembunyikan Filter' : 'Tampilkan Filter'}
                    {hasActiveFilters && (
                      <span className="ml-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                        Aktif
                      </span>
                    )}
                  </Button>
                  
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-slate-500 hover:text-slate-700"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Reset Filter
                    </Button>
                  )}
                </div>

                <AnimatePresence>
                  {showFilters && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100">
                        <div>
                          <label className="label-text block mb-2">Kecamatan/Lokasi</label>
                          <Select value={filterKecamatan} onValueChange={setFilterKecamatan}>
                            <SelectTrigger className="form-input" data-testid="filter-kecamatan">
                              <SelectValue placeholder="Semua Kecamatan" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Semua Kecamatan</SelectItem>
                              {kecamatanList.map(kec => (
                                <SelectItem key={kec} value={kec}>{kec}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="label-text block mb-2">Jenis Pohon</label>
                          <Select value={filterJenisPohon} onValueChange={setFilterJenisPohon}>
                            <SelectTrigger className="form-input" data-testid="filter-jenis-pohon">
                              <SelectValue placeholder="Semua Jenis" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Semua Jenis</SelectItem>
                              {jenisPohonList.map(jenis => (
                                <SelectItem key={jenis} value={jenis}>{jenis}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>

            {/* Interactive Map */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="mb-12 overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-emerald-600" />
                    Peta Interaktif Lokasi Penanaman
                    <span className="ml-2 text-sm font-normal text-slate-500">
                      ({markers.length} lokasi ditampilkan)
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-[500px] relative">
                    <MapContainer
                      center={gorontaloUtaraCenter}
                      zoom={defaultZoom}
                      style={{ height: '100%', width: '100%' }}
                      scrollWheelZoom={true}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      
                      {markers.length > 0 && (
                        <>
                          <SetBoundsComponent markers={markers} />
                          <MarkerClusterGroup
                            chunkedLoading
                            iconCreateFunction={createClusterCustomIcon}
                            maxClusterRadius={60}
                            spiderfyOnMaxZoom={true}
                            showCoverageOnHover={false}
                            animate={true}
                          >
                            {markers.map((marker, index) => (
                              <Marker
                                key={marker.id || index}
                                position={[marker.lat, marker.lng]}
                                icon={createCustomIcon(getMarkerColor(marker.jenis_pohon))}
                              >
                                <Popup>
                                  <div className="p-2 min-w-[200px]">
                                    <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                                      <TreePine className="h-4 w-4 text-emerald-600" />
                                      {marker.nama_lengkap}
                                    </h4>
                                    <div className="space-y-1.5 text-sm">
                                      <p className="flex items-center gap-2">
                                        <span className="text-slate-500">Instansi:</span>
                                        <span className="font-medium text-slate-700">{marker.opd_nama || '-'}</span>
                                      </p>
                                      <p className="flex items-center gap-2">
                                        <span className="text-slate-500">Lokasi:</span>
                                        <span className="font-medium text-slate-700">{marker.lokasi_tanam || '-'}</span>
                                      </p>
                                      <p className="flex items-center gap-2">
                                        <span className="text-slate-500">Jenis Pohon:</span>
                                        <span className="font-medium text-emerald-600">{marker.jenis_pohon}</span>
                                      </p>
                                      <p className="flex items-center gap-2">
                                        <span className="text-slate-500">Jumlah:</span>
                                        <span className="font-bold text-emerald-700">{formatNumber(marker.jumlah_pohon)} pohon</span>
                                      </p>
                                    </div>
                                  </div>
                                </Popup>
                              </Marker>
                            ))}
                          </MarkerClusterGroup>
                        </>
                      )}
                    </MapContainer>
                    
                    {markers.length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-[1000]">
                        <div className="text-center p-8">
                          <MapPin className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                          <p className="text-slate-600 font-medium">Tidak ada lokasi yang sesuai dengan filter</p>
                          <p className="text-slate-500 text-sm mt-1">Coba ubah kriteria filter Anda</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Location Stats */}
            <div className="mb-8">
              <h2 className="heading-section mb-6">Lokasi Penanaman</h2>
              {stats?.lokasi_stats?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {stats.lokasi_stats.map((lokasi, index) => (
                    <motion.div
                      key={lokasi.lokasi}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="stat-card">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                              <MapPin className="h-6 w-6 text-emerald-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="heading-card truncate" title={lokasi.lokasi}>
                                {lokasi.lokasi}
                              </h4>
                              <div className="flex items-center gap-4 mt-2">
                                <div className="flex items-center gap-1 text-sm text-slate-500">
                                  <TreePine className="h-4 w-4" />
                                  <span>{formatNumber(lokasi.jumlah_pohon)} pohon</span>
                                </div>
                                <div className="flex items-center gap-1 text-sm text-slate-500">
                                  <Users className="h-4 w-4" />
                                  <span>{lokasi.jumlah_partisipan} orang</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <Card className="stat-card">
                  <CardContent className="p-12 text-center">
                    <MapPin className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                    <p className="body-large">Belum ada data lokasi penanaman</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Tree Types */}
            {stats?.jenis_pohon_stats?.length > 0 && (
              <div>
                <h2 className="heading-section mb-6">Jenis Pohon yang Ditanam</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {stats.jenis_pohon_stats.map((jenis, index) => (
                    <motion.div
                      key={jenis.jenis}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card 
                        className="stat-card text-center cursor-pointer hover:ring-2 hover:ring-emerald-500 transition-all"
                        onClick={() => {
                          setFilterJenisPohon(jenis.jenis);
                          setShowFilters(true);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                      >
                        <CardContent className="p-4">
                          <div 
                            className="h-10 w-10 rounded-full flex items-center justify-center mx-auto mb-2"
                            style={{ backgroundColor: `${getMarkerColor(jenis.jenis)}20` }}
                          >
                            <TreePine 
                              className="h-5 w-5" 
                              style={{ color: getMarkerColor(jenis.jenis) }}
                            />
                          </div>
                          <p className="font-semibold text-slate-800 text-sm truncate" title={jenis.jenis}>
                            {jenis.jenis}
                          </p>
                          <p className="text-xs text-slate-500">{formatNumber(jenis.jumlah)} pohon</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Custom CSS for Leaflet markers */}
      <style>{`
        .custom-marker {
          background: transparent !important;
          border: none !important;
        }
        .custom-cluster-icon {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }
        .leaflet-popup-content {
          margin: 8px 12px;
        }
        .leaflet-popup-tip {
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }
        .marker-cluster-animated {
          transition: all 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};
