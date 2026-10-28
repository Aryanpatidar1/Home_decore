import axios from 'axios';

const configuredBaseUrl = (import.meta.env.VITE_API_URL || '').trim();
const API_BASE_URL = configuredBaseUrl || (
  typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:5000/api'
    : '/api'
);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('aura_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (localStorage.getItem('aura_token')) {
        localStorage.removeItem('aura_token');
        localStorage.removeItem('aura_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
