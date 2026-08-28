import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every outgoing request if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('herflow_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept 401 Unauthorized to automatically clear session
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('herflow_token');
      localStorage.removeItem('herflow_user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateEmailPreference: (enabled) => api.post('/user/email-preference', { enabled }),
};

// Period tracking endpoints
export const periodApi = {
  getAll: () => api.get('/periods'),
  getById: (id) => api.get(`/periods/${id}`),
  create: (data) => api.post('/periods', data),
  update: (id, data) => api.put(`/periods/${id}`, data),
  delete: (id) => api.delete(`/periods/${id}`),
};

// Daily flow logging endpoints
export const flowApi = {
  getAll: () => api.get('/flows'),
  createOrUpdate: (data) => api.post('/flows', data),
  update: (id, data) => api.put(`/flows/${id}`, data),
  delete: (id) => api.delete(`/flows/${id}`),
};

// Insights endpoints
export const insightApi = {
  getInsights: () => api.get('/insights'),
};

// Predictions endpoints
export const predictionApi = {
  getNextPeriod: () => api.get('/predictions/next-period'),
};

// AI assistant chat endpoints
export const aiApi = {
  chat: (data) => api.post('/ai/chat', data),
};

export default api;
