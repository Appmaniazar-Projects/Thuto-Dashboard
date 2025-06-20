// src/pages/DashboardPage.js
// Central dashboard rendering component for Thuto School Management System
// Dynamically renders role-specific dashboards based on user authentication

import React from 'react';
import { Typography } from '@mui/material';
import Layout from '../components/layout/Layout';
import { useAuth } from '../context/AuthContext';

// Import role-specific dashboard components
// Each dashboard is tailored to specific user roles and their unique requirements
import AdminDashboard from '../components/dashboard/AdminDashboard';
import TeacherDashboard from '../components/dashboard/TeacherDashboard';
import ParentDashboard from '../components/dashboard/ParentDashboard';
import StudentDashboard from '../components/dashboard/StudentDashboard';

const DashboardPage = () => {
  // Access current user information from authentication context
  const { currentUser } = useAuth();
  
  // Render the appropriate dashboard based on user role
  // This method ensures that each user sees a personalized dashboard
  const renderDashboard = () => {
    // Handle unauthenticated users
    if (!currentUser) {
      return (
        <Typography variant="h5" align="center" sx={{ mt: 4 }}>
          Please log in to view your dashboard.
        </Typography>
      );
    }

    // Role-based dashboard rendering
    // Supports multiple roles with case-insensitive matching
    switch (currentUser.role?.toLowerCase()) {
      case 'admin':
      case 'administrator':
        // Admin dashboard provides system-wide management and overview
        return <AdminDashboard />;
      case 'teacher':
        // Teacher dashboard focuses on class management and student tracking
        return <TeacherDashboard />;
      case 'parent':
        // Parent dashboard shows child's academic progress and school activities
        return <ParentDashboard />;
      case 'student':
        // Student dashboard displays personal academic information and upcoming tasks
        return <StudentDashboard />;
      default:
        // Handle undefined or unsupported roles
        return (
          <Typography variant="h5" align="center" sx={{ mt: 4 }}>
            Dashboard not available for your role: {currentUser.role || 'Unknown'}
          </Typography>
        );
    }
  };
  
  // Wrap the dashboard in a consistent layout
  // Layout component likely provides common UI elements like navigation, header, etc.
  return (
    <Layout>
      {renderDashboard()}
    </Layout>
  );
};

export default DashboardPage;

// Key Dashboard Rendering Principles:
// 1. Centralized dashboard rendering based on user role
// 2. Fallback mechanisms for unauthenticated or undefined roles
// 3. Modular design with separate dashboard components
// 4. Utilizes authentication context for role determination