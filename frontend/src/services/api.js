// services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL:
    import.meta.env.MODE === 'development'
      ? 'http://localhost:5050/api'
      : 'https://glowup-zohc.onrender.com/api',
  withCredentials: true,
  timeout: 30000,
});

// ── Attacher le JWT automatiquement ─────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bg_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Gestion globale des erreurs ──────────────────────────────────────────────
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

// ── API helpers ──────────────────────────────────────────────────────────────

export const candidatureAPI = {
  /**
   * Soumettre une candidature avec photo (optionnelle).
   *
   * @param {Object} data  - Champs texte du formulaire
   * @param {File|null} photoFile - Fichier image (ou null)
   * @param {Function} onProgress - Callback progression upload (0-100)
   *
   * On construit un FormData pour envoyer en multipart/form-data,
   * ce qui est obligatoire pour transmettre des fichiers binaires.
   */
  submit: (data, photoFile = null, onProgress = null) => {
    const formData = new FormData();

    // Ajouter tous les champs texte
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });

    // Ajouter le fichier image s'il existe
    if (photoFile) {
      formData.append('photo', photoFile);
    }

    return api.post('/candidatures', formData, {
      headers: {
        // NE PAS définir Content-Type manuellement :
        // axios + FormData le gère automatiquement avec le bon boundary
      },
      onUploadProgress: onProgress
        ? (progressEvent) => {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percent);
          }
        : undefined,
    });
  },

  getAll:       (params)     => api.get('/candidatures', { params }),
  updateStatut: (id, statut) => api.patch(`/candidatures/${id}/statut`, { statut }),
  delete:       (id)         => api.delete(`/candidatures/${id}`),
};

export const medecinAPI = {
  getAll:  (params)   => api.get('/medecins', { params }),
  getById: (id)       => api.get(`/medecins/${id}`),
  create:  (data)     => api.post('/medecins', data),
  update:  (id, data) => api.put(`/medecins/${id}`, data),
  delete:  (id)       => api.delete(`/medecins/${id}`),
};

export const produitAPI = {
  getAll:  (params)   => api.get('/produits', { params }),
  create:  (data)     => api.post('/produits', data),
  update:  (id, data) => api.put(`/produits/${id}`, data),
  delete:  (id)       => api.delete(`/produits/${id}`),
};

export const episodeAPI = {
  getAll:  (params)   => api.get('/episodes', { params }),
  create:  (data)     => api.post('/episodes', data),
  update:  (id, data) => api.put(`/episodes/${id}`, data),
};

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  me:    ()     => api.get('/auth/me'),
};