import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// OPD API
export const opdApi = {
  getAll: () => axios.get(`${API}/opd`),
  getById: (id) => axios.get(`${API}/opd/${id}`),
  create: (data) => axios.post(`${API}/opd`, data),
  update: (id, data) => axios.put(`${API}/opd/${id}`, data),
  delete: (id) => axios.delete(`${API}/opd/${id}`),
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

// Stats API
export const statsApi = {
  get: () => axios.get(`${API}/stats`),
};

// Export API
export const exportApi = {
  excel: () => axios.get(`${API}/export/excel`, { responseType: 'blob' }),
  pdf: () => axios.get(`${API}/export/pdf`, { responseType: 'blob' }),
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
