import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// OPD API
export const opdApi = {
  getAll: () => axios.get(`${API}/opd`),
  getById: (id) => axios.get(`${API}/opd/${id}`),
  create: (data) => axios.post(`${API}/opd`, data),
  update: (id, data) => axios.put(`${API}/opd/${id}`, data),
  delete: (id) => axios.delete(`${API}/opd/${id}`),
  importExcel: (file, kategori) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('kategori', kategori);
    return axios.post(`${API}/opd/import`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Partisipasi API
export const partisipasiApi = {
  getAll: () => axios.get(`${API}/partisipasi`),
  getById: (id) => axios.get(`${API}/partisipasi/${id}`),
  create: (data) => axios.post(`${API}/partisipasi`, data),
  update: (id, data) => axios.put(`${API}/partisipasi/${id}`, data),
  delete: (id) => axios.delete(`${API}/partisipasi/${id}`),
};

// Settings API
export const settingsApi = {
  get: () => axios.get(`${API}/settings`),
  update: (data) => axios.put(`${API}/settings`, data),
  uploadLogo: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axios.post(`${API}/settings/upload-logo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Gallery API
export const galleryApi = {
  getAll: () => axios.get(`${API}/gallery`),
  create: (data) => axios.post(`${API}/gallery`, data),
  delete: (id) => axios.delete(`${API}/gallery/${id}`),
};

// Edukasi API
export const edukasiApi = {
  getAll: () => axios.get(`${API}/edukasi`),
  create: (data) => axios.post(`${API}/edukasi`, data),
  update: (id, data) => axios.put(`${API}/edukasi/${id}`, data),
  delete: (id) => axios.delete(`${API}/edukasi/${id}`),
};

// Agenda API
export const agendaApi = {
  getAll: () => axios.get(`${API}/agenda`),
  getUpcoming: () => axios.get(`${API}/agenda/upcoming`),
  create: (data) => axios.post(`${API}/agenda`, data),
  update: (id, data) => axios.put(`${API}/agenda/${id}`, data),
  delete: (id) => axios.delete(`${API}/agenda/${id}`),
};

// Berita API
export const beritaApi = {
  getAll: () => axios.get(`${API}/berita`),
  getActive: () => axios.get(`${API}/berita/active`),
  getById: (id) => axios.get(`${API}/berita/${id}`),
  create: (data) => axios.post(`${API}/berita`, data),
  update: (id, data) => axios.put(`${API}/berita/${id}`, data),
  delete: (id) => axios.delete(`${API}/berita/${id}`),
};

// Stats API
export const statsApi = {
  get: () => axios.get(`${API}/stats`),
  getProgress: () => axios.get(`${API}/progress`),
};

// Export API
export const exportApi = {
  excel: () => {
    const token = localStorage.getItem('token');
    return axios.get(`${API}/export/excel`, { 
      responseType: 'blob',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
  },
  pdf: () => {
    const token = localStorage.getItem('token');
    return axios.get(`${API}/export/pdf`, { 
      responseType: 'blob',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
  },
};

// Import API
export const importApi = {
  excel: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axios.post(`${API}/import/excel`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
