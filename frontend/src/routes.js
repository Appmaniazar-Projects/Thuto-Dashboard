// src/routes.js
// This file defines the routing configuration for the Thuto School Management System
// It uses React Router for handling navigation between different components

import React from 'react';
import { Navigate } from 'react-router-dom';

// Import authentication and dashboard components
import Login from './components/auth/Login';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import StudentReports from './components/reports/StudentReports';
import ParentReports from './components/reports/ParentReports';

const routes = [
  {
    // Login page - entry point for all users
    path: '/login',
    element: <Login />,
  },
  {
    // Main dashboard - dynamically renders based on user role
    // Wrapped in ProtectedRoute to ensure only authenticated users can access
    path: '/dashboard',
    element: <ProtectedRoute><DashboardPage /></ProtectedRoute>,
  },
  {
    // Student-specific reports page
    // Requires authentication and student role
    path: '/student-reports',
    element: <ProtectedRoute><StudentReports /></ProtectedRoute>,
  },
  {
    // Parent-specific reports page
    // Requires authentication and parent role
    path: '/parent-reports',
    element: <ProtectedRoute><ParentReports /></ProtectedRoute>,
  },
  {
    // Default route - redirects to dashboard if no specific path is provided
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    // Catch-all route - redirects to login for any undefined routes
    path: '*',
    element: <Navigate to="/login" replace />,
  }
];

export default routes;

// Key Navigation Principles:
// 1. All routes are protected to ensure user authentication
// 2. Dashboard dynamically renders based on user role
// 3. Specific report pages are role-specific
// 4. Undefined routes redirect to login for security