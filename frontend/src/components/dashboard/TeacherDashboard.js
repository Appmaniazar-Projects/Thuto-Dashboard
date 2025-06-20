import React, { useState } from 'react';
import { Grid, Paper, Typography, Box, Divider, Avatar, Chip, List, ListItem, ListItemText, ListItemAvatar, LinearProgress, Button, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts/lib';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EventIcon from '@mui/icons-material/Event';
import PersonIcon from '@mui/icons-material/Person';
import MessageIcon from '@mui/icons-material/Message';



// Sample data for demonstration
const attendanceData = [
  { name: 'Mon', present: 28, absent: 2, late: 1 },
  { name: 'Tue', present: 30, absent: 0, late: 1 },
  { name: 'Wed', present: 27, absent: 3, late: 1 },
  { name: 'Thu', present: 29, absent: 1, late: 1 },
  { name: 'Fri', present: 26, absent: 4, late: 1 },
];

const assignmentCompletionData = [
  { name: 'Math Quiz', complete: 85, incomplete: 15 },
  { name: 'Science Lab', complete: 92, incomplete: 8 },
  { name: 'History Essay', complete: 78, incomplete: 22 },
  { name: 'English Report', complete: 88, incomplete: 12 },
  { name: 'Group Project', complete: 95, incomplete: 5 },
];

const performanceTrendData = [
  { month: 'Sep', average: 76 },
  { month: 'Oct', average: 78 },
  { month: 'Nov', average: 75 },
  { month: 'Dec', average: 80 },
  { month: 'Jan', average: 82 },
  { month: 'Feb', average: 84 },
];



const COLORS = ['#0088FE', '#FF8042'];

const studentRosterData = [
  { id: 1, name: 'Emma Thompson', attendance: 98, performance: 92, lastActive: '10 min ago', status: 'Present' },
  { id: 2, name: 'Noah Garcia', attendance: 95, performance: 88, lastActive: '1 hour ago', status: 'Present' },
  { id: 3, name: 'Olivia Martinez', attendance: 100, performance: 95, lastActive: '30 min ago', status: 'Present' },
  { id: 4, name: 'Liam Johnson', attendance: 85, performance: 78, lastActive: '2 days ago', status: 'Absent' },
  { id: 5, name: 'Sophia Lee', attendance: 92, performance: 90, lastActive: '1 day ago', status: 'Present' },
];

const EventsData = [
  { id: 1, title: 'Career Day', dueDate: 'Tomorrow'},
  { id: 2, title: 'Field Trip to the Science Museum', dueDate: 'Mar 22'},
  { id: 3, title: 'Sports Day', dueDate: 'Mar 25'},
];



const FeedData = [
  { id: 1, parent: 'Mr. Thompson', student: 'Emma Thompson', time: '2 hours ago', message: 'Question about the upcoming field trip' },
  { id: 2, parent: 'Mrs. Garcia', student: 'Noah Garcia', time: 'Yesterday', message: 'Request for additional homework support' },
  { id: 3, parent: 'Mr. & Mrs. Johnson', student: 'Liam Johnson', time: '2 days ago', message: 'Absence notification for doctor appointment' },
];

const TeacherDashboard = () => {

  // events at school: description, dueDate, grade(),subjects should be filtered according the subjects they are teaching
  const [message, setMessage] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');

  const grades = ['Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];
  const subjects = ['Mathematics', 'Science', 'English', 'History', 'Computer Science'];

  const handleSendMessage = () => {
    // TODO: Implement message sending logic
    console.log('Sending message:', {
      message,
      grade: selectedGrade,
      subject: selectedSubject
    });
    // Reset fields after sending
    setMessage('');
    setSelectedGrade('');
    setSelectedSubject('');
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, textAlign: 'center' }}>
        Teacher Dashboard
      </Typography>
      {/* KPI Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={2}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 120,
              bgcolor: '#f5f5f5',
              borderLeft: '4px solid #1976d2',
            }}
          >
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              {/* Class Attendance Today */}
            </Typography>
            <Typography variant="h4" component="div" sx={{ fontWeight: 'medium', color: '#1976d2' }}>
              Geography
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {/* 29/31 students present */}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={2}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 120,
              bgcolor: '#f5f5f5',
              borderLeft: '4px solid #2e7d32',
            }}
          >
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              {/* Assignment Completion */}
            </Typography>
            <Typography variant="h4" component="div" sx={{ fontWeight: 'medium', color: '#2e7d32' }}>
              Physical Science
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {/* Average across all assignments */}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={2}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 120,
              bgcolor: '#f5f5f5',
              borderLeft: '4px solid #ed6c02',
            }}
          >
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              {/* Class Average */}
            </Typography>
            <Typography variant="h4" component="div" sx={{ fontWeight: 'medium', color: '#ed6c02' }}>
              Agriculture
            </Typography>
            <Typography variant="body2" sx={{ color: 'success.main', mt: 1 }}>
              {/* +2.4% from last month */}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={2}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 120,
              bgcolor: '#f5f5f5',
              borderLeft: '4px solid #9c27b0',
            }}
          >
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              {/* Parent Messages */}
            </Typography>
            <Typography variant="h4" component="div" sx={{ fontWeight: 'medium', color: '#9c27b0' }}>
              CAT
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {/* 3 new since yesterday */}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* New Messaging Section */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Send Announcement
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                label="Message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your announcement here..."
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Grade</InputLabel>
                <Select
                  value={selectedGrade}
                  label="Grade"
                  onChange={(e) => setSelectedGrade(e.target.value)}
                >
                  <MenuItem value="">All Grades</MenuItem>
                  {grades.map((grade) => (
                    <MenuItem key={grade} value={grade}>
                      {grade}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Subject</InputLabel>
                <Select
                  value={selectedSubject}
                  label="Subject"
                  onChange={(e) => setSelectedSubject(e.target.value)}
                >
                  <MenuItem value="">All Subjects</MenuItem>
                  {subjects.map((subject) => (
                    <MenuItem key={subject} value={subject}>
                      {subject}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Button 
                variant="contained" 
                color="primary" 
                fullWidth
                onClick={handleSendMessage}
                disabled={!message}
              >
                Send Announcement
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Grid>

      {/* Charts and Tables */}
      <Grid container spacing={3}>
        {/* Class Register with Attendance Status */}
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
              Class Register
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ overflow: 'auto', maxHeight: 270 }}>
              <List>
                {studentRosterData.map((student) => (
                  <ListItem key={student.id} divider>
                    <ListItemAvatar>
                      <Avatar>
                        <PersonIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={student.name}
                      secondary={
                        <React.Fragment>
                          <Typography variant="body2" component="span" sx={{ display: 'block' }}>
                            Performance: {student.performance}% | Attendance: {student.attendance}%
                          </Typography>
                          <Typography variant="caption" component="span">
                            Last active: {student.lastActive}
                          </Typography>
                        </React.Fragment>
                      } 
                    />
                    <Chip 
                      label={student.status} 
                      size="small" 
                      color={student.status === 'Present' ? 'success' : 'error'} 
                      variant="outlined"
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Paper>
        </Grid>

        {/* Weekly Attendance */}
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
              Weekly Attendance
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart
                data={attendanceData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="present" stackId="a" fill="#4caf50" />
                <Bar dataKey="late" stackId="a" fill="#ff9800" />
                <Bar dataKey="absent" stackId="a" fill="#f44336" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Assignment Completion */}
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
              Assignment Completion Rates
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart
                data={assignmentCompletionData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="complete" fill="#4caf50" />
                <Bar dataKey="incomplete" fill="#f44336" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Performance Trend */}
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
              Performance Trend
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <LineChart
                data={performanceTrendData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[70, 90]} />
                <Tooltip />
                <Line type="monotone" dataKey="average" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
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
    <List>
      {EventsData.map((assignment) => (
        <ListItem key={assignment.id} divider>
          <ListItemAvatar>
            <Avatar>
              <AssignmentIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText 
            primary={assignment.title}
            secondary={`Due: ${assignment.dueDate}`} 
          />
        </ListItem>
      ))}
    </List>
  </Paper>
</Grid>

        
         {/* Feed */}
<     Grid item xs={12} md={6}>
  <Paper
    sx={{
      p: 2,
      display: 'flex',
      flexDirection: 'column',
      height: 300,
    }}
  >
    <Typography variant="h6" gutterBottom component="div">
      Feed
    </Typography>
    <Box sx={{ height: '100%' }}>
      <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Typography variant="subtitle2" gutterBottom>Recent Feed</Typography>
        <Divider sx={{ mb: 1 }} />
        <List dense>
          {FeedData.map((message) => (
            <ListItem
              key={message.id}
              sx={{
                px: 0,
                alignItems: 'flex-start',
              }}
            >
              <ListItemAvatar>
                <Avatar sx={{ width: 32, height: 32 }}>
                  <MessageIcon fontSize="small" />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={`${message.parent} (${message.student})`}
                secondary={`${message.time}: ${message.message}`}
                primaryTypographyProps={{
                  variant: 'body2',
                  sx: { textAlign: 'left' },
                }}
                secondaryTypographyProps={{
                  variant: 'caption',
                  sx: { textAlign: 'left' },
                }}
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  </Paper>
</Grid>

      </Grid>
    </div>
  );
};

export default TeacherDashboard;
