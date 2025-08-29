import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const {user} = useAuth();

  if (!user){
    // Not logged in
    return <Navigate to="/login" replace />;
  }

  if (
    requiredRoles.length &&
    !requiredRoles.map(r => r.toLowerCase()).includes(user.role?.toLowerCase())
  ) {
    // User doesn't have required role
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
