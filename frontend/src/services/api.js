import axios from 'axios';

// Create Axios instance with fallback configuration
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
});

// Request interceptor to attach JWT token if present
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('docmind_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
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

// --- Health & Document Management ---
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

// --- Chat & Persona ---
export const sendChatMessage = async (query, persona = 'analyst') => {
  return await API.post('/chat', { query, persona }, { timeout: 90000 });
};

// --- Authentication & User Profile ---
export const loginUser = async (email, password) => {
  return await API.post('/auth/login', { email, password });
};

export const registerUser = async (name, email, password, role = 'Researcher') => {
  return await API.post('/auth/register', { name, email, password, role });
};

export const demoLoginUser = async () => {
  return await API.post('/auth/demo');
};

export const getMe = async () => {
  return await API.get('/auth/me');
};

// --- Document Intelligence & Insights ---
export const getDocumentStats = async () => {
  return await API.get('/insights/stats');
};

export const getDocumentSummary = async () => {
  return await API.get('/insights/summary', { timeout: 120000 });
};

export default API;
