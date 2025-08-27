import React, { useState, useEffect } from 'react';
import {
  Box, 
  Paper, 
  Typography, 
  Grid, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Card, 
  CardContent, 
  LinearProgress,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  CheckCircle as PresentIcon,
  Cancel as AbsentIcon,
  EmojiEvents as AchievementIcon
} from '@mui/icons-material';
import studentService from '../../services/studentService';
import { format, parseISO } from 'date-fns';

const StudentAttendance = () => {
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await studentService.getAttendance(selectedMonth);
        setAttendanceData(response.data);
      } catch (err) {
        setError('Failed to load attendance data. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [selectedMonth]);

  // Function to generate month options for the dropdown
  const generateMonthOptions = () => {
    const months = [];
    const date = new Date();
    
    for (let i = 0; i < 12; i++) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      months.unshift({
        value: `${year}-${month}`,
        label: date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long'
        })
      });
      date.setMonth(date.getMonth() - 1);
    }
    return months;
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header with Title and Month Filter */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          My Attendance
        </Typography>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Select Month</InputLabel>
          <Select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            label="Select Month"
            disabled={loading}
          >
            {generateMonthOptions().map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card elevation={2}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <PresentIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6" color="textSecondary">
                  Present Days
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {attendanceData?.summary.presentDays || 0}
                <Typography component="span" color="textSecondary"> days</Typography>
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={attendanceData?.summary.attendanceRate || 0}
                color="success"
                sx={{ mt: 2, height: 8, borderRadius: 4 }}
              />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card elevation={2}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <AbsentIcon color="error" sx={{ mr: 1 }} />
                <Typography variant="h6" color="textSecondary">
                  Absent Days
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {attendanceData?.summary.absentDays || 0}
                <Typography component="span" color="textSecondary"> days</Typography>
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={(attendanceData?.summary.absentDays / (attendanceData?.summary.presentDays + attendanceData?.summary.absentDays || 1)) * 100}
                color="error"
                sx={{ mt: 2, height: 8, borderRadius: 4 }}
              />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card elevation={2}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <AchievementIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" color="textSecondary">
                  Attendance Rate
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {`${attendanceData?.summary.attendanceRate || 0}%`}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={attendanceData?.summary.attendanceRate || 0}
                color="primary"
                sx={{ mt: 2, height: 8, borderRadius: 4 }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Attendance Table */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Attendance Details
        </Typography>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4}}><CircularProgress /></Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell>Teacher</TableCell>
                <TableCell>Remarks</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {attendanceData && attendanceData.details.length > 0 ? (
                attendanceData.details.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{format(parseISO(record.date), 'MMMM d, yyyy')}</TableCell>
                    <TableCell>
                      <Chip 
                        label={record.status}
                        color={record.status === 'Present' ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{record.subject}</TableCell>
                    <TableCell>{record.teacher}</TableCell>
                    <TableCell>{record.remarks || 'N/A'}</TableCell>
                  </TableRow>
                ))
              ) : (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography color="textSecondary">
                    No attendance records found for this month.
                  </Typography>
                </TableCell>
              </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        )}
      </Paper>
    </Box>
  );
};

export default StudentAttendance;
