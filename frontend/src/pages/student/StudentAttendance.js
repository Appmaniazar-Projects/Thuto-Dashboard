import React, { useState } from 'react';
import {
  Box, Paper, Typography, Grid, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Chip, FormControl, InputLabel, Select, MenuItem,
  Card, CardContent, LinearProgress
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  CheckCircle as PresentIcon,
  Cancel as AbsentIcon,
  Schedule as LateIcon
} from '@mui/icons-material';

// Mock attendance data
const attendanceData = [
  { date: '2025-01-15', status: 'Present', time: '07:45', note: '' },
  { date: '2025-01-16', status: 'Present', time: '07:50', note: '' },
  { date: '2025-01-17', status: 'Absent', time: '', note: 'Sick leave' },
  { date: '2025-01-18', status: 'Present', time: '07:40', note: '' },
  { date: '2025-01-19', status: 'Late', time: '08:15', note: 'Traffic delay' },
  { date: '2025-01-22', status: 'Present', time: '07:45', note: '' },
  { date: '2025-01-23', status: 'Present', time: '07:55', note: '' },
  { date: '2025-01-24', status: 'Present', time: '07:42', note: '' },
  { date: '2025-01-25', status: 'Absent', time: '', note: 'Doctor appointment' },
  { date: '2025-01-26', status: 'Present', time: '07:48', note: '' },
];

const monthlyStats = {
  totalDays: 20,
  presentDays: 16,
  absentDays: 2,
  lateDays: 2,
  attendanceRate: 90
};

const StudentAttendance = () => {
  const [selectedMonth, setSelectedMonth] = useState('2025-01');
  
  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Present':
        return 'success';
      case 'Absent':
        return 'error';
      case 'Late':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Present':
        return <PresentIcon fontSize="small" />;
      case 'Absent':
        return <AbsentIcon fontSize="small" />;
      case 'Late':
        return <LateIcon fontSize="small" />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        <CalendarIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        My Attendance
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Track your daily attendance and view attendance statistics.
      </Typography>

      {/* Attendance Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="success.main">
                {monthlyStats.presentDays}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Present Days
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="error.main">
                {monthlyStats.absentDays}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Absent Days
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="warning.main">
                {monthlyStats.lateDays}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Late Days
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary.main">
                {monthlyStats.attendanceRate}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Attendance Rate
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={monthlyStats.attendanceRate} 
                sx={{ mt: 1 }}
                color={monthlyStats.attendanceRate >= 90 ? 'success' : 'warning'}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Attendance Records */}
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3} alignItems="center" sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6">
              Attendance Records
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="month-select-label">Select Month</InputLabel>
              <Select
                labelId="month-select-label"
                value={selectedMonth}
                label="Select Month"
                onChange={handleMonthChange}
              >
                <MenuItem value="2025-01">January 2025</MenuItem>
                <MenuItem value="2024-12">December 2024</MenuItem>
                <MenuItem value="2024-11">November 2024</MenuItem>
                <MenuItem value="2024-10">October 2024</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Notes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {attendanceData.map((record, index) => (
                <TableRow key={index}>
                  <TableCell>
                    {new Date(record.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(record.status)}
                      label={record.status}
                      color={getStatusColor(record.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{record.time || '-'}</TableCell>
                  <TableCell>{record.note || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default StudentAttendance;
