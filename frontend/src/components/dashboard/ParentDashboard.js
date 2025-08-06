import React, { useState } from 'react';
import {
  Box, Grid, Paper, Typography, Avatar, List, ListItem, ListItemText, ListItemIcon, Button, Divider, Select, MenuItem, FormControl, InputLabel, Card, CardContent
} from '@mui/material';
import {
  Face as ChildIcon,
  Event as EventIcon,
  Assessment as AssessmentIcon,
  AssignmentLate as AssignmentLateIcon,
  CreditScore as CreditScoreIcon,
  Campaign as CampaignIcon,
  ContactMail as ContactMailIcon,
  Summarize as SummarizeIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

// Mock Data
const mockChildren = [
  { id: 1, name: 'Emma Thompson', grade: 'Grade 10', school: 'Northwood High', attendance: '98%', missingAssignments: 1, overallGrade: 'A-' },
  { id: 2, name: 'James Hill', grade: 'Grade 8', school: 'Westwood Middle', attendance: '95%', missingAssignments: 3, overallGrade: 'B+' },
];

const mockGrades = [
  { subject: 'Mathematics', grade: 'A', score: 94 },
  { subject: 'Physics', grade: 'B+', score: 88 },
  { subject: 'English', grade: 'A-', score: 91 },
];

const mockAnnouncements = [
  { id: 1, from: 'School Admin', title: 'Parent-Teacher Conferences Next Week' },
  { id: 2, from: 'Mr. Smith', title: 'Maths Homework 5 Posted' },
];

const ParentDashboard = () => {
  const { user } = useAuth();
  const [selectedChild, setSelectedChild] = useState(mockChildren[0]);

  const handleChildChange = (event) => {
    const child = mockChildren.find(c => c.id === event.target.value);
    setSelectedChild(child);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Parent Dashboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Welcome, {user?.name || 'Mr. Thompson'}.
          </Typography>
        </Box>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Select Child</InputLabel>
          <Select value={selectedChild.id} onChange={handleChildChange} label="Select Child">
            {mockChildren.map(child => (
              <MenuItem key={child.id} value={child.id}>{child.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Current Attendance" value={selectedChild.attendance} icon={<AssessmentIcon />} /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Missing Assignments" value={selectedChild.missingAssignments} icon={<AssignmentLateIcon />} /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Overall Grade" value={selectedChild.overallGrade} icon={<SummarizeIcon />} /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Fees Due" value="R0" icon={<CreditScoreIcon />} /></Grid>
      </Grid>

      <Grid container spacing={4}>
        {/* Main Content (Left) */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Recent Grades for {selectedChild.name}</Typography>
            <List dense>
              {mockGrades.map(grade => (
                <ListItem key={grade.subject} divider>
                  <ListItemText primary={grade.subject} secondary={`Score: ${grade.score}`}/>
                  <Chip label={grade.grade} color="primary"/>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Sidebar (Right) */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>Recent Announcements</Typography>
            <List dense>
              {mockAnnouncements.map(ann => (
                <ListItem key={ann.id} disableGutters>
                  <ListItemIcon sx={{minWidth: 32}}><CampaignIcon fontSize="small" color="action"/></ListItemIcon>
                  <ListItemText primary={ann.title} secondary={`From: ${ann.from}`} />
                </ListItem>
              ))}
            </List>
          </Paper>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>Quick Actions</Typography>
            <List dense>
              <ListItem disableGutters><Button startIcon={<AssessmentIcon />} fullWidth sx={{justifyContent: 'flex-start'}}>Full Attendance</Button></ListItem>
              <ListItem disableGutters><Button startIcon={<SummarizeIcon />} fullWidth sx={{justifyContent: 'flex-start'}}>Academic Reports</Button></ListItem>
              <ListItem disableGutters><Button startIcon={<ContactMailIcon />} fullWidth sx={{justifyContent: 'flex-start'}}>Contact Teachers</Button></ListItem>
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

export default ParentDashboard;
