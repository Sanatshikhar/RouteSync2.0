import React from 'react';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { Navigate, useLocation } from 'react-router-dom';

const AdminProtectedRoute = ({ children }) => {
  const { admin } = useAdminAuth();
  const location = useLocation();
  if (!admin) {
    return <Navigate to="/admin-auth" replace state={{ from: location }} />;
  }
  return children;
};

export default AdminProtectedRoute;
