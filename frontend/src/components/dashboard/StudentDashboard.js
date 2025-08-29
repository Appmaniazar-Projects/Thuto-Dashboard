import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Paper, Typography, Button, Divider, Chip,
  useTheme, Card, CardContent, CircularProgress, Alert, Avatar
} from '@mui/material';
import {
  School as SchoolIcon,
  Assessment as AssessmentIcon,
  Assignment as AssignmentIcon,
  Book as BookIcon,
  Folder as FolderIcon,
  CheckCircle as CheckCircleIcon,
  ArrowForward as ArrowForwardIcon,
  EventNote as EventNoteIcon,
  Message as MessageIcon,
  InsertDriveFile as FileIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import studentService from '../../services/studentService';
import StatCard from '../common/StatCard';

const StudentDashboard = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const today = format(new Date(), 'EEEE, MMMM d, yyyy');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    attendance: 0,
    resources: 0,
    upcomingEvents: 0,
    unreadMessages: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch attendance stats
        const attendanceStats = await studentService.getAttendanceStats();
        
        // Fetch resources count
        const resources = await studentService.getAvailableResources();
        
        // Update stats
        setStats({
          attendance: attendanceStats.percentage || 0,
          resources: resources.length || 0,
          upcomingEvents: 0, // Coming soon
          unreadMessages: 0  // Coming soon
        });
        
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const quickLinks = [
    { text: 'My Courses', path: '/student/subjects', icon: <BookIcon /> },
    { text: 'My Grades', path: '/student/reports', icon: <AssessmentIcon /> },
    { text: 'Assignments', path: '/student/assignments', icon: <AssignmentIcon />, comingSoon: true },
    { text: 'Resources', path: '/student/resources', icon: <FolderIcon /> },
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Welcome back, {user?.name || 'Student'}!
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {today}
        </Typography>
      </Box>

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Attendance" 
            value={`${stats.attendance}%`} 
            icon={<CheckCircleIcon />} 
            subtitle="This Month" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Resources" 
            value={stats.resources} 
            icon={<FileIcon />} 
            subtitle="Available" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Upcoming Events" 
            value="0" 
            icon={<EventNoteIcon />} 
            subtitle="Coming Soon" 
            disabled
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Messages" 
            value="0" 
            icon={<MessageIcon />} 
            subtitle="Coming Soon" 
            disabled
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          {/* Announcements */}
          <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="bold">Announcements</Typography>
              <Button 
                component={Link} 
                to="/student/announcements" 
                endIcon={<ArrowForwardIcon />}
                disabled
                size="small"
              >
                View All
              </Button>
            </Box>
            <Box textAlign="center" py={4}>
              <Typography variant="body1" color="text.secondary">
                Announcements feature is coming soon
              </Typography>
            </Box>
          </Paper>

          {/* Upcoming Events */}
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="bold">Upcoming Events</Typography>
              <Button 
                component={Link} 
                to="/student/events" 
                endIcon={<ArrowForwardIcon />}
                disabled
                size="small"
              >
                View All
              </Button>
            </Box>
            <Box textAlign="center" py={4}>
              <Typography variant="body1" color="text.secondary">
                Events feature is coming soon
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Quick Links */}
          <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>Quick Links</Typography>
            <Box>
              {quickLinks.map((link) => (
                <Button
                  key={link.text}
                  component={Link}
                  to={link.path}
                  disabled={link.comingSoon}
                  fullWidth
                  startIcon={link.icon}
                  sx={{
                    justifyContent: 'flex-start',
                    mb: 1,
                    textTransform: 'none',
                    color: link.comingSoon ? 'text.secondary' : 'text.primary',
                    '&:hover': {
                      backgroundColor: link.comingSoon ? 'transparent' : 'action.hover',
                    }
                  }}
                >
                  <Box sx={{ flexGrow: 1, textAlign: 'left' }}>
                    <Typography variant="body1">
                      {link.text}
                      {link.comingSoon && (
                        <Chip 
                          label="Coming Soon" 
                          size="small" 
                          sx={{ 
                            ml: 1, 
                            height: 18,
                            '& .MuiChip-label': { px: 1 },
                            fontSize: '0.7rem'
                          }} 
                        />
                      )}
                    </Typography>
                  </Box>
                </Button>
              ))}
            </Box>
          </Paper>

          {/* Resources */}
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="bold">Recent Resources</Typography>
              <Button 
                component={Link} 
                to="/student/resources" 
                endIcon={<ArrowForwardIcon />}
                size="small"
              >
                View All
              </Button>
            </Box>
            <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
              {stats.resources > 0 
                ? `${stats.resources} resources available` 
                : 'No resources available at the moment'}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentDashboard;