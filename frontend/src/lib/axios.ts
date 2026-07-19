import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor – attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('?? Request:', config.method?.toUpperCase(), config.url, 'Auth:', config.headers.Authorization ? '?' : '?');
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor – handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('?? 401 Unauthorized – clearing token');
      localStorage.removeItem('token');
      // Do not redirect automatically – let the app handle it
    }
    return Promise.reject(error);
  }
);

export default api;
