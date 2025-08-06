// Create: c:\Users\tiffy\Documents\GitHub\Thuto-Dashboard\frontend\src\pages\parent\ParentAttendance.js

import React, { useState, useMemo } from 'react';
import {
  Box, Paper, Typography, Grid, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Chip, FormControl, InputLabel, Select, MenuItem,
  Card, CardContent, Divider
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  CheckCircle as PresentIcon,
  Cancel as AbsentIcon,
  Schedule as LateIcon,
  PieChart as PieChartIcon
} from '@mui/icons-material';

// Mock data for multiple children
const childrenData = [
  { id: 1, name: 'Emma Thompson', grade: 'Grade 8', class: 'Room 103' },
  { id: 2, name: 'James Thompson', grade: 'Grade 5', class: 'Room 201' }
];

const attendanceData = {
  1: [ // Emma's attendance
    { date: '2025-01-15', status: 'Present', time: '07:45', note: '' },
    { date: '2025-01-16', status: 'Present', time: '07:50', note: '' },
    { date: '2025-01-17', status: 'Absent', time: '', note: 'Sick leave' },
    { date: '2025-01-18', status: 'Present', time: '07:40', note: '' },
    { date: '2025-01-19', status: 'Late', time: '08:15', note: 'Traffic delay' },
    { date: '2025-01-20', status: 'Present', time: '07:48', note: '' },
    { date: '2025-01-21', status: 'Present', time: '07:51', note: '' },
  ],
  2: [ // James's attendance
    { date: '2025-01-15', status: 'Present', time: '07:50', note: '' },
    { date: '2025-01-16', status: 'Present', time: '07:45', note: '' },
    { date: '2025-01-17', status: 'Present', time: '07:48', note: '' },
    { date: '2025-01-18', status: 'Absent', time: '', note: 'Family emergency' },
    { date: '2025-01-19', status: 'Present', time: '07:52', note: '' },
    { date: '2025-01-20', status: 'Absent', time: '', note: 'Dentist appointment' },
    { date: '2025-01-21', status: 'Late', time: '08:05', note: '' },
  ]
};

const ParentAttendance = () => {
  const [selectedChild, setSelectedChild] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState('2025-01');
  
  const handleChildChange = (event) => {
    setSelectedChild(event.target.value);
  };

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Present': return 'success';
      case 'Absent': return 'error';
      case 'Late': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Present': return <PresentIcon fontSize="small" />;
      case 'Absent': return <AbsentIcon fontSize="small" />;
      case 'Late': return <LateIcon fontSize="small" />;
      default: return null;
    }
  };

  const currentChildData = attendanceData[selectedChild] || [];
  const selectedChildInfo = childrenData.find(child => child.id === selectedChild);

  const attendanceSummary = useMemo(() => {
    const summary = {
      Present: 0,
      Absent: 0,
      Late: 0,
      Total: currentChildData.length
    };
    currentChildData.forEach(record => {
      if (summary[record.status] !== undefined) {
        summary[record.status]++;
      }
    });
    return summary;
  }, [currentChildData]);

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          <CalendarIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Children's Attendance
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Track your children's daily attendance records and view attendance statistics.
        </Typography>
        
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="child-select-label">Select Child</InputLabel>
              <Select
                labelId="child-select-label"
                value={selectedChild}
                label="Select Child"
                onChange={handleChildChange}
              >
                {childrenData.map((child) => (
                  <MenuItem key={child.id} value={child.id}>
                    {child.name} - {child.grade}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        {/* Left Column: Attendance Records */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Attendance Log for {selectedChildInfo?.name}
            </Typography>
            <Divider sx={{ mb: 2 }} />
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
                  {currentChildData.map((record, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {new Date(record.date).toLocaleDateString('en-US', {
                          weekday: 'short',
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
                      <TableCell>{record.time || '—'}</TableCell>
                      <TableCell>{record.note || '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Right Column: Attendance Summary */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              <PieChartIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Attendance Summary
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography>Present:</Typography>
                <Typography sx={{ fontWeight: 'bold', color: 'success.main' }}>
                  {attendanceSummary.Present} days
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography>Absent:</Typography>
                <Typography sx={{ fontWeight: 'bold', color: 'error.main' }}>
                  {attendanceSummary.Absent} days
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography>Late:</Typography>
                <Typography sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                  {attendanceSummary.Late} days
                </Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Total School Days:</Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {attendanceSummary.Total}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ParentAttendance;