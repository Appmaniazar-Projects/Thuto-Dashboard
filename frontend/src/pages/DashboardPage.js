/**
 * Dashboard Page Component
 * 
 * This is the main dashboard router component that determines which role-specific
 * dashboard to render based on the authenticated user's role. It serves as the
 * central hub for all user types after successful authentication.
 * 
 * Supported User Roles:
 * - admin/administrator: School administrators
 * - teacher: Teaching staff
 * - parent: Parents/guardians of students
 * - student: Students
 * 
 * Features:
 * - Role-based dashboard routing
 * - Authentication state validation
 * - Graceful error handling for unknown roles
 * - Responsive design across all dashboards
 * 
 * @component
 * @author Thuto Dashboard Team
 * @version 2.0.0
 */

import React from 'react';
import { Typography } from '@mui/material';
import { useAuth } from '../context/AuthContext';

// Import role-specific dashboard components
import AdminDashboard from '../components/dashboard/AdminDashboard';
import TeacherDashboard from '../components/dashboard/TeacherDashboard';
import ParentDashboard from '../components/dashboard/ParentDashboard';
import StudentDashboard from '../components/dashboard/StudentDashboard';

/**
 * Main DashboardPage functional component
 * Handles role-based dashboard rendering and user authentication validation
 */
const DashboardPage = () => {
  // Get current authenticated user from context
  const { user } = useAuth();
  
  /**
   * Renders the appropriate dashboard component based on user role
   * @returns {JSX.Element} Role-specific dashboard component or error message
   */
  const renderDashboard = () => {
    // Check if user is authenticated
    if (!user) {
      return (
        <Typography variant="h5" align="center" sx={{ mt: 4 }}>
          Please log in to view your dashboard.
        </Typography>
      );
    }
  
    // Map user roles to their corresponding dashboard components
    const dashboardComponents = {
      admin: <AdminDashboard />,
      administrator: <AdminDashboard />, // Alternative role name for admins
      teacher: <TeacherDashboard />,
      parent: <ParentDashboard />,
      student: <StudentDashboard />,
    };
    
    // Normalize role to lowercase for consistent matching
    const normalizedRole = user?.role?.toLowerCase();
    
    // Get the appropriate dashboard component for the user's role
    const DashboardComponent = dashboardComponents[normalizedRole];
  
    // Return dashboard component or error message for unknown roles
    return DashboardComponent ?? (
      <Typography variant="h5" align="center" sx={{ mt: 4 }}>
        Dashboard not available for your role: {user.role || 'Unknown'}
      </Typography>
    );
  };  

  // Return the rendered dashboard (Layout wrapper is handled in routes.js)
  return renderDashboard();
};

export default DashboardPage;