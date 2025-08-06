import React, { useState } from 'react';
import {
  Box, Grid, Paper, Typography, Card, CardContent, CardActions, Button, Avatar, List, ListItem, ListItemText, ListItemIcon, Divider, TextField, Select, MenuItem, FormControl, InputLabel, Chip
} from '@mui/material';
import {
  Group as GroupIcon,
  Assignment as AssignmentIcon,
  Book as BookIcon,
  Notifications as NotificationsIcon,
  CheckCircleOutline as AttendanceIcon,
  PeopleOutline as RosterIcon,
  Campaign as AnnounceIcon,
  Event as EventIcon,
  Message as MessageIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

// Mock Data
const mockClasses = [
  { id: 1, name: 'Grade 10 - Mathematics', students: 32, period: 'Period 2 (09:00 - 10:00)' },
  { id: 2, name: 'Grade 11 - Physics', students: 28, period: 'Period 4 (11:00 - 12:00)' },
  { id: 3, name: 'Grade 10 - Chemistry', students: 30, period: 'Period 5 (13:00 - 14:00)' },
];

const mockDeadlines = [
  { id: 1, title: 'Maths Homework 5', class: 'Grade 10', dueDate: '2025-08-05' },
  { id: 2, title: 'Physics Lab Report', class: 'Grade 11', dueDate: '2025-08-07' },
  { id: 3, title: 'Chemistry Test', class: 'Grade 10', dueDate: '2025-08-10' },
];

const mockMessages = [
  { id: 1, from: 'Mr. Smith (Parent of John)', snippet: 'John will be absent tomorrow...' },
  { id: 2, from: 'Admin', snippet: 'Staff meeting at 3 PM today.' },
];

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [announcement, setAnnouncement] = useState('');
  const [selectedClass, setSelectedClass] = useState('');

  const handlePostAnnouncement = () => {
    if (!announcement.trim()) return;
    alert(`Announcing to ${selectedClass || 'all classes'}:\n${announcement}`);
    setAnnouncement('');
    setSelectedClass('');
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">
          Welcome, {user?.title || 'Mrs.'} {user?.surname || 'Davis'}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Here's your summary for today, {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.
        </Typography>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Total Students" value="90" icon={<GroupIcon />} /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Classes Taught" value="3" icon={<BookIcon />} /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Upcoming Deadlines" value={mockDeadlines.length} icon={<AssignmentIcon />} /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Unread Messages" value={mockMessages.length} icon={<NotificationsIcon />} /></Grid>
      </Grid>

      <Grid container spacing={4}>
        {/* Main Content (Left) */}
        <Grid item xs={12} md={8}>
          <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>My Classes</Typography>
          <Grid container spacing={3}>
            {mockClasses.map((c) => (
              <Grid item xs={12} sm={6} key={c.id}>
                <ClassCard classInfo={c} />
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Sidebar (Right) */}
        <Grid item xs={12} md={4}>
          {/* Upcoming Deadlines */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>Upcoming Deadlines</Typography>
            <List dense>
              {mockDeadlines.map(d => (
                <ListItem key={d.id} disableGutters>
                  <ListItemIcon sx={{minWidth: 32}}><EventIcon fontSize="small" color="action"/></ListItemIcon>
                  <ListItemText primary={d.title} secondary={`${d.class} - Due ${new Date(d.dueDate).toLocaleDateString()}`} />
                </ListItem>
              ))}
            </List>
          </Paper>

          {/* Post Announcement */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Post Announcement</Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Target Class (Optional)</InputLabel>
              <Select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} label="Target Class (Optional)">
                <MenuItem value="">All Classes</MenuItem>
                {mockClasses.map(c => <MenuItem key={c.id} value={c.name}>{c.name}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Your message..."
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button variant="contained" fullWidth onClick={handlePostAnnouncement}>Post</Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

// Helper Components
const StatCard = ({ title, value, icon }) => (
  <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
    <Box>
      <Typography variant="h6" fontWeight="bold">{value}</Typography>
      <Typography variant="body2" color="text.secondary">{title}</Typography>
    </Box>
    <Avatar sx={{ bgcolor: 'primary.main', color: 'white' }}>{icon}</Avatar>
  </Paper>
);

const ClassCard = ({ classInfo }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Typography variant="h6" fontWeight={600} noWrap>{classInfo.name}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{classInfo.period}</Typography>
      <Chip icon={<GroupIcon />} label={`${classInfo.students} Students`} size="small" />
    </CardContent>
    <CardActions>
      <Button size="small" startIcon={<AttendanceIcon />}>Take Attendance</Button>
      <Button size="small" startIcon={<RosterIcon />}>View Roster</Button>
    </CardActions>
  </Card>
);

export default TeacherDashboard;