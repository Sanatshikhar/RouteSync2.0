import React from 'react';
import { useTransportAuth } from '../contexts/TransportAuthContext';
import { Navigate, useLocation } from 'react-router-dom';

const TransportProtectedRoute = ({ children }) => {
  const { transporter } = useTransportAuth();
  const location = useLocation();
  if (!transporter) {
    return <Navigate to="/transport-auth" replace state={{ from: location }} />;
  }
  return children;
};

export default TransportProtectedRoute;
