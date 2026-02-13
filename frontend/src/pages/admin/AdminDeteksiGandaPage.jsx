import { useState, useEffect } from 'react';
import { Search, Users, Trash2, Merge, Eye, AlertTriangle, RefreshCw, ChevronDown, ChevronUp, Building2, Phone, User, TreePine, MapPin, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { deteksiGandaApi, opdApi } from '../../lib/api';
import { toast } from 'sonner';

export const AdminDeteksiGandaPage = () => {
  const [duplicates, setDuplicates] = useState([]);
  const [opdList, setOpdList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedField, setSelectedField] = useState('nama_lengkap');
  const [selectedOpd, setSelectedOpd] = useState('all');
  const [expandedGroups, setExpandedGroups] = useState({});
  const [stats, setStats] = useState({ total_groups: 0, total_duplicates: 0 });
  
  // Action states
  const [selectedForDelete, setSelectedForDelete] = useState({});
  const [selectedPrimary, setSelectedPrimary] = useState({});
  const [processing, setProcessing] = useState(false);

  const fieldOptions = [
    { value: 'nama_lengkap', label: 'Nama Lengkap', icon: User },
    { value: 'nip', label: 'NIP', icon: Users },
    { value: 'nomor_whatsapp', label: 'Nomor WhatsApp', icon: Phone },
  ];

  useEffect(() => {
    loadOpdList();
  }, []);

  useEffect(() => {
    loadDuplicates();
  }, [selectedField, selectedOpd]);

  const loadOpdList = async () => {
    try {
      const res = await opdApi.getAll();
      setOpdList(res.data);
    } catch (error) {
      console.error('Failed to load OPD:', error);
    }
  };

  const loadDuplicates = async () => {
    setLoading(true);
    try {
      const res = await deteksiGandaApi.getDuplicates(selectedField, selectedOpd);
      setDuplicates(res.data.duplicates || []);
      setStats({
        total_groups: res.data.total_groups,
        total_duplicates: res.data.total_duplicates
      });
      // Reset selections
      setExpandedGroups({});
      setSelectedForDelete({});
      setSelectedPrimary({});
    } catch (error) {
      console.error('Failed to load duplicates:', error);
      toast.error('Gagal memuat data duplikat');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (index) => {
    setExpandedGroups(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleSelectForDelete = (groupIndex, participantId) => {
    setSelectedForDelete(prev => {
      const groupSelections = prev[groupIndex] || [];
      if (groupSelections.includes(participantId)) {
        return {
          ...prev,
          [groupIndex]: groupSelections.filter(id => id !== participantId)
        };
      } else {
        return {
          ...prev,
          [groupIndex]: [...groupSelections, participantId]
        };
      }
    });
  };

  const handleSelectPrimary = (groupIndex, participantId) => {
    setSelectedPrimary(prev => ({
      ...prev,
      [groupIndex]: prev[groupIndex] === participantId ? null : participantId
    }));
  };

  const handleDeleteSelected = async (groupIndex) => {
    const idsToDelete = selectedForDelete[groupIndex] || [];
    if (idsToDelete.length === 0) {
      toast.warning('Pilih data yang ingin dihapus terlebih dahulu');
      return;
    }

    const group = duplicates[groupIndex];
    if (idsToDelete.length === group.count) {
      toast.warning('Tidak dapat menghapus semua data dalam grup. Sisakan minimal 1 data.');
      return;
    }

    setProcessing(true);
    try {
      const res = await deteksiGandaApi.deleteDuplicates(idsToDelete);
      toast.success(res.data.message);
      loadDuplicates();
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Gagal menghapus data');
    } finally {
      setProcessing(false);
    }
  };

  const handleMergeGroup = async (groupIndex) => {
    const primaryId = selectedPrimary[groupIndex];
    if (!primaryId) {
      toast.warning('Pilih data primer terlebih dahulu (data yang akan dipertahankan)');
      return;
    }

    const group = duplicates[groupIndex];
    const secondaryIds = group.participant_ids.filter(id => id !== primaryId);

    if (secondaryIds.length === 0) {
      toast.warning('Tidak ada data sekunder untuk digabungkan');
      return;
    }

    setProcessing(true);
    try {
      const res = await deteksiGandaApi.mergeDuplicates(primaryId, secondaryIds);
      toast.success(res.data.message);
      loadDuplicates();
    } catch (error) {
      console.error('Merge failed:', error);
      toast.error('Gagal menggabungkan data');
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const getFieldIcon = () => {
    const field = fieldOptions.find(f => f.value === selectedField);
    return field ? field.icon : User;
  };

  const FieldIcon = getFieldIcon();

  return (
    <div className="space-y-6" data-testid="deteksi-ganda-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Deteksi Data Ganda</h1>
          <p className="text-slate-500 mt-1">Temukan dan kelola data partisipan duplikat</p>
        </div>
        <Button 
          onClick={loadDuplicates} 
          variant="outline"
          disabled={loading}
          data-testid="refresh-duplicates-btn"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Deteksi berdasarkan
              </label>
              <Select value={selectedField} onValueChange={setSelectedField}>
                <SelectTrigger data-testid="field-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fieldOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex items-center gap-2">
                        <opt.icon className="h-4 w-4" />
                        {opt.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Filter OPD
              </label>
              <Select value={selectedOpd} onValueChange={setSelectedOpd}>
                <SelectTrigger data-testid="opd-filter-select">
                  <SelectValue placeholder="Semua OPD" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua OPD</SelectItem>
                  {opdList.map(opd => (
                    <SelectItem key={opd.id} value={opd.id}>
                      {opd.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-amber-700">Grup Duplikat</p>
                <p className="text-2xl font-bold text-amber-800" data-testid="total-groups">
                  {stats.total_groups}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 rounded-full">
                <Users className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-red-700">Total Data Duplikat</p>
                <p className="text-2xl font-bold text-red-800" data-testid="total-duplicates">
                  {stats.total_duplicates}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      {loading ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-emerald-600" />
              <p className="mt-4 text-slate-500">Memuat data...</p>
            </div>
          </CardContent>
        </Card>
      ) : duplicates.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-medium text-slate-800">Tidak Ada Duplikat</h3>
              <p className="text-slate-500 mt-1">
                Tidak ditemukan data duplikat berdasarkan {fieldOptions.find(f => f.value === selectedField)?.label}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {duplicates.map((group, groupIndex) => (
            <Card key={groupIndex} className="overflow-hidden" data-testid={`duplicate-group-${groupIndex}`}>
              {/* Group Header */}
              <div 
                className="flex items-center justify-between p-4 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => toggleExpand(groupIndex)}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-full">
                    <FieldIcon className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{group.key_value || '(Kosong)'}</p>
                    <p className="text-sm text-slate-500">
                      {group.count} data ditemukan
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                    {group.count}x duplikat
                  </span>
                  {expandedGroups[groupIndex] ? (
                    <ChevronUp className="h-5 w-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Expanded Detail */}
              {expandedGroups[groupIndex] && (
                <CardContent className="pt-4">
                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteSelected(groupIndex)}
                      disabled={processing || !(selectedForDelete[groupIndex]?.length > 0)}
                      data-testid={`delete-selected-btn-${groupIndex}`}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Hapus Terpilih ({selectedForDelete[groupIndex]?.length || 0})
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                      onClick={() => handleMergeGroup(groupIndex)}
                      disabled={processing || !selectedPrimary[groupIndex]}
                      data-testid={`merge-btn-${groupIndex}`}
                    >
                      <Merge className="h-4 w-4 mr-1" />
                      Gabungkan ke Data Primer
                    </Button>
                  </div>

                  <p className="text-xs text-slate-500 mb-3">
                    <strong>Petunjuk:</strong> Centang data untuk dihapus, atau pilih satu data sebagai "Primer" lalu klik "Gabungkan" untuk menggabungkan semua pohon & lokasi ke data primer.
                  </p>

                  {/* Participants Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-slate-50">
                          <th className="px-3 py-2 text-left">Hapus</th>
                          <th className="px-3 py-2 text-left">Primer</th>
                          <th className="px-3 py-2 text-left">Nama</th>
                          <th className="px-3 py-2 text-left">NIP</th>
                          <th className="px-3 py-2 text-left">WhatsApp</th>
                          <th className="px-3 py-2 text-left">OPD</th>
                          <th className="px-3 py-2 text-left">Pohon</th>
                          <th className="px-3 py-2 text-left">Jenis</th>
                          <th className="px-3 py-2 text-left">Tanggal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.participants.map((participant, pIndex) => {
                          const isSelectedForDelete = selectedForDelete[groupIndex]?.includes(participant.id);
                          const isPrimary = selectedPrimary[groupIndex] === participant.id;

                          return (
                            <tr 
                              key={participant.id} 
                              className={`border-b hover:bg-slate-50 ${
                                isSelectedForDelete ? 'bg-red-50' : ''
                              } ${isPrimary ? 'bg-emerald-50' : ''}`}
                              data-testid={`participant-row-${groupIndex}-${pIndex}`}
                            >
                              <td className="px-3 py-2">
                                <input
                                  type="checkbox"
                                  checked={isSelectedForDelete}
                                  onChange={() => handleSelectForDelete(groupIndex, participant.id)}
                                  className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
                                  disabled={isPrimary}
                                  data-testid={`delete-checkbox-${groupIndex}-${pIndex}`}
                                />
                              </td>
                              <td className="px-3 py-2">
                                <input
                                  type="radio"
                                  name={`primary-${groupIndex}`}
                                  checked={isPrimary}
                                  onChange={() => handleSelectPrimary(groupIndex, participant.id)}
                                  className="h-4 w-4 border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                  disabled={isSelectedForDelete}
                                  data-testid={`primary-radio-${groupIndex}-${pIndex}`}
                                />
                              </td>
                              <td className="px-3 py-2 font-medium">{participant.nama_lengkap}</td>
                              <td className="px-3 py-2 text-slate-600">{participant.nip || '-'}</td>
                              <td className="px-3 py-2 text-slate-600">{participant.nomor_whatsapp || '-'}</td>
                              <td className="px-3 py-2 text-slate-600">{participant.opd_nama}</td>
                              <td className="px-3 py-2">
                                <span className="flex items-center gap-1">
                                  <TreePine className="h-3 w-3 text-emerald-600" />
                                  {participant.jumlah_pohon}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-slate-600">{participant.jenis_pohon}</td>
                              <td className="px-3 py-2 text-slate-500">{formatDate(participant.created_at)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDeteksiGandaPage;
