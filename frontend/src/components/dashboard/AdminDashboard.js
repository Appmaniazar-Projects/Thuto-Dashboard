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
  Campaign as CampaignIcon,
  ErrorOutline as ErrorIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { fetchEnrollmentStats, fetchAttendanceStats, fetchTotalStaff, fetchSystemAlerts } from '../../services/api';
import GenderBreakdown from './admin/GenderBreakdown';
import CalendarPanel from './admin/CalendarPanel';
import StatCard from '../common/StatCard';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [totalStudents, setTotalStudents] = useState(null);
  const [averageAttendance, setAverageAttendance] = useState(null);
  const [totalStaff, setTotalStaff] = useState(null);
  const [systemAlerts, setSystemAlerts] = useState(null);

  useEffect(() => {
    fetchEnrollmentStats()
      .then((res) => setTotalStudents(res.data?.total ?? 0))
      .catch(() => setTotalStudents('Error'));

    fetchAttendanceStats()
      .then((res) => setAverageAttendance(res.data?.average ?? 0))
      .catch(() => setAverageAttendance('Error'));

    fetchTotalStaff()
      .then((res) => setTotalStaff(res.data?.total ?? 0))
      .catch(() => setTotalStaff('Error'));

    fetchSystemAlerts()
      .then((res) => setSystemAlerts(res.data?.total ?? 0))
      .catch(() => setSystemAlerts('Error'));
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
        <Grid item xs={12} sm={6} md={3}><StatCard title="Average Attendance" value={averageAttendance !== null ? (averageAttendance === 'Error' ? 'Error' : `${averageAttendance}%`) : null} icon={<AssessmentIcon />} /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Total Staff" value={totalStaff} icon={<GroupIcon />} /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="System Alerts" value={systemAlerts} icon={<CampaignIcon />} /></Grid>
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
              <ListItem disableGutters><Button startIcon={<PersonAddIcon />} fullWidth sx={{justifyContent: 'flex-start'}} onClick={() => navigate('/admin/users')}>Manage Users</Button></ListItem>
              <ListItem disableGutters><Button startIcon={<SettingsIcon />} fullWidth sx={{justifyContent: 'flex-start'}} onClick={() => navigate('/admin/settings')}>System Settings</Button></ListItem>
              <ListItem disableGutters><Button startIcon={<CampaignIcon />} fullWidth sx={{justifyContent: 'flex-start'}} onClick={() => navigate('/announcements/create')}>Send Announcement</Button></ListItem>
            </List>
          </Paper>
          <CalendarPanel />
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
