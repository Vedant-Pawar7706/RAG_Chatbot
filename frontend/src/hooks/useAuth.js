import { useState, useEffect, useCallback } from 'react';
import { loginUser, registerUser, demoLoginUser } from '../services/api';

const DEFAULT_USER = {
  id: 'usr-alex-001',
  name: 'Dr. Alex Morgan',
  email: 'alex@docmind.ai',
  role: 'Lead Document Researcher',
  plan: 'Enterprise Pro',
  avatar: null,
};

export function useAuth() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('docmind_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_USER;
      }
    }
    return DEFAULT_USER;
  });

  const [token, setToken] = useState(() => localStorage.getItem('docmind_token') || 'docmind-jwt-demo-token');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      localStorage.setItem('docmind_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('docmind_user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('docmind_token', token);
    } else {
      localStorage.removeItem('docmind_token');
    }
  }, [token]);

  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await loginUser(email, password);
      setUser(res.user);
      setToken(res.access_token);
      return res.user;
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (name, email, password, role) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await registerUser(name, email, password, role);
      setUser(res.user);
      setToken(res.access_token);
      return res.user;
    } catch (err) {
      setError(err.message || 'Registration failed.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const demoLogin = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await demoLoginUser();
      setUser(res.user);
      setToken(res.access_token);
      return res.user;
    } catch (err) {
      // Fallback to local default user if offline
      setUser(DEFAULT_USER);
      setToken('docmind-jwt-demo-offline');
      return DEFAULT_USER;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('docmind_user');
    localStorage.removeItem('docmind_token');
  }, []);

  return {
    user,
    token,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    register,
    demoLogin,
    logout,
    clearError: () => setError(null),
  };
}
