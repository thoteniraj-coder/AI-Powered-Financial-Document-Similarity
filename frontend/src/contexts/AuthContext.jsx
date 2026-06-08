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
      const storedUser = localStorage.getItem('user');
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;
      setUser(parsedUser);
      setRole(parsedUser?.role || null);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setIsLoading(false);
  }, [token]);

  const login = async (email, password) => {
    try {
      const data = await authApi.login(email, password);
      const nextUser = { name: data.fullName, email, role: data.role };
      setToken(data.token);
      setUser(nextUser);
      setRole(nextUser.role);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(nextUser));
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
    localStorage.removeItem('user');
    delete apiClient.defaults.headers.common['Authorization'];
  };

  const updateProfile = (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    if (updates.role) setRole(updates.role);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, token, role, isAuthenticated: !!token, login, logout, updateProfile, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
