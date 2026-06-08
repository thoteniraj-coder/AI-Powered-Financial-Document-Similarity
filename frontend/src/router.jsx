import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './components/Layout/AppLayout';

import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import Upload from './pages/Upload';
import Search from './pages/Search';
import SearchResults from './pages/SearchResults';
import Documents from './pages/Documents';
import DocumentDetail from './pages/DocumentDetail';
import DocumentComparison from './pages/DocumentComparison';
import Alerts from './pages/Alerts';
import AuditTrail from './pages/AuditTrail';
import Settings from './pages/Settings';
import Profile from './pages/Profile';

export const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  { path: "/", element: <Navigate to="/dashboard" replace /> },
  { 
    element: <ProtectedRoute />, 
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/dashboard", element: <Dashboard /> },
          { path: "/upload", element: <Upload /> },
          { path: "/search", element: <Search /> },
          { path: "/search/results", element: <SearchResults /> },
          { path: "/documents", element: <Documents /> },
          { path: "/documents/compare", element: <DocumentComparison /> },
          { path: "/documents/:id", element: <DocumentDetail /> },
          { path: "/alerts", element: <Alerts /> },
          { path: "/audit", element: <AuditTrail /> },
          { path: "/settings", element: <Settings /> },
          { path: "/profile", element: <Profile /> }
        ]
      }
    ]
  },
  { path: "*", element: <Navigate to="/dashboard" replace /> }
]);
