import axios from 'axios';

// Since this is MVP, we assume local API and a hardcoded dev token for now
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || 'dev-token'; // Fallback for MVP testing
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
