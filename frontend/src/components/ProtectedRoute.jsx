import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function ProtectedRoute({ allowedRoles = [] }) {
  const { isAuthenticated, role, isLoading } = useAuth();

  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--navy-900)', color: '#fff' }}>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>403 - Forbidden. You don't have access to this page.</div>;
  }

  return <Outlet />;
}
