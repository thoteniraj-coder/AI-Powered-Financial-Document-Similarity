import React, { createContext, useState, useEffect } from 'react';
import { authApi } from '../api/auth';
import { apiClient } from '../api/client';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
      // In a real app, you would fetch user profile here
      // For now, let's mock it
      setUser({ name: 'Admin User', email: 'admin@findoc.ai' });
      setRole('admin');
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setIsLoading(false);
  }, [token]);

  const login = async (email, password) => {
    try {
      const data = await authApi.login(email, password);
      setToken(data.token);
      setUser(data.user);
      setRole(data.user.role);
      localStorage.setItem('token', data.token);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      return true;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setRole(null);
    localStorage.removeItem('token');
    delete apiClient.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, role, isAuthenticated: !!token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
