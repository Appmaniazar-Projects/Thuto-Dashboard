import React from 'react';
import {
  Box, Grid, Paper, Typography, Avatar, List, ListItem, ListItemText, ListItemIcon, Button, Divider
} from '@mui/material';
import {
  School as SchoolIcon,
  Assessment as AssessmentIcon,
  Assignment as AssignmentIcon,
  Campaign as CampaignIcon,
  Book as BookIcon,
  Folder as FolderIcon,
  CheckCircle as CheckCircleIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

// Mock Data
const mockCourses = [
  { id: 1, name: 'Mathematics', teacher: 'Mr. Daniels' },
  { id: 2, name: 'Physics', teacher: 'Ms. Ava' },
  { id: 3, name: 'English Literature', teacher: 'Mr. Harrison' },
  { id: 4, name: 'History', teacher: 'Mrs. Gable' },
];

const mockAnnouncements = [
  { id: 1, text: 'School will be closed on Friday for a public holiday.' },
  { id: 2, text: 'Submit your science fair projects by next Monday.' },
];

const quickLinks = [
    { text: 'My Subjects', path: '/student/subjects', icon: <BookIcon /> },
    { text: 'Resources', path: '/student/resources', icon: <FolderIcon /> },
    { text: 'Attendance', path: '/student/attendance', icon: <CheckCircleIcon /> },
    { text: 'Academic Report', path: '/student/reports', icon: <AssessmentIcon /> },
];

const StudentDashboard = () => {
  const { user } = useAuth();
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">
          Welcome, {user?.name || 'Emma'}!
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {today}
        </Typography>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Courses Enrolled" value={mockCourses.length} icon={<SchoolIcon />} /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Assignments Due" value="3" icon={<AssignmentIcon />} /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Attendance Rate" value="95%" icon={<CheckCircleIcon />} /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="New Resources" value="5" icon={<FolderIcon />} /></Grid>
      </Grid>

      <Grid container spacing={4}>
        {/* Main Content (Left) */}
        <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2, mb: 3, height: '100%' }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>My Subjects</Typography>
                <List dense>
                {mockCourses.map(course => (
                    <ListItem key={course.id} divider>
                    <ListItemIcon><BookIcon /></ListItemIcon>
                    <ListItemText primary={course.name} secondary={`Teacher: ${course.teacher}`} />
                    <Button component={Link} to="/student/subjects" variant="outlined" size="small">View</Button>
                    </ListItem>
                ))}
                </List>
            </Paper>
        </Grid>

        {/* Sidebar (Right) */}
        <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>Quick Links</Typography>
                <List dense>
                {quickLinks.map((link) => (
                    <ListItem key={link.text} button component={Link} to={link.path} disableGutters>
                        <ListItemIcon sx={{ minWidth: 40 }}>{link.icon}</ListItemIcon>
                        <ListItemText primary={link.text} />
                        <ArrowForwardIcon fontSize="small" />
                    </ListItem>
                ))}
                </List>
            </Paper>
            <Paper sx={{ p: 2 }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>Recent Announcements</Typography>
                <List dense>
                {mockAnnouncements.map(announcement => (
                    <ListItem key={announcement.id} disableGutters>
                        <ListItemIcon sx={{ minWidth: 40 }}><CampaignIcon fontSize="small" color="action"/></ListItemIcon>
                        <ListItemText primary={announcement.text} />
                    </ListItem>
                ))}
                </List>
            </Paper>
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


export default StudentDashboard;
