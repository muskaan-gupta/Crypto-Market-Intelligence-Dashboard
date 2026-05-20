import axios, { AxiosInstance } from 'axios';

const API_BASE_URL =  'http://localhost:4000/api';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: (email: string, password: string) =>
    api.post('/auth/register', { email, password }),
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
};

export const pricesApi = {
  getLive: () => api.get('/prices/live'),
  getHistory: (coinId: string, days?: number) =>
    api.get(`/prices/history/${coinId}`, { params: { days } }),
};

export const alertsApi = {
  create: (coinId: string, coinName: string, condition: 'above' | 'below', targetPrice: number) =>
    api.post('/alerts', { coinId, coinName, condition, targetPrice }),
  getAll: () => api.get('/alerts'),
  delete: (alertId: string) => api.delete(`/alerts/${alertId}`),
};

export const portfolioApi = {
  addPosition: (coinId: string, coinName: string, quantity: number, purchasePrice: number) =>
    api.post('/portfolio/positions', { coinId, coinName, quantity, purchasePrice }),
  getPortfolio: () => api.get('/portfolio'),
  deletePosition: (positionId: string) =>
    api.delete(`/portfolio/positions/${positionId}`),
};

export const adminApi = {
  health: () => api.get('/admin/health'),
};
