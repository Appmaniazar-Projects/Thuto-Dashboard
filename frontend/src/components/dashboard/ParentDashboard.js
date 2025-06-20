import React from 'react';
import { Grid, Paper, Typography, Box, Divider, Avatar, Chip, List, ListItem, ListItemText, ListItemAvatar, LinearProgress, Card, CardContent, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts/lib';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EventIcon from '@mui/icons-material/Event';
import PersonIcon from '@mui/icons-material/Person';
import MessageIcon from '@mui/icons-material/Message';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ArticleIcon from '@mui/icons-material/Article';

// Sample data for demonstration
const attendanceData = [
  { date: 'Mar 13', status: 'Present' },
  { date: 'Mar 14', status: 'Present' },
  { date: 'Mar 15', status: 'Absent', note: 'Doctor appointment' },
  { date: 'Mar 16', status: 'Present' },
  { date: 'Mar 17', status: 'Present' },
  { date: 'Mar 18', status: 'Weekend' },
  { date: 'Mar 19', status: 'Weekend' },
];

const monthlyAttendanceData = [
  { month: 'Sep', rate: 98 },
  { month: 'Oct', rate: 100 },
  { month: 'Nov', rate: 95 },
  { month: 'Dec', rate: 92 },
  { month: 'Jan', rate: 98 },
  { month: 'Feb', rate: 100 },
  { month: 'Mar', rate: 97 },
];

const feesData = [
  { month: 'Jan', paid: 3000, due: 0 },
  { month: 'Feb', paid: 2500, due: 500 },
  { month: 'Mar', paid: 3000, due: 0 },
  { month: 'Apr', paid: 2000, due: 1000 },
  { month: 'May', paid: 3000, due: 0 },
];

const skillsData = [
  { subject: 'Critical Thinking', score: 85 },
  { subject: 'Problem Solving', score: 90 },
  { subject: 'Communication', score: 75 },
  { subject: 'Collaboration', score: 80 },
  { subject: 'Creativity', score: 95 },
];

const EventsData = [
  { id: 1, title: 'Parent-Teacher Conference', date: 'Mar 25, 2025', time: '4:00 PM - 6:00 PM', location: 'Room 103' },
  { id: 2, title: 'Science Fair', date: 'Apr 10, 2025', time: '1:00 PM - 3:30 PM', location: 'School Gymnasium' },
  { id: 3, title: 'Field Trip - Museum of Science', date: 'Apr 15, 2025', time: '9:00 AM - 2:00 PM', location: 'Downtown Museum District' },
  { id: 4, title: 'Spring Concert', date: 'Apr 22, 2025', time: '6:30 PM - 8:00 PM', location: 'School Auditorium' },
];

const assignmentsData = [
  { id: 1, title: 'Math - Algebra Quiz', dueDate: 'Mar 22', status: 'Completed', grade: '95/100' },
  { id: 2, title: 'Science Lab Report', dueDate: 'Mar 24', status: 'In Progress', completion: 75 },
  { id: 3, title: 'History Research Paper', dueDate: 'Mar 29', status: 'Not Started', completion: 0 },
  { id: 4, title: 'English Essay', dueDate: 'Apr 5', status: 'Not Started', completion: 0 },
];

// const communicationsData = [
//   { id: 1, from: 'Ms. Johnson (Math)', date: 'Mar 18', subject: 'Upcoming Test Preparation', read: true },
//   { id: 2, from: 'Principal Davis', date: 'Mar 17', subject: 'School Event Announcement', read: true },
//   { id: 3, from: 'Mr. Thompson (Science)', date: 'Today', subject: 'Science Fair Project Feedback', read: false },
//   { id: 4, from: 'School Nurse', date: 'Today', subject: 'Health Check Reminder', read: false },
// ];
const feedsData = [
  { id: 1, from: 'School Admin', date: 'Mar 18', subject: 'Upcoming Holiday Schedule', read: true },
  { id: 2, from: 'Event Coordinator', date: 'Mar 17', subject: 'School Sports Day Announcement', read: true },
  { id: 3, from: 'Math Department', date: 'Today', subject: 'New Math Resources Available', read: false },
  { id: 4, from: 'Parent Association', date: 'Today', subject: 'Annual Fundraiser Update', read: false },
];

const ParentDashboard = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, textAlign: 'center' }}>
        Parent Dashboard
      </Typography>
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
                <Typography variant="body2">ID: ST-2025-0042</Typography>
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
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center', p: 1, borderRadius: 1, bgcolor: '#f5f5f5' }}>
                  <Typography variant="h6" color="warning.main">2</Typography>
                  <Typography variant="body2">Unread Messages</Typography>
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
              Child's Academic Reports
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Access and download your child's academic reports, progress summaries, and term results
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            color="primary"
            startIcon={<FileDownloadIcon />}
            href="/parent-reports"
          >
            View Reports
          </Button>
        </Box>
      </Paper>

      {/* Main Dashboard Content */}
      <Grid container spacing={3}>
        {/* Attendance History */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 350,
            }}
          >
            <Typography variant="h6" gutterBottom component="div">
              Attendance History
            </Typography>
            <Box sx={{ display: 'flex', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'success.main', mr: 1 }} />
                <Typography variant="caption">Present</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'error.main', mr: 1 }} />
                <Typography variant="caption">Absent</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'text.disabled', mr: 1 }} />
                <Typography variant="caption">Weekend/Holiday</Typography>
              </Box>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ overflow: 'auto', flexGrow: 1 }}>
              <List dense>
                {attendanceData.map((day, index) => (
                  <ListItem key={index} divider>
                    <ListItemText 
                      primary={day.date} 
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {day.status === 'Present' && (
                        <Chip 
                          icon={<CheckCircleIcon />} 
                          label="Present" 
                          size="small" 
                          color="success" 
                          variant="outlined"
                        />
                      )}
                      {day.status === 'Absent' && (
                        <>
                          <Chip 
                            icon={<WarningIcon />} 
                            label="Absent" 
                            size="small" 
                            color="error" 
                            variant="outlined"
                          />
                          {day.note && (
                            <Typography variant="caption" sx={{ ml: 1 }}>
                              ({day.note})
                            </Typography>
                          )}
                        </>
                      )}
                      {day.status === 'Weekend' && (
                        <Typography variant="body2" color="text.disabled">
                          Weekend
                        </Typography>
                      )}
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Box>
            <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(0, 0, 0, 0.12)' }}>
              <ResponsiveContainer width="100%" height={100}>
                <LineChart
                  data={monthlyAttendanceData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis domain={[90, 100]} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="rate" stroke="#4caf50" dot={{ r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
              <Typography variant="caption" align="center" display="block">
                Monthly Attendance Rate (%)
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Fees Management */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 350,
            }}
          >
            <Typography variant="h6" gutterBottom component="div">
              Fees Management
            </Typography>
            <Box sx={{ flexGrow: 1 }}>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={feesData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="paid" name="Paid Fees" fill="#4caf50" />
                  <Bar dataKey="due" name="Due Amount" fill="#f44336" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Events */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 300,
            }}
          >
            <Typography variant="h6" gutterBottom component="div">
              Events
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ overflow: 'auto', flexGrow: 1 }}>
              <List>
                {EventsData.map((event) => (
                  <ListItem key={event.id} divider>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.light' }}>
                        <EventIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={event.title}
                      secondary={
                        <React.Fragment>
                          <Typography variant="body2" component="span" sx={{ display: 'block' }}>
                            {event.date} | {event.time}
                          </Typography>
                          <Typography variant="caption" component="span">
                            Location: {event.location}
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

        {/* Assignments */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 300,
            }}
          >
            <Typography variant="h6" gutterBottom component="div">
              Assignments
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ overflow: 'auto', flexGrow: 1 }}>
              <List>
                {assignmentsData.map((assignment) => (
                  <ListItem key={assignment.id} divider>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'secondary.light' }}>
                        <AssignmentIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={assignment.title}
                      secondary={`Due: ${assignment.dueDate}`} 
                    />
                    <Box sx={{ minWidth: 120 }}>
                      {assignment.status === 'Completed' ? (
                        <Chip 
                          label={`Completed: ${assignment.grade}`} 
                          size="small" 
                          color="success" 
                          variant="outlined"
                        />
                      ) : (
                        <Box sx={{ width: '100%' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ width: '100%', mr: 1 }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={assignment.completion} 
                                color={assignment.status === 'In Progress' ? 'warning' : 'error'}
                              />
                            </Box>
                            <Box sx={{ minWidth: 35 }}>
                              <Typography variant="body2" color="text.secondary">
                                {assignment.completion}%
                              </Typography>
                            </Box>
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {assignment.status}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Box>
          </Paper>
        </Grid>

        {/*  Feeds */}
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Typography variant="h6" gutterBottom component="div">
              Feeds
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              {feedsData.map((message) => (
                <Grid item xs={12} sm={6} md={3} key={message.id}>
                  <Card variant="outlined" sx={{ 
                    bgcolor: message.read ? 'background.paper' : 'action.hover',
                    position: 'relative'
                  }}>
                    {!message.read && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 12,
                          right: 12,
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          bgcolor: 'error.main',
                        }}
                      />
                    )}
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
                          <MessageIcon fontSize="small" />
                        </Avatar>
                        <Typography variant="subtitle2" noWrap>
                          {message.from}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {message.date}
                      </Typography>
                      <Typography variant="body2" noWrap>
                        {message.subject}
                      </Typography>
                      <Button size="small" sx={{ mt: 1 }}>
                        Read Message
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ParentDashboard;
