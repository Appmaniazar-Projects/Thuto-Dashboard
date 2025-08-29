import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Paper, Typography, Card, CardContent, Button, Avatar,
  List, ListItem, ListItemText, ListItemIcon, Divider, Chip, Badge, Link, CircularProgress, Alert
} from '@mui/material';
import {
  Group as GroupIcon,
  Assignment as AssignmentIcon,
  Book as BookIcon,
  Notifications as NotificationsIcon,
  CheckCircleOutline as AttendanceIcon,
  PeopleOutline as PeopleIcon,
  Campaign as AnnounceIcon,
  Event as EventIcon,
  Message as MessageIcon,
  Info as InfoIcon,
  Folder as FolderIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { Link as RouterLink } from 'react-router-dom';
import { getTeacherClasses, getRecentResources } from '../../services/teacherService';
import StatCard from '../common/StatCard';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [classesError, setClassesError] = useState(null);
  const [resources, setResources] = useState([]);
  const [loadingResources, setLoadingResources] = useState(true);
  const [resourcesError, setResourcesError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoadingClasses(true);
        const classData = await getTeacherClasses();
        setClasses(classData || []);
      } catch (err) {
        setClassesError('Failed to fetch classes.');
        console.error(err);
      } finally {
        setLoadingClasses(false);
      }

      try {
        setLoadingResources(true);
        const resourceData = await getRecentResources(5);
        setResources(resourceData || []);
      } catch (err) {
        setResourcesError('Failed to fetch resources.');
        console.error(err);
      } finally {
        setLoadingResources(false);
      }
    };

    fetchDashboardData();
  }, []);

  const totalStudents = classes.reduce((sum, cls) => sum + (cls.students || 0), 0);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Welcome, {user?.name || 'Teacher'}!
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </Typography>
      </Box>

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { title: 'Classes', value: loadingClasses ? '...' : classes.length, icon: <GroupIcon /> },
          { title: 'Students', value: loadingClasses ? '...' : totalStudents, icon: <PeopleIcon /> },
          { title: 'Resources', value: loadingResources ? '...' : resources.length, icon: <FolderIcon /> },
          { title: 'Unread Messages', value: '0', icon: <MessageIcon />, disabled: true },
        ].map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StatCard 
              title={stat.title} 
              value={stat.value} 
              icon={stat.icon}
              disabled={stat.disabled}
            />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} md={8}>
          {/* Announcements */}
          <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="bold">Announcements</Typography>
              <Chip 
                label="Coming Soon" 
                color="primary" 
                size="small"
                icon={<InfoIcon fontSize="small" />}
              />
            </Box>
            <Box textAlign="center" py={4}>
              <Typography variant="body1" color="text.secondary">
                The announcements feature is coming soon. You'll be able to post and manage class announcements here.
              </Typography>
            </Box>
          </Paper>

          {/* Recent Resources */}
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>Recent Resources</Typography>
            {loadingResources ? (
              <Box textAlign="center"><CircularProgress /></Box>
            ) : resourcesError ? (
              <Alert severity="error">{resourcesError}</Alert>
            ) : resources.length === 0 ? (
              <Typography color="text.secondary" textAlign="center">No recent resources found.</Typography>
            ) : (
              <List disablePadding>
                {resources.map((resource, index) => (
                  <ListItem key={resource.id} disablePadding sx={{ mb: 1 }}>
                    <ListItemIcon><FolderIcon color="primary" /></ListItemIcon>
                    <ListItemText 
                      primary={resource.fileName}
                      secondary={`Uploaded on: ${new Date(resource.uploadDate).toLocaleDateString()}`}
                    />
                    <Button size="small" variant="outlined" href={resource.fileUrl} target="_blank">View</Button>
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} md={4}>
          {/* Quick Actions */}
          <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>Quick Actions</Typography>
            <Button
              fullWidth
              variant="contained"
              startIcon={<AssignmentIcon />}
              component={RouterLink}
              to="/teacher/resources"
              sx={{ mb: 2 }}
            >
              Manage Resources
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<AnnounceIcon />}
              disabled
            >
              Post Announcement
              <Chip 
                label="Coming Soon" 
                size="small" 
                sx={{ ml: 1, height: 20, '& .MuiChip-label': { px: 1 } }} 
              />
            </Button>
          </Paper>

          {/* Today's Classes */}
          <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>Today's Classes</Typography>
            {loadingClasses ? (
              <Box textAlign="center"><CircularProgress /></Box>
            ) : classesError ? (
              <Alert severity="error">{classesError}</Alert>
            ) : classes.length === 0 ? (
              <Typography color="text.secondary" textAlign="center">No classes scheduled for today.</Typography>
            ) : (
              <List disablePadding>
                {classes.slice(0, 3).map((cls) => (
                  <ListItem 
                    key={cls.id}
                    button 
                    component={RouterLink}
                    to={`/teacher/attendance/${cls.id}`}
                    sx={{ borderRadius: 1, mb: 1, '&:hover': { bgcolor: 'action.hover' } }}
                  >
                    <ListItemText
                      primary={cls.name}
                      secondary={cls.period}
                      primaryTypographyProps={{ fontWeight: 'medium', noWrap: true }}
                    />
                    <Chip label="Attend" size="small" color="primary" />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
          
          {/* Recent Messages */}
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="bold">Recent Messages</Typography>
              <Chip 
                label="Coming Soon" 
                color="primary" 
                size="small"
                icon={<InfoIcon fontSize="small" />}
              />
            </Box>
            <Box textAlign="center" py={4}>
              <Typography variant="body1" color="text.secondary">
                The messaging feature is coming soon.
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TeacherDashboard;