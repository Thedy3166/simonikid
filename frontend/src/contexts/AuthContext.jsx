// ============================================================
// SIMONIK - Auth Context
// File: src/contexts/AuthContext.jsx
// Deskripsi: State global untuk authentication
// ============================================================

import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

// Buat Context
const AuthContext = createContext(null);

// Provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Saat aplikasi pertama dibuka, cek token di localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }

    setLoading(false);
  }, []);

  // Fungsi login
  async function login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    const { user: userData, token: tokenData } = response.data.data;

    setUser(userData);
    setToken(tokenData);

    localStorage.setItem('token', tokenData);
    localStorage.setItem('user', JSON.stringify(userData));

    return userData;
  }

  // Fungsi logout
  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook untuk akses Auth Context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth harus dipakai di dalam AuthProvider');
  }
  return context;
}