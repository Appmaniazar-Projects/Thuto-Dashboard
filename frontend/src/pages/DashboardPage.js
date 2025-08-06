// src/pages/DashboardPage.js
import React from 'react';
import { Typography } from '@mui/material';
import { useAuth } from '../context/AuthContext';

// Role-specific dashboards
import AdminDashboard from '../components/dashboard/AdminDashboard';
import TeacherDashboard from '../components/dashboard/TeacherDashboard';
import ParentDashboard from '../components/dashboard/ParentDashboard';
import StudentDashboard from '../components/dashboard/StudentDashboard';

const DashboardPage = () => {
  const { user } = useAuth();
  
  console.log("Auth user:", user);

  const renderDashboard = () => {
    if (!user) {
      return (
        <Typography variant="h5" align="center" sx={{ mt: 4 }}>
          Please log in to view your dashboard.
        </Typography>
      );
    }
  
    const dashboardComponents = {
      admin: <AdminDashboard />,
      administrator: <AdminDashboard />,
      teacher: <TeacherDashboard />,
      parent: <ParentDashboard />,
      student: <StudentDashboard />,
    };
    
    const normalizedRole = user?.role?.toLowerCase();
    const DashboardComponent = dashboardComponents[normalizedRole];
  
    return DashboardComponent ?? (
      <Typography variant="h5" align="center" sx={{ mt: 4 }}>
        Dashboard not available for your role: {user.role || 'Unknown'}
      </Typography>
    );
  };  

  // Don't wrap in Layout here - it's already wrapped in routes.js
  return renderDashboard();
};

export default DashboardPage;