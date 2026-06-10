import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const { user } = useAuth();

  if (!user) {
    // Check localStorage directly in case context hasn't hydrated yet
    const storedRole = localStorage.getItem('userRole')?.toLowerCase();
    const isAdmin = storedRole === 'admin';
    const isSuperAdmin = storedRole?.startsWith('superadmin');

    if (isSuperAdmin) return <Navigate to="/superadmin/login" replace />;
    if (isAdmin)      return <Navigate to="/admin/login" replace />;
    return <Navigate to="/login" replace />;
  }

  if (
    requiredRoles.length &&
    !requiredRoles.map(r => r.toLowerCase()).includes(user.role?.toLowerCase())
  ) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};
export default ProtectedRoute;
