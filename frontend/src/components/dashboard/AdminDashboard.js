import React from 'react';
import { Grid, Paper, Typography, Box, Card, CardContent, Divider } from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts/lib';
import PDFReportGenerator from '../reports/PDFReportGenerator';

// Sample data for demonstration
const enrollmentData = [
  { name: 'Grade 6', students: 124 },
  { name: 'Grade 7', students: 135 },
  { name: 'Grade 8', students: 118 },
  { name: 'Grade 9', students: 142 },
  { name: 'Grade 10', students: 129 },
  { name: 'Grade 11', students: 110 },
  { name: 'Grade 12', students: 95 },
];

const attendanceData = [
  { name: 'Mon', rate: 94 },
  { name: 'Tue', rate: 96 },
  { name: 'Wed', rate: 92 },
  { name: 'Thu', rate: 95 },
  { name: 'Fri', rate: 90 },
];

// const engagementData = [
//   { name: 'Active', value: 68 },
//   { name: 'Occasional', value: 22 },
//   { name: 'Inactive', value: 10 },
// ];
const engagementData = [ //genderData
  { name: 'Male', value: 120 },
  { name: 'Female', value: 150 },
];


const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const EventsData = [ // eventNotificationsData
  { time: '09:15 AM', user: 'Ms. Johnson', action: 'Updated attendance for Grade 8' },
  { time: '08:42 AM', user: 'Principal Davis', action: 'Approved field trip request' },
  { time: 'Yesterday', user: 'System', action: 'Generated monthly attendance report' },
  { time: 'Yesterday', user: 'Mr. Thompson', action: 'Generated grade reports for Grade 10' },
  { time: '2 days ago', user: 'Ms. Williams', action: 'Created new event: Science Fair' },
];

const AdminDashboard = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, textAlign: 'center' }}>
        Admin Dashboard
      </Typography>
      {/* KPI Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
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
              Total Enrollment
            </Typography>
            <Typography variant="h4" component="div" sx={{ fontWeight: 'medium', color: '#1976d2' }}>
              853
            </Typography>
            <Typography variant="body2" sx={{ color: 'success.main', mt: 1 }}>
              +2.3% from last month
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
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
              Average Attendance
            </Typography>
            <Typography variant="h4" component="div" sx={{ fontWeight: 'medium', color: '#2e7d32' }}>
              93.4%
            </Typography>
            <Typography variant="body2" sx={{ color: 'success.main', mt: 1 }}>
              +1.2% from last week
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* PDF Report Generator */}
      {/* <PDFReportGenerator /> */}

      {/* Charts and Tables */}
      <Grid container spacing={3}>
        {/* Enrollment by Grade */}
        <Grid item xs={12} md={7}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 380,
            }}
          >
            <Typography variant="h6" gutterBottom component="div">
              Enrollment by Grade
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart
                data={enrollmentData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="students" fill="#1976d2" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Parent Engagement
        <Grid item xs={12} md={5}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 380,
            }}
          >
            <Typography variant="h6" gutterBottom component="div">
              Parent Engagement
            </Typography>
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie
                  data={engagementData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {engagementData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid> */}
        {/* Number of Learners */}
<Grid item xs={12} md={5}>
  <Paper
    sx={{
      p: 2,
      display: 'flex',
      flexDirection: 'column',
      height: 380,
    }}
  >
    <Typography variant="h6" gutterBottom component="div">
      Number of Learners
    </Typography>
    <ResponsiveContainer width="100%" height="80%">
      <PieChart>
        <Pie
          data={engagementData} // Make sure this is updated as shown below
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={({ name, value }) => `${name}: ${value}`}
        >
          {engagementData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => `${value} learners`} />
      </PieChart>
    </ResponsiveContainer>
  </Paper>
</Grid>


        {/* Weekly Attendance */}
        <Grid item xs={12} md={7}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 380,
            }}
          >
            <Typography variant="h6" gutterBottom component="div">
              Weekly Attendance Rate
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <LineChart
                data={attendanceData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[85, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="rate" stroke="#2e7d32" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Events */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 2, height: 380, overflow: 'auto' }}>
            <Typography variant="h6" gutterBottom component="div">
              Events
            </Typography>
            <Box>
              {EventsData.map((activity, index) => (
                <React.Fragment key={index}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      mb: 1.5, 
                      backgroundColor: index === 0 ? '#f0f7ff' : 'transparent' 
                    }}
                  >
                    <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {activity.time}
                      </Typography>
                      <Typography variant="body1">
                        {activity.action}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        by {activity.user}
                      </Typography>
                    </CardContent>
                  </Card>
                  {index < EventsData.length - 1 && (
                    <Divider sx={{ my: 1 }} />
                  )}
                </React.Fragment>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
