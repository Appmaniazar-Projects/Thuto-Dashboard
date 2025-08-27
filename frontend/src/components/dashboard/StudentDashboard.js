import React from 'react';
import {
  Box, Grid, Paper, Typography, Avatar, List, ListItem, ListItemText, 
  ListItemIcon, Button, Divider, Chip, useTheme, Card, CardContent, CardActionArea
} from '@mui/material';
import {
  School as SchoolIcon,
  Assessment as AssessmentIcon,
  Assignment as AssignmentIcon,
  Book as BookIcon,
  Folder as FolderIcon,
  CheckCircle as CheckCircleIcon,
  ArrowForward as ArrowForwardIcon,
  Event as EventIcon,
  Notifications as NotificationsIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  Today as TodayIcon,
  Grade as GradeIcon,
  EventNote as EventNoteIcon,
  Message as MessageIcon,
  InsertDriveFile as FileIcon,
  CalendarToday as CalendarIcon,
  Cancel as AbsentIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { format, parseISO, isAfter, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns';

// Mock Data
const mockResources = [
  { id: 1, name: 'Physics Chapter 5 Notes.pdf', subject: 'Physics', uploaded: '2023-10-25T10:00:00Z' },
  { id: 2, name: 'Algebra II Worksheet.docx', subject: 'Mathematics', uploaded: '2023-10-24T14:30:00Z' },
  { id: 3, name: 'The Great Gatsby Analysis.pptx', subject: 'English Lit', uploaded: '2023-10-23T09:15:00Z' },
];

const mockAttendance = {
  present: [2, 3, 4, 5, 6, 9, 10, 11, 12, 13, 16, 17, 18, 20, 23, 24, 25],
  absent: [19],
  holiday: [26, 27],
};

const mockAnnouncements = [
    { id: 1, title: 'Mid-term Exams Schedule', text: 'The schedule for the upcoming mid-term exams has been posted...', date: '2023-10-20T09:00:00Z', isNew: true, category: 'Academics' },
    { id: 2, title: 'Annual Sports Day', text: 'Get ready for the annual sports day next month! Registrations are now open.', date: '2023-10-18T14:00:00Z', isNew: false, category: 'Events' },
    { id: 3, title: 'Library Books Return', text: 'Please return all borrowed library books by the end of this week.', date: '2023-10-15T11:30:00Z', isNew: false, category: 'General' },
];

const StudentDashboard = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const today = format(new Date(), 'EEEE, MMMM d, yyyy');

  const quickLinks = [
    { text: 'My Courses', path: '/student/subjects', icon: <BookIcon /> },
    { text: 'My Grades', path: '/student/reports', icon: <AssessmentIcon /> },
    { text: 'Assignments', path: '/student/assignments', icon: <AssignmentIcon />, count: 5 },
    { text: 'Resources', path: '/student/resources', icon: <FolderIcon />, count: mockResources.length },
  ];

  // Attendance Calendar Data
  const now = new Date();
  const daysInMonth = eachDayOfInterval({ start: startOfMonth(now), end: endOfMonth(now) });
  const firstDayOfMonth = getDay(startOfMonth(now)); // 0 = Sunday, 1 = Monday...

  const attendancePercentage = Math.round(
    (mockAttendance.present.length / (mockAttendance.present.length + mockAttendance.absent.length)) * 100
  );

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
          <StatCard title="Attendance" value={`${attendancePercentage}%`} icon={<CheckCircleIcon />} subtitle="This Month" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="New Resources" value={mockResources.length} icon={<FileIcon />} subtitle="Recently Added" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Upcoming Events" value="2" icon={<EventNoteIcon />} subtitle="This Month" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Unread Messages" value="5" icon={<MessageIcon />} subtitle="In Your Inbox" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Main Content (Left) */}
        <Grid item xs={12} lg={8}>
          {/* Monthly Attendance */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Monthly Attendance</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <Typography key={day} variant="caption" align="center" color="text.secondary">{day}</Typography>
              ))}
              {Array.from({ length: firstDayOfMonth }).map((_, i) => <Box key={`empty-${i}`} />)}
              {daysInMonth.map(day => {
                const date = day.getDate();
                let dayStyle = {};
                if (mockAttendance.present.includes(date)) {
                  dayStyle = { bgcolor: 'success.light', color: 'success.contrastText' };
                } else if (mockAttendance.absent.includes(date)) {
                  dayStyle = { bgcolor: 'error.light', color: 'error.contrastText' };
                } else if (mockAttendance.holiday.includes(date)) {
                  dayStyle = { bgcolor: 'info.light', color: 'info.contrastText' };
                }
                return (
                  <Avatar key={date} sx={{ width: 32, height: 32, fontSize: '0.875rem', ...dayStyle }}>{date}</Avatar>
                );
              })}
            </Box>
          </Paper>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
                {/* Events */}
                <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                    <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Events</Typography>
                    <Typography variant="body2" color="text.secondary">Coming Soon...</Typography>
                </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
                {/* Messages */}
                <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                    <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Recent Messages</Typography>
                    <Typography variant="body2" color="text.secondary">Coming Soon...</Typography>
                </Paper>
            </Grid>
          </Grid>
        </Grid>

        {/* Sidebar (Right) */}
        <Grid item xs={12} lg={4}>
          {/* Recent Resources */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Recent Resources</Typography>
            <List dense disablePadding>
              {mockResources.map(resource => (
                <ListItem key={resource.id} disableGutters button component={Link} to={`/student/resources/${resource.id}`}>
                  <ListItemIcon><FileIcon color="primary" /></ListItemIcon>
                  <ListItemText primary={resource.name} secondary={resource.subject} />
                </ListItem>
              ))}
            </List>
          </Paper>

          {/* Announcements */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Announcements</Typography>
            <List dense disablePadding>
              {mockAnnouncements.map((announcement, index) => (
                <React.Fragment key={announcement.id}>
                  <ListItem disableGutters>
                    <ListItemText 
                      primary={announcement.title}
                      secondary={announcement.category}
                      primaryTypographyProps={{ fontWeight: 'medium' }}
                    />
                    {announcement.isNew && <Chip label="New" color="primary" size="small" />}
                  </ListItem>
                  {index < mockAnnouncements.length - 1 && <Divider component="li" sx={{ my: 1 }} />}
                </React.Fragment>
              ))}
            </List>
          </Paper>

          {/* Quick Links */}
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Quick Links</Typography>
            <List dense disablePadding>
              {quickLinks.map((link) => (
                <ListItem key={link.text} button component={Link} to={link.path} disableGutters>
                  <ListItemIcon sx={{ minWidth: 40, color: 'primary.main' }}>{link.icon}</ListItemIcon>
                  <ListItemText primary={link.text} />
                  <ArrowForwardIcon fontSize="small" color="action" />
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
const StatCard = ({ title, value, icon, subtitle }) => (
  <Paper 
    sx={{ 
      p: 2, 
      height: '100%',
      borderRadius: 2,
      borderLeft: '4px solid',
      borderColor: 'primary.main',
      '&:hover': {
        boxShadow: 3,
        transform: 'translateY(-2px)',
        transition: 'all 0.2s ease-in-out',
      },
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Avatar 
        sx={{ 
          mr: 2, 
          bgcolor: 'primary.light',
          color: 'primary.contrastText',
          width: 48,
          height: 48,
        }}
      >
        {React.cloneElement(icon, { fontSize: 'medium' })}
      </Avatar>
      <Box>
        <Typography variant="h5" fontWeight="bold">{value}</Typography>
        <Typography variant="body2" color="text.secondary">{title}</Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
  </Paper>
);

export default StudentDashboard;