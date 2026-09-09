import axios from 'axios';

// Create Axios instance with fallback configuration
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
});

// Response interceptor to handle errors gracefully
API.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected server error occurred';
    return Promise.reject(new Error(message));
  }
);

export const getHealthStatus = async () => {
  return await API.get('/', { timeout: 10000 });
};

export const getDocuments = async () => {
  return await API.get('/documents', { timeout: 15000 });
};

export const uploadDocument = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return await API.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 180000, // 3 minutes for large documents embedding
  });
};

export const deleteDocument = async (filename) => {
  return await API.delete(`/documents/${encodeURIComponent(filename)}`);
};

export const clearKnowledgeBase = async () => {
  return await API.post('/clear');
};

export const sendChatMessage = async (query) => {
  return await API.post('/chat', { query }, { timeout: 90000 });
};

export default API;
