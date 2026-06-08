import axios from 'axios';
import { useAuthStore } from '../../features/auth/store/authSlice';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8005/api',
  headers: { 'Content-Type': 'application/json' },
});

axiosClient.interceptors.request.use((config) => {
  // Get the token from the auth store
  const state = useAuthStore.getState();
  const token = state.session?.access_token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosClient;
