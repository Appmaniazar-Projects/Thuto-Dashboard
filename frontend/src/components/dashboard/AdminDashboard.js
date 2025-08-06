import React, { useEffect, useState } from 'react';
import {
  Box, Grid, Paper, Typography, Avatar, List, ListItem, ListItemText, ListItemIcon, Button, Divider
} from '@mui/material';
import {
  Group as GroupIcon,
  School as SchoolIcon,
  Event as EventIcon,
  Assessment as AssessmentIcon,
  PersonAdd as PersonAddIcon,
  Settings as SettingsIcon,
  Campaign as CampaignIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { fetchEnrollmentStats, fetchAttendanceStats } from '../../services/api';
import GenderBreakdown from './admin/GenderBreakdown';
import CalendarPanel from './admin/CalendarPanel';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [totalStudents, setTotalStudents] = useState(null);
  const [averageAttendance, setAverageAttendance] = useState(null);

  useEffect(() => {
    fetchEnrollmentStats()
      .then((res) => setTotalStudents(res.data?.total ?? 0))
      .catch(() => setTotalStudents('Error'));

    fetchAttendanceStats()
      .then((res) => setAverageAttendance(res.data?.average ?? 0))
      .catch(() => setAverageAttendance('Error'));
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">
          Administration Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Welcome, {user?.name || 'Admin'}. Here is the school's overview.
        </Typography>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Total Students" value={totalStudents} icon={<SchoolIcon />} /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Average Attendance" value={averageAttendance !== null ? `${averageAttendance}%` : null} icon={<AssessmentIcon />} /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Total Staff" value="75" icon={<GroupIcon />} /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="System Alerts" value="2" icon={<CampaignIcon />} /></Grid>
      </Grid>

      <Grid container spacing={4}>
        {/* Main Content (Left) */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <GenderBreakdown />
            </Grid>
            <Grid item xs={12}>
              <Paper sx={{ p: 2, height: 300, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="h6" color="text.secondary">Enrollment Trends (Placeholder)</Typography>
              </Paper>
            </Grid>
          </Grid>
        </Grid>

        {/* Sidebar (Right) */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>Quick Actions</Typography>
            <List dense>
              <ListItem disableGutters><Button startIcon={<PersonAddIcon />} fullWidth sx={{justifyContent: 'flex-start'}}>Manage Users</Button></ListItem>
              <ListItem disableGutters><Button startIcon={<SettingsIcon />} fullWidth sx={{justifyContent: 'flex-start'}}>System Settings</Button></ListItem>
              <ListItem disableGutters><Button startIcon={<CampaignIcon />} fullWidth sx={{justifyContent: 'flex-start'}}>Send Announcement</Button></ListItem>
            </List>
          </Paper>
          <CalendarPanel />
        </Grid>
      </Grid>
    </Box>
  );
};

// Helper Component
const StatCard = ({ title, value, icon }) => (
  <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%' }}>
    <Box>
      <Typography variant="h5" fontWeight="bold">{value ?? '...'}</Typography>
      <Typography variant="body2" color="text.secondary">{title}</Typography>
    </Box>
    <Avatar sx={{ bgcolor: 'primary.main', color: 'white' }}>{icon}</Avatar>
  </Paper>
);


export default AdminDashboard;
