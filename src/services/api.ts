import axios from 'axios';
import { store } from '../store/store';
import { logout } from '../store/slices/authSlice';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const SHOW_LOGS = true;

// Request interceptor to add token and log requests
api.interceptors.request.use(
  (config) => {
    const token = store.getState()?.auth?.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (SHOW_LOGS) {
      console.group(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
      console.log('Params:', config.params);
      console.log('Data:', config.data);
      console.groupEnd();
    }

    return config;
  },
  (error) => {
    if (SHOW_LOGS) {
      console.error('[API Request Error]', error);
    }
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and logging responses
api.interceptors.response.use(
  (response) => {
    if (SHOW_LOGS) {
      console.group(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`);
      console.log('Status:', response.status);
      console.log('Data:', response.data);
      console.groupEnd();
    }
    return response;
  },
  (error) => {
    if (SHOW_LOGS) {
      console.group(`[API Response Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}`);
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data);
      console.groupEnd();
    }

    if (error.response?.status === 401) {
      // Token expired or invalid - dispatch logout action
      store.dispatch(logout());
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
