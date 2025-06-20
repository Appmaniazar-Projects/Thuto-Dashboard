import React from 'react';
import { Grid, Paper, Typography, Box, Divider, Avatar, Chip, List, ListItem, ListItemText, ListItemAvatar, LinearProgress, Card, CardContent, Button, Badge, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts/lib';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EventIcon from '@mui/icons-material/Event';
import PersonIcon from '@mui/icons-material/Person';
import SubjectIcon from '@mui/icons-material/Subject';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import WarningIcon from '@mui/icons-material/Warning';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ArticleIcon from '@mui/icons-material/Article';

// Sample data for demonstration
const attendanceData = [
  { month: 'Sep', rate: 98 },
  { month: 'Oct', rate: 100 },
  { month: 'Nov', rate: 95 },
  { month: 'Dec', rate: 92 },
  { month: 'Jan', rate: 98 },
  { month: 'Feb', rate: 100 },
  { month: 'Mar', rate: 97 },
];

const gradesData = [
  { subject: 'Math', grade: 92, average: 84 },
  { subject: 'Science', grade: 88, average: 82 },
  { subject: 'English', grade: 95, average: 85 },
  { subject: 'History', grade: 85, average: 80 },
  { subject: 'Art', grade: 98, average: 90 },
];

const upcomingAssignmentsData = [
  { id: 1, subject: 'Math', title: 'Algebra Quiz', dueDate: 'Tomorrow', priority: 'High', completion: 90 },
  { id: 2, subject: 'Science', title: 'Lab Report', dueDate: 'Mar 24', priority: 'Medium', completion: 75 },
  { id: 3, subject: 'History', title: 'Research Paper', dueDate: 'Mar 29', priority: 'Medium', completion: 20 },
  { id: 4, subject: 'English', title: 'Essay', dueDate: 'Apr 5', priority: 'Low', completion: 0 },
];

const upcomingEventsData = [
  { id: 1, title: 'Science Fair', date: 'Apr 10, 2025', time: '1:00 PM - 3:30 PM', location: 'School Gymnasium' },
  { id: 2, title: 'Field Trip - Museum of Science', date: 'Apr 15, 2025', time: '9:00 AM - 2:00 PM', location: 'Downtown Museum District' },
  { id: 3, title: 'Spring Concert', date: 'Apr 22, 2025', time: '6:30 PM - 8:00 PM', location: 'School Auditorium' },
];

const recentGradesData = [
  { id: 1, subject: 'Math', assignment: 'Weekly Quiz', grade: '95/100', date: 'Mar 15', status: 'Excellent' },
  { id: 2, subject: 'Science', assignment: 'Lab Experiment', grade: '88/100', date: 'Mar 14', status: 'Good' },
  { id: 3, subject: 'English', assignment: 'Essay Draft', grade: '92/100', date: 'Mar 12', status: 'Excellent' },
  { id: 4, subject: 'History', assignment: 'Group Presentation', grade: '85/100', date: 'Mar 10', status: 'Good' },
];

const weeklyScheduleData = [
  { day: 'Monday', classes: [
    { time: '8:30 AM - 9:20 AM', subject: 'Math', room: '201', teacher: 'Ms. Johnson' },
    { time: '9:30 AM - 10:20 AM', subject: 'Science', room: '105', teacher: 'Mr. Thompson' },
    { time: '10:30 AM - 11:20 AM', subject: 'English', room: '304', teacher: 'Mrs. Davis' },
    { time: '12:00 PM - 12:50 PM', subject: 'Lunch', room: 'Cafeteria', teacher: '' },
    { time: '1:00 PM - 1:50 PM', subject: 'History', room: '208', teacher: 'Mr. Wilson' },
    { time: '2:00 PM - 2:50 PM', subject: 'Art', room: '103', teacher: 'Ms. Martinez' },
  ]},
  // Other days would be defined similarly
];

const StudentDashboard = () => {
  // Mock upcoming events and assignments
  const upcomingEvents = [
    { 
      id: 1, 
      title: 'Mathematics Quiz', 
      type: 'Assignment', 
      date: '2024-04-15', 
      subject: 'Mathematics' 
    },
    { 
      id: 2, 
      title: 'Science Project Submission', 
      type: 'Assignment', 
      date: '2024-04-20', 
      subject: 'Science' 
    },
    { 
      id: 3, 
      title: 'School Sports Day', 
      type: 'Event', 
      date: '2024-04-25', 
      subject: 'School Event' 
    }
  ];

  // Mock report cards
  const reportCards = [
    { term: 'Term 1', year: '2024', status: 'Available', link: '#' },
    { term: 'Term 2', year: '2024', status: 'Pending', link: '#' }
  ];

  return (
    <div>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, textAlign: 'center' }}>
        Student Dashboard
      </Typography>
      <Box>
        {/* Student Info & Quick Stats */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ width: 64, height: 64, mr: 2 }}>
                  <PersonIcon fontSize="large" />
                </Avatar>
                <Box>
                  <Typography variant="h5">Emma Thompson</Typography>
                  <Typography variant="subtitle1" color="text.secondary">Grade 8 - Room 103</Typography>
                  <Typography variant="body2">Student ID: ST-2025-0042</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={8}>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center', p: 1, borderRadius: 1, bgcolor: '#f5f5f5' }}>
                    <Typography variant="h6" color="primary">97%</Typography>
                    <Typography variant="body2">Attendance</Typography>
                  </Box>
                </Grid>
                {/* <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center', p: 1, borderRadius: 1, bgcolor: '#f5f5f5' }}>
                    <Typography variant="h6" color="success.main">91.6</Typography>
                    <Typography variant="body2">GPA</Typography>
                  </Box>
                </Grid> */}
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center', p: 1, borderRadius: 1, bgcolor: '#f5f5f5' }}>
                    <Typography variant="h6" color="warning.main">4</Typography>
                    <Typography variant="body2">Assignments Due</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center', p: 1, borderRadius: 1, bgcolor: '#f5f5f5' }}>
                    <Typography variant="h6" color="info.main">3</Typography>
                    <Typography variant="body2">Upcoming Events</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Paper>
        
        {/* Academic Reports Access */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6">
                <ArticleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Academic Reports
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Access and download your academic reports, progress summaries, and term results
              </Typography>
            </Box>
            <Button 
              variant="contained" 
              color="primary"
              startIcon={<FileDownloadIcon />}
              href="/student-reports"
            >
              View Reports
            </Button>
          </Box>
        </Paper>

        {/* Main Dashboard Content */}
        <Grid container spacing={3}>
          {/* Upcoming Assignments */}
          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: 400,
              }}
            >
              <Typography variant="h6" gutterBottom component="div">
                Upcoming Assignments
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ overflow: 'auto', flexGrow: 1 }}>
                <List>
                  {upcomingAssignmentsData.map((assignment) => (
                    <ListItem key={assignment.id} divider>
                      <ListItemAvatar>
                        <Badge 
                          color={assignment.priority === 'High' ? 'error' : 
                                 assignment.priority === 'Medium' ? 'warning' : 'success'} 
                          variant="dot"
                          overlap="circular"
                          anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                          }}
                        >
                          <Avatar sx={{ bgcolor: 'secondary.light' }}>
                            <AssignmentIcon />
                          </Avatar>
                        </Badge>
                      </ListItemAvatar>
                      <ListItemText 
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body1">
                              {assignment.title}
                            </Typography>
                            <Chip 
                              label={assignment.subject} 
                              size="small" 
                              color="primary" 
                              variant="outlined"
                              sx={{ ml: 1 }}
                            />
                          </Box>
                        }
                        secondary={
                          <React.Fragment>
                            <Typography variant="body2" component="span" color="text.primary">
                              Due: {assignment.dueDate}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={assignment.completion} 
                                sx={{ flexGrow: 1, mr: 1 }} 
                              />
                              <Typography variant="caption">
                                {assignment.completion}%
                              </Typography>
                            </Box>
                          </React.Fragment>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Paper>
          </Grid>

          {/* Recent Grades */}
          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: 400,
              }}
            >
              <Typography variant="h6" gutterBottom component="div">
                Recent Grades
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ overflow: 'auto', flexGrow: 1 }}>
                <List>
                  {recentGradesData.map((item) => (
                    <ListItem key={item.id} divider>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.light' }}>
                          <SubjectIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body1">
                              {item.assignment}
                            </Typography>
                            <Chip 
                              label={item.subject} 
                              size="small" 
                              color="primary" 
                              variant="outlined"
                              sx={{ ml: 1 }}
                            />
                          </Box>
                        }
                        secondary={
                          <React.Fragment>
                            <Typography variant="body2" component="span" color="text.primary">
                              Grade: {item.grade}
                            </Typography>
                            <Typography variant="caption" display="block" color="text.secondary">
                              {item.date} • Status: {item.status}
                            </Typography>
                          </React.Fragment>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Paper>
          </Grid>

          {/* Performance Chart */}
          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: 400,
              }}
            >
              <Typography variant="h6" gutterBottom component="div">
                Academic Performance
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <ResponsiveContainer width="100%" height="85%">
                <BarChart
                  data={gradesData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="subject" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar name="Your Grade" dataKey="grade" fill="#8884d8" />
                  <Bar name="Class Average" dataKey="average" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Attendance */}
          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: 400,
              }}
            >
              <Typography variant="h6" gutterBottom component="div">
                Attendance History
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <ResponsiveContainer width="100%" height="85%">
                <LineChart
                  data={attendanceData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[80, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="rate"
                    name="Attendance Rate (%)"
                    stroke="#2e7d32"
                    activeDot={{ r: 8 }}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Upcoming Events */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom component="div">
                Upcoming Events
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                {upcomingEventsData.map((event) => (
                  <Grid item xs={12} sm={6} md={4} key={event.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                          <Avatar sx={{ bgcolor: 'info.light', mr: 2 }}>
                            <EventIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="h6">{event.title}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {event.date} • {event.time}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {event.location}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </div>
  );
};

export default StudentDashboard;
