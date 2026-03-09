import axios from 'axios';

 const API_BASE_URL="https://glowup-zohc.onrender.com/api";
const api = axios.create({
   baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 10000,
});

// Attach JWT token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bg_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global error handling
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('bg_token');
      window.location.href = '/admin/login';
    }
    return Promise.reject(err);
  }
);

export default api;

// ── API helpers ──
export const candidatureAPI = {
  submit:       (data)        => api.post('/candidatures', data),
  getAll:       (params)      => api.get('/candidatures', { params }),
  updateStatut: (id, statut)  => api.patch(`/candidatures/${id}/statut`, { statut }),
};

export const medecinAPI = {
  getAll:  (params)      => api.get('/medecins', { params }),    // ✅ api (pas axios brut)
  getById: (id)          => api.get(`/medecins/${id}`),
  create:  (data)        => api.post('/medecins', data),         // ✅ token JWT inclus
  update:  (id, data)    => api.put(`/medecins/${id}`, data),    // ✅ token JWT inclus
  delete:  (id)          => api.delete(`/medecins/${id}`),       // ✅ token JWT inclus
};

export const produitAPI = {
  getAll:  (params)      => api.get('/produits', { params }),
  create:  (data)        => api.post('/produits', data),
  update:  (id, data)    => api.put(`/produits/${id}`, data),
  delete:  (id)          => api.delete(`/produits/${id}`),
};

export const episodeAPI = {
  getAll:  (params)      => api.get('/episodes', { params }),
  create:  (data)        => api.post('/episodes', data),
  update:  (id, data)    => api.put(`/episodes/${id}`, data),
};

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  me:    ()     => api.get('/auth/me'),
};
