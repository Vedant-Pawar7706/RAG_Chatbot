import axios from 'axios';

// Create Axios instance with fallback configuration
const API = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
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
  return await API.get('/');
};

export const getDocuments = async () => {
  return await API.get('/documents');
};

export const uploadDocument = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return await API.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const deleteDocument = async (filename) => {
  return await API.delete(`/documents/${encodeURIComponent(filename)}`);
};

export const clearKnowledgeBase = async () => {
  return await API.post('/clear');
};

export const sendChatMessage = async (query) => {
  return await API.post('/chat', { query });
};

export default API;
